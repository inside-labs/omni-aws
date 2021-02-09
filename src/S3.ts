import { S3 as AwsS3 } from '@aws-sdk/client-s3';
import { CognitoCredentials } from './CognitoIdentity';
import { Readable } from 'stream';

export type StorageContent = Buffer | Uint8Array | Blob | string;

export type BucketSummary = {
  name: string;
};

export type S3ObjectSummary = {
  key: string;
  lastModified: Date;
  // in bytes
  size: number;
  owner?: string;
};

export type GetObjectOutput = {
  body: string;
  contentType?: string;
  contentEncoding?: string;
};

export class S3 {
  private readonly s3: AwsS3;

  constructor(s3: AwsS3 = new AwsS3({})) {
    this.s3 = s3;
  }

  static withCredentials(credentials?: CognitoCredentials) {
    return new S3(new AwsS3({ credentials }));
  }

  async putObject<T extends StorageContent>(
    bucket: string,
    key: string,
    value: T,
    contentType?: string,
    contentEncoding?: string
  ): Promise<void> {
    await this.s3.putObject({
      Bucket: bucket,
      Key: key,
      Body: value,
      ContentType: contentType,
      ContentEncoding: contentEncoding,
    });
  }

  async getObject(bucket: string, key: string): Promise<GetObjectOutput | undefined> {
    const content = await this.s3.getObject({ Bucket: bucket, Key: key });
    if (!content.Body || content.DeleteMarker || !(content.Body instanceof Readable)) {
      return undefined;
    }
    /*
      in NodeJS, a Readable is returned,
     */

    let result: string = '';
    for await (const chunk of content.Body) {
      result += chunk;
    }
    return {
      body: result,
      contentEncoding: content.ContentEncoding,
      contentType: content.ContentType,
    };
  }

  async deleteObject(bucket: string, key: string): Promise<void> {
    await this.s3.deleteObject({ Bucket: bucket, Key: key });
  }

  async listObjects(bucket: string): Promise<S3ObjectSummary[]> {
    const objects = await this.s3.listObjects({ Bucket: bucket });
    return (
      objects.Contents?.map(content => ({
        key: content.Key!!,
        lastModified: content.LastModified!!,
        size: content.Size!!,
        owner: content.Owner?.DisplayName,
      })) ?? []
    );
  }

  async listBuckets(): Promise<BucketSummary[]> {
    const buckets = await this.s3.listBuckets({});
    return (
      buckets.Buckets?.map(bucket => ({
        name: bucket.Name!!,
      })) ?? []
    );
  }
}

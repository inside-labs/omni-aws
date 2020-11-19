import { S3 as AwsS3 } from 'aws-sdk';
import { CognitoCredentials } from './CognitoIdentity';

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

export class S3 {
  private readonly s3: AwsS3;

  constructor(s3: AwsS3 = new AwsS3()) {
    this.s3 = s3;
  }

  static withCredentials(credentials?: CognitoCredentials) {
    return new S3(new AwsS3({ credentials }));
  }

  async putObject<T extends StorageContent>(bucket: string, key: string, value: T): Promise<void> {
    await this.s3.putObject({ Bucket: bucket, Key: key, Body: value }).promise();
  }

  async getObject(bucket: string, key: string): Promise<Buffer | undefined> {
    const content = await this.s3.getObject({ Bucket: bucket, Key: key }).promise();
    if (!content.Body || content.DeleteMarker) {
      return undefined;
    }
    /*
      in NodeJS, a Buffer is returned, see https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property
     */
    return content.Body as Buffer;
  }

  async deleteObject(bucket: string, key: string): Promise<void> {
    await this.s3.deleteObject({ Bucket: bucket, Key: key }).promise();
  }

  async listObjects(bucket: string): Promise<S3ObjectSummary[]> {
    const objects = await this.s3.listObjects({ Bucket: bucket }).promise();
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
    const buckets = await this.s3.listBuckets().promise();
    return (
      buckets.Buckets?.map(bucket => ({
        name: bucket.Name!!,
      })) ?? []
    );
  }
}

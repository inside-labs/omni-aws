import { CognitoIdentity as AwsCognitoIdentity } from 'aws-sdk';

export type IdentityPoolSummary = {
  id: string;
  name: string;
};

export type Credentials = {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  expiration: Date;
};

export class CognitoIdentity {
  private readonly cognitoIdentity: AwsCognitoIdentity;

  constructor(awsCognitoIdentity: AwsCognitoIdentity = new AwsCognitoIdentity()) {
    this.cognitoIdentity = awsCognitoIdentity;
  }

  async getIdentityId(identityPoolId: string, provider: string, identityToken: string): Promise<string> {
    const identity = await this.cognitoIdentity
      .getId({
        IdentityPoolId: identityPoolId,
        Logins: { [provider]: identityToken },
      })
      .promise();
    return identity.IdentityId!!;
  }

  async getCredentials(identityId: string, provider: string, identityToken: string): Promise<Credentials> {
    const identity = await this.cognitoIdentity
      .getCredentialsForIdentity({
        IdentityId: identityId,
        Logins: {
          [provider]: identityToken,
        },
      })
      .promise();
    return {
      accessKeyId: identity.Credentials?.AccessKeyId!!,
      secretAccessKey: identity.Credentials?.SecretKey!!,
      sessionToken: identity.Credentials?.SessionToken!!,
      expiration: identity.Credentials?.Expiration!!,
    };
  }

  /*
    there can be a maximum of 60 identity pools returned
   */
  async listIdentityPools(maxResults: number = 60): Promise<IdentityPoolSummary[]> {
    const identityPools = await this.cognitoIdentity.listIdentityPools({ MaxResults: maxResults }).promise();
    return (
      identityPools.IdentityPools?.map(pool => ({
        id: pool.IdentityPoolId!!,
        name: pool.IdentityPoolName!!,
      })) ?? []
    );
  }
}

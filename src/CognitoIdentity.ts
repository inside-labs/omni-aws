import { CognitoIdentity as AwsCognitoIdentity } from '@aws-sdk/client-cognito-identity';
import { CognitoIdentityProvider, DeliveryMediumType, UserStatusType } from '@aws-sdk/client-cognito-identity-provider';

export type IdentityPoolSummary = {
  id: string;
  name: string;
};

export type UserPoolSummary = {
  id: string;
  name: string;
  status: string;
};

export type UserPoolClientSummary = {
  id: string;
  name: string;
};

export type CognitoCredentials = {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  expiration: Date;
};

export type CognitoAuthentication = {
  accessToken: string;
  /**
   * The expiration period of the authentication result in seconds.
   */
  expiresIn: number;
  tokenType: string;
  refreshToken: string;
  idToken: string;
};

export type CognitoCustomAuthChallenge = {
  challengeName: string;
  session: string;
  challengeParameters: Record<string, any>;
};

export type CognitoSignUp = {
  userId: string;
  confirmed: boolean;
};

type CognitoUser = {
  username: string;
  mfaOptions?: { deliveryMedium?: DeliveryMediumType | string; attributeName?: string }[];
  preferredMfaSetting?: string;
  enabled?: boolean;
  userAttributes?: Record<string, string>;
  createdAt?: Date;
  modifiedAt?: Date;
  status?: UserStatusType | string;
  userMFASettings?: string[];
};

export class CognitoIdentity {
  private readonly cognitoIdentity: AwsCognitoIdentity;
  private readonly cognitoIdentityServiceProvider: CognitoIdentityProvider;

  constructor(
    awsCognitoIdentity: AwsCognitoIdentity = new AwsCognitoIdentity({}),
    awsCognitoServiceProvider: CognitoIdentityProvider = new CognitoIdentityProvider({})
  ) {
    this.cognitoIdentity = awsCognitoIdentity;
    this.cognitoIdentityServiceProvider = awsCognitoServiceProvider;
  }

  async signUp(clientId: string, username: string, password: string): Promise<CognitoSignUp> {
    const signUpResult = await this.cognitoIdentityServiceProvider.signUp({
      ClientId: clientId,
      Username: username,
      Password: password,
    });
    return {
      userId: signUpResult.UserSub!!,
      confirmed: signUpResult.UserConfirmed!!,
    };
  }

  async passwordLogin(clientId: string, username: string, password: string): Promise<CognitoAuthentication> {
    const auth = await this.cognitoIdentityServiceProvider.initiateAuth({
      ClientId: clientId,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: { USERNAME: username, PASSWORD: password },
    });
    if (!auth.AuthenticationResult) {
      throw new Error(`No authentication received. ChallengeName ${auth.ChallengeName}`);
    }
    return {
      accessToken: auth.AuthenticationResult?.AccessToken!!,
      expiresIn: auth.AuthenticationResult?.ExpiresIn!!,
      tokenType: auth.AuthenticationResult?.TokenType!!,
      idToken: auth.AuthenticationResult?.IdToken!!,
      refreshToken: auth.AuthenticationResult?.RefreshToken!!,
    };
  }

  async setPassword(userPoolId: string, username: string, password: string, permanent: boolean) {
    await this.cognitoIdentityServiceProvider.adminSetUserPassword({
      UserPoolId: userPoolId,
      Username: username,
      Password: password,
      Permanent: permanent,
    });
  }

  async initiateCustomAuth(clientId: string, username: string): Promise<CognitoCustomAuthChallenge> {
    const response = await this.cognitoIdentityServiceProvider.initiateAuth({
      ClientId: clientId,
      AuthFlow: 'CUSTOM_AUTH',
      AuthParameters: { USERNAME: username },
    });
    return {
      challengeName: response.ChallengeName!!,
      challengeParameters: response.ChallengeParameters!!,
      session: response.Session!!,
    };
  }

  async answerCustomChallenge(
    clientId: string,
    username: string,
    session: string,
    answer: string
  ): Promise<CognitoAuthentication | CognitoCustomAuthChallenge> {
    const auth = await this.cognitoIdentityServiceProvider.respondToAuthChallenge({
      ChallengeName: 'CUSTOM_CHALLENGE',
      ClientId: clientId,
      ChallengeResponses: { USERNAME: username, ANSWER: answer },
      Session: session,
    });
    if (auth.ChallengeName === 'CUSTOM_CHALLENGE') {
      // user did not enter the correct code
      return {
        challengeName: auth.ChallengeName!!,
        challengeParameters: auth.ChallengeParameters!!,
        session: auth.Session!!,
      };
    }
    return {
      accessToken: auth.AuthenticationResult?.AccessToken!!,
      expiresIn: auth.AuthenticationResult?.ExpiresIn!!,
      tokenType: auth.AuthenticationResult?.TokenType!!,
      idToken: auth.AuthenticationResult?.IdToken!!,
      refreshToken: auth.AuthenticationResult?.RefreshToken!!,
    };
  }

  async refreshToken(clientId: string, refreshToken: string): Promise<CognitoAuthentication> {
    const auth = await this.cognitoIdentityServiceProvider.initiateAuth({
      ClientId: clientId,
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    });
    return {
      accessToken: auth.AuthenticationResult?.AccessToken!!,
      expiresIn: auth.AuthenticationResult?.ExpiresIn!!,
      tokenType: auth.AuthenticationResult?.TokenType!!,
      idToken: auth.AuthenticationResult?.IdToken!!,
      refreshToken: refreshToken,
    };
  }

  async findUserByEmail(userPoolId: string, email: string): Promise<CognitoUser[] | undefined> {
    const result = await this.cognitoIdentityServiceProvider.listUsers({
      UserPoolId: userPoolId,
      Filter: `email=\"${email}\"`,
    });
    result.Users?.map(user => ({
      userAttributes: user.Attributes,
    }));

    return result.Users?.map(user => ({
      username: user.Username!!,
      userAttributes: user.Attributes?.reduce((prev, current) => {
        if (current.Name && current.Value) {
          prev[current.Name] = current.Value;
        }
        return prev;
      }, {} as Record<string, string>),
      status: user.UserStatus,
      createdAt: user.UserCreateDate,
      modifiedAt: user.UserLastModifiedDate,
      enabled: user.Enabled,
      mfaOptions: user.MFAOptions?.map(option => ({
        attributeName: option.AttributeName,
        deliveryMedium: option.DeliveryMedium,
      })),
    }));
  }

  async getUser(userPoolId: string, username: string): Promise<CognitoUser> {
    const user = await this.cognitoIdentityServiceProvider.adminGetUser({ UserPoolId: userPoolId, Username: username });
    return {
      username: user.Username!!,
      status: user.UserStatus,
      createdAt: user.UserCreateDate,
      modifiedAt: user.UserLastModifiedDate,
      enabled: user.Enabled,
      mfaOptions: user.MFAOptions?.map(option => ({
        attributeName: option.AttributeName,
        deliveryMedium: option.DeliveryMedium,
      })),
      preferredMfaSetting: user.PreferredMfaSetting,
      userAttributes: user.UserAttributes?.reduce((prev, current) => {
        if (current.Name && current.Value) {
          prev[current.Name] = current.Value;
        }
        return prev;
      }, {} as Record<string, string>),
      userMFASettings: user.UserMFASettingList,
    };
  }

  async updateUserAttributes(userPoolId: string, username: string, userAttributes: Record<string, string>) {
    const attributes = Object.keys(userAttributes).map(name => ({ Name: name, Value: userAttributes[name] }));
    await this.cognitoIdentityServiceProvider.adminUpdateUserAttributes({
      UserPoolId: userPoolId,
      Username: username,
      UserAttributes: attributes,
    });
  }

  async updateEmail(userPoolId: string, username: string, email: string) {
    await this.cognitoIdentityServiceProvider.adminUpdateUserAttributes({
      UserPoolId: userPoolId,
      Username: username,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'email_verified', Value: 'true' },
      ],
    });
  }

  async getIdentityId(identityPoolId: string, provider: string, identityToken: string): Promise<string> {
    const identity = await this.cognitoIdentity.getId({
      IdentityPoolId: identityPoolId,
      Logins: { [provider]: identityToken },
    });
    return identity.IdentityId!!;
  }

  async getCredentials(identityId: string, provider: string, identityToken: string): Promise<CognitoCredentials> {
    const identity = await this.cognitoIdentity.getCredentialsForIdentity({
      IdentityId: identityId,
      Logins: {
        [provider]: identityToken,
      },
    });
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
    const identityPools = await this.cognitoIdentity.listIdentityPools({ MaxResults: maxResults });
    return (
      identityPools.IdentityPools?.map(pool => ({
        id: pool.IdentityPoolId!!,
        name: pool.IdentityPoolName!!,
      })) ?? []
    );
  }

  async listUserPools(maxResults: number = 60): Promise<UserPoolSummary[]> {
    const userPools = await this.cognitoIdentityServiceProvider.listUserPools({ MaxResults: maxResults });
    return (
      userPools.UserPools?.map(pool => ({
        id: pool.Id!!,
        name: pool.Name!!,
        status: pool.Status!!,
      })) ?? []
    );
  }

  async listUserPoolClients(userPoolId: string, maxResults: number = 60): Promise<UserPoolClientSummary[]> {
    const userPoolClients = await this.cognitoIdentityServiceProvider.listUserPoolClients({
      UserPoolId: userPoolId,
      MaxResults: maxResults,
    });
    return (
      userPoolClients.UserPoolClients?.map(client => ({
        id: client.ClientId!!,
        name: client.ClientName!!,
      })) ?? []
    );
  }
}

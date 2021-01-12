import { CognitoAuthentication, CognitoIdentity } from '../src';

const clientId: string = process.env.COGNITO_CLIENT_ID!!;
const userPoolId: string = process.env.COGNITO_USER_POOL_ID!!;
const username: string = process.env.COGNITO_USERNAME!!;
const password: string = process.env.COGNITO_USER_PASSWORD!!;

describe('CognitoIdentity integration tests', () => {
  test('returns a list of all identity pools', async () => {
    const cognitoIdentity = new CognitoIdentity();
    const poolSummaries = await cognitoIdentity.listIdentityPools();
    console.log(poolSummaries);
    expect(poolSummaries.length).toBeGreaterThanOrEqual(1);
  });

  test('sign up', async () => {
    const cognitoIdentity = new CognitoIdentity();
    const result = await cognitoIdentity.signUp(clientId, username, '12345678');
    console.log(result);
    expect(result.userId).toBeDefined();
    expect(result.confirmed).toBeDefined();
  });

  test('login with password', async () => {
    const cognitoIdentity = new CognitoIdentity();
    const credentials = await cognitoIdentity.passwordLogin(clientId, username, password);
    console.log(credentials);
    expect(credentials.idToken).toBeDefined();
    expect(credentials.accessToken).toBeDefined();
    expect(credentials.refreshToken).toBeDefined();
    expect(credentials.tokenType).toBeDefined();
    expect(credentials.expiresIn).toBeDefined();
  });

  test('initiate custom auth flow', async () => {
    const cognitoIdentity = new CognitoIdentity();
    const response = await cognitoIdentity.initiateCustomAuth(clientId, username);
    console.log(response);
    expect(response.challengeName).toBeDefined();
    expect(response.session).toBeDefined();
  });

  test('answer custom challenge', async () => {
    const cognitoIdentity = new CognitoIdentity();
    const credentials = (await cognitoIdentity.answerCustomChallenge(
      clientId,
      username,
      '',
      ''
    )) as CognitoAuthentication;
    expect(credentials.idToken).toBeDefined();
    expect(credentials.accessToken).toBeDefined();
    expect(credentials.refreshToken).toBeDefined();
    expect(credentials.tokenType).toBeDefined();
    expect(credentials.expiresIn).toBeDefined();
  });

  test('refreshing token', async () => {
    const cognitoIdentity = new CognitoIdentity();
    const passwordCredentials = await cognitoIdentity.passwordLogin(clientId, username, password);
    const refreshedCredentials = await cognitoIdentity.refreshToken(clientId, passwordCredentials.refreshToken);
    console.log(refreshedCredentials);
    expect(refreshedCredentials.idToken).toBeDefined();
    expect(refreshedCredentials.accessToken).toBeDefined();
    expect(refreshedCredentials.refreshToken).toBeDefined();
    expect(refreshedCredentials.tokenType).toBeDefined();
    expect(refreshedCredentials.expiresIn).toBeDefined();
  });

  test.only('updates user attributes', async () => {
    const cognitoIdentity = new CognitoIdentity();
    const email = 'curdin+2@insidelabs.tech';
    await cognitoIdentity.updateEmail(userPoolId, 'curdin+3@insidelabs.tech', email);
    const cognitoUser = await cognitoIdentity.getUser(userPoolId, email);
    console.log(cognitoUser);
    expect(cognitoUser?.userAttributes?.email).toEqual(email);
  });
});

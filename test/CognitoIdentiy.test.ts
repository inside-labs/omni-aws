import { CognitoIdentity } from '../src';

const clientId: string = process.env.COGNITO_CLIENT_ID!!;
const username: string = process.env.COGNITO_USERNAME!!;
const password: string = process.env.COGNITO_USER_PASSWORD!!;

describe.skip('CognitoIdentity integration tests', () => {
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
    expect(response.challengeName).toBeDefined();
    expect(response.session).toBeDefined();
  });

  test('answer custom challenge', async () => {
    const cognitoIdentity = new CognitoIdentity();
    const credentials = await cognitoIdentity.answerCustomChallenge(
      clientId,
      username,
      'AYABeP3V6G-Ek4ahQelAlYVno3EAHQABAAdTZXJ2aWNlABBDb2duaXRvVXNlclBvb2xzAAEAB2F3cy1rbXMATmFybjphd3M6a21zOmV1LWNlbnRyYWwtMTo1OTA0OTA4MDk4NTg6a2V5LzRkMmU1YTdmLTFjZDctNDljOS04ZmFjLTJkOWRjYjVjZWY5ZgC4AQIBAHg-pjuNKvPKxtnKU3PADgyxqGsH7MeCPUPkKqeoBvImXgGO0Zg_LhBtcF4zdZBu3r2oAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMHWIVsVTUtTzFklMNAgEQgDuCH_YudX66Mi5Ufh6XmPj3zkSU_w-RQ8q_teELkDArYUFjNhFPdhhwJ2viUUYGcSsFJUQ2LHGj2DhaNgIAAAAADAAAEAAAAAAAAAAAAAAAAAC91_mYVvvQZCHueSTirFrU_____wAAAAEAAAAAAAAAAAAAAAEAAAEnBhW-BvB2lIyAr1nu3RizyZdsEHmZ3Sb9vamiEPew-neWnvu-4seJ0sdzCyWEHymTA5oTMab6nLTcDIVvXemz0DwNbmuXN3KEtO1csc4HQw7fhXJQHmVTBxZCZk2ukQqtrKOqdXo4KMrx9-4E7bf6ibR7MJ8Kh4us2iOwfDVYGFJzJAr-oUecnZ7UspR7v0EIl5W_2jGPuSoginhW7ne1h7xwrrcme-JM9lSJzZhTvVmH7D6U4dmQTdAa6UmrumhJJlOyM_Yoc-jWOKAo6UYOslYGuEmOd9mCgNuqm373Ri4iUqT7kDrQGH9MzShKvCBh0AtHe9EbtE9XJUUuxzKI8KM4MBTX4R_frnoIkLbDUoPL9ZBMvZZSZUC0xf6ql641nhqnLTOtmZW0cTdmAyCEInN6_JGZdM8',
      '445407'
    );
    expect(credentials.idToken).toBeDefined();
    expect(credentials.accessToken).toBeDefined();
    expect(credentials.refreshToken).toBeDefined();
    expect(credentials.tokenType).toBeDefined();
    expect(credentials.expiresIn).toBeDefined();
  });
});

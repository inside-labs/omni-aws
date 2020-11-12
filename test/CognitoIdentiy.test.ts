import { CognitoIdentity } from '../src';

describe.skip('CognitoIdentity integration tests', () => {
  test('returns a list of all identity pools', async () => {
    const cognitoIdentity = new CognitoIdentity();
    const poolSummaries = await cognitoIdentity.listIdentityPools();
    console.log(poolSummaries);
    expect(poolSummaries.length).toBeGreaterThanOrEqual(1);
  });
});

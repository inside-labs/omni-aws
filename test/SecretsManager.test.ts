import { SecretsManager } from '../src';

describe('SecretsManager integration tests', () => {
  test('handles crud operations of key value secrets', async () => {
    const secretsManager = new SecretsManager();
    const name = `test-secret-${Math.random()}`;
    const expectedContent = {
      some: 'value',
      another: 'one',
    };
    await secretsManager.createKeyValueSecret(name, 'Secret from omni-aws test', expectedContent);
    const actualContent = await secretsManager.getKeyValueSecret(name);

    expect(actualContent).toMatchObject(expectedContent);

    await secretsManager.deleteSecret(name);
    const secrets = await secretsManager.listSecrets();

    expect(secrets.map(secret => secret.name)).not.toContain(name);
  });
});

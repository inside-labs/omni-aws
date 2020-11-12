import { SecretsManager as AwsSecretsManager } from 'aws-sdk';

export type SecretSummary = {
  name: string;
};

type CreateSecretResponse = {
  arn: string;
  name: string;
};

export type DbSecret = {
  username: string;
  password: string;
  dbname: string;
  port: number;
  host: string;
};

export class SecretsManager {
  private readonly secretsManager: AwsSecretsManager;

  constructor(secretsManager: AwsSecretsManager = new AwsSecretsManager()) {
    this.secretsManager = secretsManager;
  }

  async getKeyValueSecret<T>(secretId: string): Promise<T | undefined> {
    const secret = await this.secretsManager.getSecretValue({ SecretId: secretId }).promise();
    if (!secret.SecretString) {
      return;
    }
    return JSON.parse(secret.SecretString);
  }

  async createKeyValueSecret(
    name: string,
    description: string,
    content: Record<string, string>
  ): Promise<CreateSecretResponse> {
    const secret = await this.secretsManager
      .createSecret({ Name: name, Description: description, SecretString: JSON.stringify(content) })
      .promise();

    return {
      arn: secret.ARN!!,
      name: secret.Name!!,
    };
  }

  async deleteSecret(secretName: string): Promise<void> {
    await this.secretsManager.deleteSecret({ SecretId: secretName });
  }

  async getPlainTextSecret(secretId: string): Promise<string | undefined> {
    const secret = await this.secretsManager.getSecretValue({ SecretId: secretId }).promise();
    return secret.SecretString;
  }

  async createPlainTextSecret(name: string, description: string, content: string): Promise<CreateSecretResponse> {
    const secret = await this.secretsManager
      .createSecret({ Name: name, Description: description, SecretString: content })
      .promise();
    return {
      arn: secret.ARN!!,
      name: secret.Name!!,
    };
  }

  async listSecrets(): Promise<SecretSummary[]> {
    const secrets = await this.secretsManager.listSecrets().promise();
    return (
      secrets.SecretList?.map(secret => ({
        name: secret.Name!!,
      })) ?? []
    );
  }
}

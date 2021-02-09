import { SecretsManager as AwsSecretsManager } from '@aws-sdk/client-secrets-manager';
import { CognitoCredentials } from './CognitoIdentity';

export type SecretSummary = {
  name: string;
};

export type CreateSecretResponse = {
  arn: string;
  name: string;
};

export type UpdateSecretResponse = {
  arn: string;
  name: string;
};

export class SecretsManager {
  private readonly secretsManager: AwsSecretsManager;

  constructor(secretsManager: AwsSecretsManager = new AwsSecretsManager({})) {
    this.secretsManager = secretsManager;
  }

  static withCredentials(credentials?: CognitoCredentials) {
    return new SecretsManager(new AwsSecretsManager({ credentials }));
  }

  async getKeyValueSecret<T>(secretId: string): Promise<T | undefined> {
    const secret = await this.secretsManager.getSecretValue({ SecretId: secretId });
    if (!secret.SecretString) {
      return;
    }
    return JSON.parse(secret.SecretString);
  }

  async createKeyValueSecret(
    name: string,
    description: string,
    content: Record<string, any>
  ): Promise<CreateSecretResponse> {
    const secret = await this.secretsManager.createSecret({
      Name: name,
      Description: description,
      SecretString: JSON.stringify(content),
    });

    return {
      arn: secret.ARN!!,
      name: secret.Name!!,
    };
  }

  async updateKeyValueSecret(name: string, content: Record<string, any>): Promise<UpdateSecretResponse> {
    const secret = await this.secretsManager.updateSecret({
      SecretId: name,
      SecretString: JSON.stringify(content),
    });
    return {
      arn: secret.ARN!!,
      name: secret.Name!!,
    };
  }

  async deleteSecret(secretName: string): Promise<void> {
    await this.secretsManager.deleteSecret({ SecretId: secretName });
  }

  async getPlainTextSecret(secretId: string): Promise<string | undefined> {
    const secret = await this.secretsManager.getSecretValue({ SecretId: secretId });
    return secret.SecretString;
  }

  async createPlainTextSecret(name: string, description: string, content: string): Promise<CreateSecretResponse> {
    const secret = await this.secretsManager.createSecret({
      Name: name,
      Description: description,
      SecretString: content,
    });
    return {
      arn: secret.ARN!!,
      name: secret.Name!!,
    };
  }

  async updatePlainTextSecret(name: string, content: string): Promise<UpdateSecretResponse> {
    const secret = await this.secretsManager.updateSecret({
      SecretId: name,
      SecretString: content,
    });
    return {
      arn: secret.ARN!!,
      name: secret.Name!!,
    };
  }

  async listSecrets(): Promise<SecretSummary[]> {
    const secrets = await this.secretsManager.listSecrets({});
    return (
      secrets.SecretList?.map(secret => ({
        name: secret.Name!!,
      })) ?? []
    );
  }
}

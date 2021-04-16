import { SESClient } from '../src';

describe.skip('SESClient integration tests', () => {
  test.only('sends formatted email', async () => {
    const sesClient = new SESClient();
    await sesClient.sendMail({
      source: { address: 'curdin@insidelabs.tech' },
      destinationAddresses: { to: ['curdin+1@insidelabs.tech'] },
      message: { body: { text: { data: 'test message' } }, subject: { data: 'Test subject' } },
    });
  });
});

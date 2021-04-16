import { SendEmailCommand, SendTemplatedEmailCommand, SESClient as AwsSESClient } from '@aws-sdk/client-ses';
import { CognitoCredentials } from './CognitoIdentity';

export type SESMailDestination = {
  to: string[];
  cc?: string[];
  bcc?: string[];
};

export type SESMailSource = {
  // chose either address or arn
  address?: string;
  arn?: string;
};

export type SESMailContent = {
  data?: string;
  charset?: string;
};

export type SESMailMessage = {
  subject: SESMailContent;
  body: {
    html?: SESMailContent;
    text?: SESMailContent;
  };
};

export type SESMail = {
  destinationAddresses: SESMailDestination;
  source: SESMailSource;
  message: SESMailMessage;
};

export type SESTemplateMail = {
  destinationAddresses: SESMailDestination;
  source: SESMailSource;
  template: {
    // chose either name or arn
    name?: string;
    arn?: string;
    // see https://docs.aws.amazon.com/ses/latest/DeveloperGuide/send-personalized-email-api.html
    data: string;
  };
};

export type SESSendEmailResult = {
  messageId: string;
};

export class SESClient {
  private readonly awsSesClient: AwsSESClient;

  constructor(awsSesClient: AwsSESClient = new AwsSESClient({})) {
    this.awsSesClient = awsSesClient;
  }

  static withCredentials(credentials?: CognitoCredentials) {
    return new AwsSESClient({ credentials });
  }

  async sendMail(mail: SESMail): Promise<SESSendEmailResult> {
    const sendEmailCommand = new SendEmailCommand({
      Destination: {
        ToAddresses: mail.destinationAddresses.to,
        CcAddresses: mail.destinationAddresses.cc,
        BccAddresses: mail.destinationAddresses.bcc,
      },
      Source: mail.source.address,
      SourceArn: mail.source.arn,
      Message: {
        Subject: {
          Data: mail.message.subject.data,
          Charset: mail.message.subject.charset,
        },
        Body: {
          Html: {
            Data: mail.message.body.html?.data,
            Charset: mail.message.body.html?.charset,
          },
          Text: {
            Data: mail.message.body.text?.data,
            Charset: mail.message.body.text?.charset,
          },
        },
      },
    });
    const result = await this.awsSesClient.send(sendEmailCommand);

    return {
      messageId: result.MessageId!,
    };
  }

  async sendTemplateMail(mail: SESTemplateMail) {
    new SendTemplatedEmailCommand({
      Destination: {
        ToAddresses: mail.destinationAddresses.to,
        CcAddresses: mail.destinationAddresses.cc,
        BccAddresses: mail.destinationAddresses.bcc,
      },
      Source: mail.source.address,
      SourceArn: mail.source.arn,
      Template: mail.template.name,
      TemplateArn: mail.template.arn,
      TemplateData: mail.template.data,
    });
  }
}

import { decorate, inject, injectable } from 'inversify';
import { Axios } from 'axios';
import { MODULE_TOKENS } from '@app/ioc/tokens';
import { Env } from '@app/internal/env';
import Deasyncify from 'deasyncify';

export interface SendSmsArgs<K extends string | string[]> {
  /** number or numbers to send the number to */
  to: K;
  /** Message to be sent */
  message: string;
  /** `dnd` - send message on dnd
   *
   *  `no_dnd` - send message might be ignored on dnd
   *
   *  `international` - send message internationally
   */
  route?: 'dnd' | 'no_dnd' | 'international';
}

export interface SendSingleSMSResponse
  extends Partial<{
    code: number;
    data: {
      id: string;
      phone_number: string;
      reference: string;
      status: string;
    };
    errors: any;
    message: string;
    status: string;
  }> {}

export interface SendBulkSMSResponse
  extends Partial<{
    code: number;
    data: {
      business_id: string;
      total_contacts: number;
      created_at: string;
      updated_at: string;
    };
    errors: any;
    message: string;
    status: string;
  }> {}

export type SendSMSResponse<T> =
  T extends Array<string> ? SendBulkSMSResponse : SendSingleSMSResponse;

export type SendEmailArgs = {
  to: { email: string; name?: string }[];
  from: { email: string; name?: string };
  subject: string;
  message_body: { type: string; value: string };
};

decorate(injectable(), Axios);

@injectable()
export class SendChampHttpClient extends Axios {
  private readonly public_access_key = this.env.get(
    'SENDCHAMP_PUBLIC_ACCESS_KEY',
  );

  private readonly sender_id = this.env.get('SENDCHAMP_SENDER_ID');

  public constructor(@inject(MODULE_TOKENS.Env) private readonly env: Env) {
    super({
      baseURL: 'https://api.sendchamp.com/api/v1',
      headers: {
        Authorization: `Bearer ${env.get('SENDCHAMP_PUBLIC_ACCESS_KEY')}`,
        'Content-Type': 'application/json',
      },

      validateStatus: (status) => status >= 200 && status < 300,
      transformResponse: (data, headers) => {
        if (headers?.['content-type']?.includes?.('application/json')) {
          return JSON.parse(data);
        }
        return data;
      },
    });
  }

  public getAuth(): string {
    return this.public_access_key;
  }

  public getSenderId(): string {
    return this.sender_id;
  }
}

@injectable()
export class SendChamp {
  private readonly endpoints = {
    sms: '/sms/send',
    sendOtp: '/verification/create',
    verifyOtp: '/verification/confirm',
    whatsappNumberValidation: '/whatsapp/validate',
    sendEmail: '/email/send',
  };

  constructor(
    @inject(MODULE_TOKENS.SendChampHttpClient)
    private readonly sendChampHttpClient: SendChampHttpClient,
  ) {}

  public async sendSms<T extends string | string[]>({
    to,
    message,
    route = 'dnd',
  }: SendSmsArgs<T>): Promise<SendSMSResponse<T>> {
    const smsRoute = this.endpoints.sms;
    const sender_name = this.sendChampHttpClient.getSenderId();

    const data = JSON.stringify({ to, message, route, sender_name });

    const [response, error] = await Deasyncify.watch(
      this.sendChampHttpClient.post(smsRoute, data),
    );

    if (error != null) {
      Error.captureStackTrace(error, error.constructor);
      throw error;
    }

    return response.data;
  }

  public async sendEmail({ to, from, subject, message_body }: SendEmailArgs) {
    const emailRoute = this.endpoints.sendEmail;
    const data = JSON.stringify({ to, from, subject, message_body });

    const [response, error] = await Deasyncify.watch(
      this.sendChampHttpClient.post(emailRoute, data),
    );

    if (error != null) {
      Error.captureStackTrace(error, error.constructor);
      throw error;
    }

    return response.data;
  }
}

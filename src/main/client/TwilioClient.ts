import twilio, { Twilio } from 'twilio';
import { ITwilioClient, ITextResult } from '../../model';

class TwilioClient implements ITwilioClient {
    private twilio?: Twilio;
    private number = "";
    public constructor(twilioClient?: any) {
        if (twilioClient) {
            this.twilio = twilioClient;
        } else {
            const {
                TWILIO_ACCOUNT_SID,
                TWILIO_AUTH_TOKEN,
                TWILIO_NUMBER
            } = process.env;
            if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_NUMBER) {
                throw new Error('Missing required twilio parameters in environment');
            }
            this.twilio = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
            this.number = TWILIO_NUMBER;
        }
        
    }

    public async sendText(to: string, message: string): Promise<ITextResult> {
        if (!this.twilio) {
            throw new Error('Attempted to send message with uninitialized twilio client');
        }
        const res = await this.twilio.messages.create({ to, from: this.number, body: message });
        if (!res) {
            throw new Error('Recieved empty response from twilio');
        }

        return {
            sid: res.sid,
            cost: res.price,
            errorCode: res.errorCode,
            errorMessage: res.errorMessage
        };
    }
}

const singleton = new TwilioClient();

export { singleton };

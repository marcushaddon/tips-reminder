import { singleton as twilioClient } from '../../main/client/TwilioClient';

(async () => {
    const start = new Date().getTime();
    const res = await twilioClient.sendText('+15407187333', 'smoke text');
    const end = new Date().getTime();
    console.log(`Sent text in ${ end - start } millis`);
    console.log(res);
})();
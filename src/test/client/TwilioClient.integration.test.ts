import { singleton as twilioClient } from '../../main/client/TwilioClient';

(async () => {
    const start = new Date().getTime();
    const res = await twilioClient.sendText('+15407187333', 'Dont forget to tip! https://venmo.com/Carrie-DeSandro\n\n(At any time, reply STOP to opt out, START to opt back in)');
    const end = new Date().getTime();
    console.log(`Sent text in ${ end - start } millis`);
    console.log(res);
})();
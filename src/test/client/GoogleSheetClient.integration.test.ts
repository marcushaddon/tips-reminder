import config from 'config';
import GoogleSheetsClient from '../../main/client/GoogleSheetClient';

(async () => {
    const integrations = config.get('integrations') as string[];
    for (let int of integrations) {
        const gsc = new GoogleSheetsClient(int);
        const start = new Date().getTime();
        const recepients = await gsc.getRandomRecipients(50);
        const stop = new Date().getTime();
        console.log(`Fetched google sheet recipients for ${ int } in ${ stop - start } millis`);
    }
    
})();

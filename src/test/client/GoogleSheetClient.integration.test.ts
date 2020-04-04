import GoogleSheetsClient from '../../main/client/GoogleSheetClient';

(async () => {
    const gsc = new GoogleSheetsClient('atx');
    const recepients = await gsc.getRandomRecipients(2);
    console.log(recepients);
})();

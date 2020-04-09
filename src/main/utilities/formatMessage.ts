import { ITipper, IRecipient, ISchedule } from '../../model';

const formatMessage = (tipper: ITipper, schedule: ISchedule, recipient: IRecipient): string => {
    const tipFor = schedule.for ? 'for your ' + schedule.for : 'to keep the service industry alive';
    const tname = tipper.firstName || 'Good Tipper';
    const rname = recipient.firstName || 'someone in the service industry';
    const link = recipient.paypal ? `PayPal: ${recipient.paypal}` :
    recipient.venmo ? `https://www.venmo.com/${recipient.venmo}` :
    recipient.cashapp ? `CashApp: ${recipient.cashapp}` : '{payment here}';
    
    return `Hey ${tname}! Don't forget to tip someone ${tipFor}! Thank you, and stay safe! ${link}`;
};

export default formatMessage;
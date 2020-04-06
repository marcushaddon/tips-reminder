import { ITipper, IRecipient, ISchedule } from '../../model';

const formatMessage = (tipper: ITipper, schedule: ISchedule, recipient: IRecipient): string => {
    const tipFor = schedule.for ? 'FOR ' + schedule.for : 'to keep the service industry alive';
    const tname = tipper.firstName || 'tipper';
    const rname = recipient.firstName || 'someone in the service industry';
    const link = recipient.paypal || recipient.venmo || recipient.cashapp;
    
    return `HEY ${tname} GIVE ${rname} THE LOOT ${tipFor}: ${link}`;
};

export default formatMessage;
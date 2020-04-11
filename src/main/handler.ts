import { ISQSReminderEvent, IReminderEvent } from '../model';
import config from '../config';
import logger from './logging/logger';
import EventHandler from './EventHandler';
const eventHandler = new EventHandler();


const onEvent = async (event: ISQSReminderEvent, context: any): Promise<void> => {
    const message = extractMessage(event);

    logger.info('Received message', { message });

    try {
        await eventHandler.handleEvent(message);
    } catch (e) {
        logger.error('Encountered error processing message', e);
        throw e;
    }

    logger.info('Successfully handled event');
};

const extractMessage = (event: ISQSReminderEvent): IReminderEvent => {
    const records = event.Records;
    if (!records || !Array.isArray(records) || records.length !== 1) {
        throw new Error('Invalid event received');
    }

    return JSON.parse(event.Records[0].body);
}

export { onEvent };

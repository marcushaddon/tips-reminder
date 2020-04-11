import config from '../config';
import logger from './logging/logger';
import {
    IReminderEvent,
    ITipper,
    ISchedule,
    IRecipient,
    ITipperServiceClient,
    ITwilioClient
} from '../model';

import TipperServiceClient from './client/TipperServiceClient';
import GoogleSheetClient from './client/GoogleSheetClient';
import { singleton as twilioSingleton } from './client/TwilioClient';
import formatMessage from './utilities/formatMessage';
import messageSelf from './client/messageSelf';


const integrationConfig = (config as any).get('integrations');

export interface IEventHandlerParams {
    tipperService: ITipperServiceClient;
    twilioClient: ITwilioClient;
    notifyUpstream: (message: any) => Promise<void>;
}

interface ITipperSchedule {
    tipper: ITipper;
    schedule: ISchedule;
}

export default class EventHandler {
    private tipperService: ITipperServiceClient;
    private twilioClient: ITwilioClient;
    private notifyUpstream: (message: any) => Promise<void>;
    constructor({
        tipperService,
        twilioClient,
        notifyUpstream
    }: IEventHandlerParams = {
        tipperService: new TipperServiceClient(),
        twilioClient: twilioSingleton,
        notifyUpstream: messageSelf
    }) {
        this.tipperService = tipperService;
        this.twilioClient = twilioClient;
        this.notifyUpstream = notifyUpstream;
    }

    async handleEvent(): Promise<void> {
        // Fetch tippers
        const time = new Date().getTime();
        logger.info(`Fetching users due at time ${time}`);
        const tippers = await this.tipperService.getDueTippers(time);
        logger.info(`Fetched ${tippers.length} tippers due at time ${new Date(time).toISOString()}`);

        if (tippers.length === 0) {
            logger.info('No tippers due, exiting');
            return;
        }

        let tipperSchedules: ITipperSchedule[] = [];
        for (let tipper of tippers) {
            const tscheds = tipper.schedules.map(schedule => ({ tipper, schedule }))
            tipperSchedules = tipperSchedules.concat(tscheds);
        }

        const dueSchedules = tipperSchedules.filter(ts => due(ts.schedule));
        logger.info(`Total schedules due: ${dueSchedules.length}`);

        const groups = groupTipJarSchedules(dueSchedules);
        logger.info(`Grouped due schedules by tipJarId into ${ Object.keys(groups).length} groups`);
        
        // For tipJarId
        for (let tipJarId in groups) {
            if (integrationConfig.indexOf(tipJarId) === -1) {
                logger.error(`Encountered unknown tipJarId: ${tipJarId} ${integrationConfig}`);
                continue;
            }
            logger.info(`Creating prompts for tipJar id: ${tipJarId}`)
            const sheetClient = new GoogleSheetClient(tipJarId);
            const tipperSchedules = groups[tipJarId];
            const recipients = await sheetClient.getRandomRecipients(tipperSchedules.length);
            logger.info(`Fetched ${recipients.length} recipient from tipJar ${tipJarId}`);

            // TODO: Randomize!
            
            const tippersToUpdate = await this.sendTexts(tipperSchedules, recipients);
            await this.updateTippers(tippersToUpdate);
        }

        try {
            await this.notifyUpstream(event);
            logger.info('Successfully triggered continuation');
        } catch (e) {
            logger.error('Encountered error while notifying upsteam', e);
        }
        
        
    }

    // NOTE: Assumes all schedules and recipients are from same tip jar 
    private async sendTexts(tipperSchedules: ITipperSchedule[], recipients: IRecipient[]) {
        const pairs = this.makePairs(tipperSchedules, recipients);
        const textedTippers = new Map<string, ITipper>();
        for (let pair of pairs) {
            const [ { tipper, schedule }, recipient ] = pair;
            const message = formatMessage(tipper, schedule, recipient);

            logger.info(`Sending text to ${tipper.phoneNumber}`, { message });
            try {
                const res = await this.twilioClient.sendText(pair[0].tipper.phoneNumber, message);
                logger.info(`Successfully texted ${tipper.phoneNumber}`, { sid: res.sid });
                textedTippers.set(tipper.phoneNumber, tipper);
            } catch (e) {
                logger.error(`Encountered error sending text to ${tipper.phoneNumber}`, e);
            }
        }

        return [...textedTippers.values()];
    }

    private makePairs(tipperSchedules: ITipperSchedule[], recipients: IRecipient[]) {
        return tipperSchedules.map((ts, i): [ITipperSchedule, IRecipient] => [ts, recipients[i]]);
    }

    private async updateTippers(tippers: ITipper[]) {
        const proms = tippers.map(async t => {
            const updated = { ...t, dirty: true };
            try {
                await this.tipperService.updateTipper(updated);
                logger.info(`Successfully updated ${t.phoneNumber}`);
            } catch (e) {
                logger.error(`Encountered error updating ${t.phoneNumber}`, e);
            }
            
        });

        await Promise.all(proms);
    }
}

// TODO: .next() will ALWAYS be in the future?!?!
const due = (schedule: ISchedule): boolean => schedule.nextScheduledTime <= new Date().getTime();

const groupTipJarSchedules = (tipperSchedules: ITipperSchedule[]):  { [ tipJarId: string ]: ITipperSchedule[] } => {
    const groups: { [ tipJarId: string ]: ITipperSchedule[] } = {};
    for (let tipperSched of tipperSchedules) {
        if (!groups[tipperSched.schedule.tipJarId]) {
            groups[tipperSched.schedule.tipJarId] = [tipperSched];
        } else {
            groups[tipperSched.schedule.tipJarId].push(tipperSched);
        }
    }

    return groups;
}

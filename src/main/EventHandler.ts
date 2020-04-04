import cronparser from 'cron-parser';
import logger from './logging/logger';
import {
    IReminderEvent,
    ITipper,
    ISchedule
} from '../model';
import TipJarClientProvider from '../main/providers/TipJarClientProvider';
import TipperServiceClient from './client/TipperServiceClient';

export interface IEventHandlerParams {
    tipJarClientProvider: TipJarClientProvider;
    tipperServiceClient: TipperServiceClient;
}

interface ITipperSchedule {
    tipper: ITipper;
    schedule: ISchedule;
}

export default class EventHandler {
    private tipJarClientProvider: TipJarClientProvider;
    private tipperService: TipperServiceClient;
    constructor({
        tipJarClientProvider = new TipJarClientProvider(),
        tipperService = new TipperServiceClient()
    }) {
        this.tipJarClientProvider = tipJarClientProvider;
        this.tipperService = tipperService;
    }

    async handleEvent(event: IReminderEvent): Promise<void> {
        const { time } = event;
        // Fetch tippers
        const tippers = await this.tipperService.getDueTippers(time);
        logger.info(`Fetched ${tippers.length} tippers due at time ${time}`);

        // Group schedules+tippers by tipJarId
        const tipjarSchedules = getSceduleGroups(tippers);
        
        logger.info('Grouped due schedules by tipJarId');
        
        // For tipJarId
            // Fetch recipients
            // Make random pairings
            // For pairing
                // Send text
                // Update tipper
                // Maybe update recipient

            
        // Schedule next page
    }
}

const due = (schedule: ISchedule): boolean => cronparser
    .parseExpression(schedule.cron, { tz: schedule.timezone })
    .next()
    .getTime() <= new Date().getTime();

const getSceduleGroups = (tippers: ITipper[]):  { [ tipJarId: string ]: ITipperSchedule[] } => {

    return {};
}
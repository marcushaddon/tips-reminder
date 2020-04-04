import cronparser from 'cron-parser';
import logger from './logging/logger';
import {
    IReminderEvent,
    ITipper,
    ISchedule
} from '../model';

import TipperServiceClient from './client/TipperServiceClient';

export interface IEventHandlerParams {
    tipperServiceClient: TipperServiceClient;
}

interface ITipperSchedule {
    tipper: ITipper;
    schedule: ISchedule;
}

export default class EventHandler {
    private tipperService: TipperServiceClient;
    constructor({
        tipperService = new TipperServiceClient()
    }) {
        this.tipperService = tipperService;
    }

    async handleEvent(event: IReminderEvent): Promise<void> {
        const { time } = event;
        // Fetch tippers
        const tippers = await this.tipperService.getDueTippers(time);
        logger.info(`Fetched ${tippers.length} tippers due at time ${time}`);

        // Group schedules+tippers by tipJarId
        const tipjarSchedules = getScheduleGroups(tippers);
        
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

const getScheduleGroups = (tippers: ITipper[]):  { [ tipJarId: string ]: ITipperSchedule[] } => {
    const groups: { [ tipJarId: string ]: ITipperSchedule[] } = {};
    for (let tipper of tippers) {
        tipper.schedules
            .filter(due)
            .forEach(schedule => groups[schedule.tipJarId])

    }

    return {};
}
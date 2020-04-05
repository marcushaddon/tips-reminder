import cronparser from 'cron-parser';
import logger from './logging/logger';
import {
    IReminderEvent,
    ITipper,
    ISchedule,
    ITipperServiceClient
} from '../model';

import TipperServiceClient from './client/TipperServiceClient';

export interface IEventHandlerParams {
    tipperService: ITipperServiceClient;
}

interface ITipperSchedule {
    tipper: ITipper;
    schedule: ISchedule;
}

export default class EventHandler {
    private tipperService: ITipperServiceClient;
    constructor({
        tipperService
    }: IEventHandlerParams = { tipperService: new TipperServiceClient() }) {
        this.tipperService = tipperService;
    }

    async handleEvent(event: IReminderEvent): Promise<void> {
        let { time } = event;
        // Fetch tippers
        const tippers = await this.tipperService.getDueTippers(time);
        logger.info(`Fetched ${tippers.length} tippers due at time ${new Date(time).toISOString()}`);

        // Group schedules+tippers by tipJarId
        let tipperSchedules: ITipperSchedule[] = [];
        for (let tipper of tippers) {
            const tscheds = tipper.schedules.map(schedule => ({ tipper, schedule}))
            tipperSchedules = tipperSchedules.concat(tscheds);
        }

        const dueSchedules = tipperSchedules.filter(ts => due(ts.schedule, time));
        logger.info(`Total schedules due: ${dueSchedules.length}`);
        
        const groups = groupTipJarSchedules(dueSchedules);
        logger.info(`Grouped due schedules by tipJarId into ${ Object.keys(groups).length} groups`);
        
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

// TODO: .next() will ALWAYS be in the future?!?!
const due = (schedule: ISchedule, asOf: number): boolean => cronparser
    .parseExpression(schedule.cron, { tz: schedule.timezone })
    .next()
    .getTime() <= asOf - 1;

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
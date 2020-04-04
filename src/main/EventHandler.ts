import { IReminderEvent } from '../model';

export default class EventHandler {
    constructor() {}

    async handleEvent(event: IReminderEvent): Promise<void> {
        // Fetch tippers
        // Group schedules by tipJarId
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
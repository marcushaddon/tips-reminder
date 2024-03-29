export interface IReminderEvent {
    traceId: string;
    continuationToken?: string;
}

export interface ISQSReminderEvent {
    Records: { body: string}[];
}

export interface ISchedule {
    tipJarId: string;
    cron: string;
    nextScheduledTime: number;
    for?: string;
    timezone: string;
}

export interface ITipper {
    role: 'tipper';
    phoneNumber: string;
    nextScheduled: string;
    nextScheduledTime: number;
    schedules: ISchedule[];
    firstName?: string;
    lastName?: string;
    dirty?: boolean;
}

export interface IRecipient {
    tipJarId: string;
    firstName: string;
    lastName?: string;
    establishment: string;
    closed?: string;
    insurance?: string;
    venmo?: string;
    paypal?: string;
    cashapp?: string;
}

export interface ITipJarClient {
    getRandomRecipients(count: number): Promise<IRecipient[]>;
    updateRecipient(recipient: IRecipient): Promise<void>;
}

export interface ITipperServiceClient {
    getDueTippers(timestamp: number): Promise<ITipper[]>;
    updateTipper(tipper: ITipper): Promise<void>;
}

export interface GoogleSheetIntegration {
    url: string;
    mappings: { [ from: string ]: string }[];
    skip?: number;
}

export interface ITwilioClient {
    sendText(phoneNumber: string, message: string): Promise<ITextResult>;
}

export interface ITextResult {
    sid: string;
    cost: string;
    errorCode?: number;
    errorMessage?: string;
}

import * as model from '../model';
import * as mocks from './resources/mocks';

// These are new'd up per tipJar
jest.mock('../main/client/GoogleSheetClient', () => {
    return function() {
        return mocks.mockGoogleSheetsClient;
    }
});

jest.mock('../main/logging/logger', () => mocks.mockLogger);

import EventHandler from '../main/EventHandler';

describe('EventHandler', () => {
    // =================================
    // SETUP
    // =================================
    let uut: EventHandler;
    beforeEach(() => {
        uut = new EventHandler({
            tipperService: mocks.mockTippersServiceClient,
            twilioClient: mocks.mockTwilioClient,
            notifyUpstream: mocks.mockMessageSelf
        });
    });
    afterEach(jest.clearAllMocks);

    // This is 2020-04-20T16:20:00-07:00
    const FOUR_TWENTY = 1587424800000;
    const mockEvent = {
        traceId: 'test-job',
        time: FOUR_TWENTY
    };

    const mockD = new Date(FOUR_TWENTY);
    (Date as any) = function() { return mockD; };

    // Three tipJars across two users
    const mockDueTippers: model.ITipper[] = [
        {
            role: 'tipper',
            phoneNumber: '+15554443333',
            nextScheduled: '2020-04-20:T00:00:00.000Z',
            nextScheduledTime: FOUR_TWENTY - 1000,
            schedules: [
                {
                    cron: '0 0 4 * * 0',
                    nextScheduledTime: FOUR_TWENTY,
                    for: 'testing',
                    timezone: 'America/Los_Angeles',
                    tipJarId: 'A'
                }, {
                    cron: '0 0 4 * * 0',
                    nextScheduledTime: FOUR_TWENTY - 100,
                    for: 'testing',
                    timezone: 'America/Los_Angeles',
                    tipJarId: 'B'
                }
            ]
        }, {
            role: 'tipper',
            phoneNumber: '+16665554444',
            nextScheduled: '2020-04-20:T00:00:00.000Z',
            nextScheduledTime: FOUR_TWENTY - 2000,
            schedules: [
                // This one shouldnt be due 
                {
                    cron: '0 0 6 * * 1',
                    for: 'testing',
                    timezone: 'America/Los_Angeles',
                    tipJarId: 'B',
                    nextScheduledTime: FOUR_TWENTY + 50 * 60 * 1000 
                }, {
                    cron: '0 0 4 * * 0',
                    nextScheduledTime: FOUR_TWENTY - 2000,
                    for: 'testing',
                    timezone: 'America/Los_Angeles',
                    tipJarId: 'C'
                }
            ]
        }
    ];

    // ================================
    // TESTS
    // ================================
    it('#handleEvent exits if no tippers due', async () => {
        mocks.mockTippersServiceClient.getDueTippers.mockResolvedValue([]);
        const res = await uut.handleEvent(mockEvent);
        expect(mocks.mockTippersServiceClient.getDueTippers).toHaveBeenCalledTimes(1);
        expect(mocks.mockGoogleSheetsClient.getRandomRecipients).toHaveBeenCalledTimes(0);
        expect(mocks.mockTwilioClient.sendText).toHaveBeenCalledTimes(0);
    });

    it('#handleEvent fetches recipients for all tip jars', async () => {
        mocks.mockTippersServiceClient.getDueTippers.mockResolvedValue(mockDueTippers);
        const res = await uut.handleEvent(mockEvent);
        expect(mocks.mockGoogleSheetsClient.getRandomRecipients).toHaveBeenCalledTimes(3);
    });

    // Calls sendText once for every due schedule tipper
    it('#handleEvent sends one notification for each due schedule', async () => {
        const res = await uut.handleEvent(mockEvent);
        const expectedCount = mockDueTippers
            .map(mdt => mdt.schedules)
            .reduce((acc, curr) => [...acc, ...curr], [])
            .filter(sch => sch.nextScheduledTime <= FOUR_TWENTY)
            .length;
        expect(mocks.mockTwilioClient.sendText).toHaveBeenCalledTimes(expectedCount);
    });

    // Updates each sucessfully texted due tipper
    it('#handleEvent updates each successfully texted tipper', async () => {
        const res = await uut.handleEvent(mockEvent);
        const textCount = mocks.mockTwilioClient.sendText.mock.calls.length;
        expect(mocks.mockTippersServiceClient.updateTipper).toHaveBeenCalledTimes(textCount);
    });
    // Makes random pairs

    // Schedules next page
    it('#handleEvent paginates as long as it receives a non-empty response for due tippers', async () => {
        const res = await uut.handleEvent(mockEvent);
        expect(mocks.mockMessageSelf).toHaveBeenCalledTimes(1);

        mocks.mockTippersServiceClient.getDueTippers.mockResolvedValueOnce([]);
        const secondRes = await uut.handleEvent(mockEvent);
        expect(mocks.mockMessageSelf).toHaveBeenCalledTimes(1);
    });

    // Handles one error (still texts/updates rest of tippers)
    it('#handleEvent gracefully handles sporadic errors', async () => {
        mocks.mockTwilioClient.sendText.mockRejectedValueOnce({ error: 'oh no' });
        const res = uut.handleEvent(mockEvent);
        expect(mocks.mockLogger.error).toHaveBeenCalledTimes(1);
    });
});

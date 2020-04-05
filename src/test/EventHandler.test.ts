import * as model from '../model';
import EventHandler from '../main/EventHandler';
import * as mocks from './resources/mocks';
import TipperServiceClient from '../main/client/TipperServiceClient';

describe('EventHandler', () => {
    // =================================
    // SETUP
    // =================================
    let uut: EventHandler;
    beforeEach(() => {
        uut = new EventHandler({
            tipperService: mocks.mockTippersServiceClient
        });
    });
    afterEach(jest.clearAllMocks);

    // This is 2020-04-20T16:20:00-07:00
    const FOUR_TWENTY = 1587424800000;
    const mockEvent = {
        traceId: 'test-job',
        time: FOUR_TWENTY
    }

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
                    for: 'testing',
                    timezone: 'America/Los_Angeles',
                    tipJarId: 'A'
                }, {
                    cron: '0 0 4 * * 0',
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
                    tipJarId: 'B'
                }, {
                    cron: '0 0 4 * * 0',
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

    // Ignores schedules that arent due
    // Calls sendText once for every due tipper
    // Updates each sucessfully texted due tipper
    // Makes random pairs
    // Schedules next page
});

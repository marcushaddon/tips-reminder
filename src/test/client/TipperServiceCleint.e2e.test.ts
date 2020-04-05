import TipperServiceClient from '../../main/client/TipperServiceClient';
import { ITipper } from '../../model';

const tippersClient = new TipperServiceClient();

(async () => {
    const fakeTippers: ITipper[] = [
        {
            role: 'tipper',
            phoneNumber: '+15407187333',
            firstName: 'TEST_MARCUS',
            nextScheduled: '2020-04-20T09:00:00.000Z',
            nextScheduledTime: new Date().getTime() - 1000,
            schedules: [{
                cron: '0 0 22 * * 1,2,6',
                for: 'Sandwich',
                tipJarId: 'atx',
                timezone: 'America/Los_Angeles'
            }],
            dirty: false
        },
        {
            role: 'tipper',
            phoneNumber: '+15407187334',
            firstName: 'TEST_MARK',
            nextScheduled: '2020-04-20T09:00:00.000Z',
            nextScheduledTime: new Date().getTime() + 5 * 60 * 60 * 1000,
            schedules: [{
                cron: '0 0 9 * * 1,2,4',
                for: 'Sandwich',
                tipJarId: 'atx',
                timezone: 'America/Los_Angeles'
            }],
            dirty: false
        }
    ];
    console.log(fakeTippers.map(ft => ft.nextScheduledTime));
    for (let tipper of fakeTippers) {
        const res = await tippersClient.updateTipper(tipper);
        console.log(res);
    }
    const tippers = await tippersClient.getDueTippers(new Date().getTime());
    console.log(tippers);
})();

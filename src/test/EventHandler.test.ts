import EventHandler from '../main/EventHandler';
import * as mocks from './resources/mocks';
import TipperServiceClient from '../main/client/TipperServiceClient';

describe('EventHandler', () => {
    let uut: EventHandler;
    beforeEach(() => {
        uut = new EventHandler({
            tipperService: mocks.mockTippersServiceClient
        });
    });

    it('starts TDD', async () => {
        expect(5).toEqual(5);
    })
});

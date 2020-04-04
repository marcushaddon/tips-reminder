import TipperServiceClient from '../../main/client/TipperServiceClient';

describe('TipperServiceClient', () => {
    const uut = new TipperServiceClient();

    it('#getDueTippers can list users at all', async () => {
        const tippers = await uut.getDueTippers(new Date().getTime());
        expect(Array.isArray(tippers)).toBeTruthy();
    });
});

import { IRecipient } from '../../model';

const mockTippersServiceClient = {
    getDueTippers: jest.fn(),
    updateTipper: jest.fn()
};

const mockRecipient: IRecipient = {
    venmo: 'mockVenmo',
    firstName: 'test-name',
    tipJarId: 'A',
    establishment: 'Test Establishment'
}

const mockGoogleSheetsClient = {
    getRandomRecipients: jest.fn(n => [...Array(n).keys()].map(() => mockRecipient))
};

const mockTwilioClient = {
    sendText: jest.fn().mockResolvedValue({ sid: 'test-sid' })
}

const mockMessageSelf = jest.fn().mockResolvedValue({ MessageId: 'test-id' });

export {
    mockTippersServiceClient,
    mockGoogleSheetsClient,
    mockTwilioClient,
    mockMessageSelf,
}

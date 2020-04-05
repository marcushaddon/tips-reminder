import { ITipperServiceClient } from '../../model';

const mockTippersServiceClient: ITipperServiceClient = {
    getDueTippers: jest.fn(),
    updateTipper: jest.fn()
};

const mockGoogleSheetsClient = {
    getRandomRecipients: jest.fn()
};

const mockTwilioClient = {
    sendText: jest.fn()
}

const mockSQSClient = {
    // TODO
}

export {
    mockTippersServiceClient,
    mockGoogleSheetsClient,
    mockTwilioClient,
}

import { ITipJarClient, IRecipient } from '../../model';

export default class GoogleSheetClient implements ITipJarClient {
    public constructor (tipJarId: string) { }
    
    public async getRandomRecipients(count: number): Promise<IRecipient[]> {
        return [];
    }
}
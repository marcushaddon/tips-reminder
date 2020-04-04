import { ITipJarClient } from '../../model';
import GoogleSheetClient from '../client/GoogleSheetClient';

export default class TipJarClientProvider {
    public getClient(tipJarId: string): ITipJarClient {
        return new GoogleSheetClient('atx');
    }
}
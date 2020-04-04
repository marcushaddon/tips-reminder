import { ITipJarClient } from '../../model';
import GoogleSheetClient from '../client/GoogleSheetClient';

class TipJarClientProvider {
    public getClient(tipJarId: string): ITipJarClient {
        return new GoogleSheetClient('atx');
    }
}
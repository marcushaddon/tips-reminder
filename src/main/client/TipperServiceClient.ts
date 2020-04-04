import axios, { AxiosStatic } from 'axios';
import { ITipperServiceClient, ITipper } from '../../model';
import config from 'config';

const appConfig = config.get('app');

export default class TipperServiceClient implements ITipperServiceClient {
    private baseUrl: string;
    private http: AxiosStatic;

    public constructor({
        http = axios,
        baseUrl = appConfig.get('tipperService').get('baseUrl')
    } = {}) {
        this.http = axios;
        this.baseUrl = baseUrl;
    }
    public async getDueTippers(time: number): Promise<ITipper[]> {
        const url = `${this.baseUrl}/users?role=tippers&next_scheduled_lte=${time}`;

        return [];
    }

    public async updateTipper(tipper: ITipper): Promise<void> {
        
    }
}
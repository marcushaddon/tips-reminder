import axios, { AxiosStatic } from 'axios';
import { ITipperServiceClient, ITipper } from '../../model';
import JWTAuthenticator from '../auth/JWTAuthenticator';
import config from 'config';

const appConfig = (config as any).get('app');
const tipsConfig = (config as any).get('tips');

export default class TipperServiceClient implements ITipperServiceClient {
    private baseUrl: string;
    private http: AxiosStatic;
    private auth: JWTAuthenticator;

    public constructor({
        http = axios,
        baseUrl = tipsConfig.get('tippersService').get('baseUrl'),
        auth = new JWTAuthenticator()
    } = {}) {
        this.http = axios;
        this.baseUrl = baseUrl;
        this.auth = auth;
    }
    public async getDueTippers(time: number): Promise<ITipper[]> {
        const url = `${this.baseUrl}/users?role=tippers&next_scheduled_lte=${time}`;

        const headers = await this.getHeaders();
        const res = await this.http({
            method: 'GET',
            url,
            headers
        });

        return res.data;
    }

    public async updateTipper(tipper: ITipper): Promise<void> {
        
    }

    private async getHeaders() {
        const token = await this.auth.sign();
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authentication': `Bearer ${token}`
        };
    }
}
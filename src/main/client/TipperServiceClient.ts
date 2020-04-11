import axios, { AxiosStatic, AxiosRequestConfig } from 'axios';
import { ITipperServiceClient, ITipper } from '../../model';
import JWTAuthenticator from '../auth/JWTAuthenticator';
import config from '../../config';
import logger from '../logging/logger';

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
        this.http = http;
        this.baseUrl = baseUrl;
        this.auth = auth;
    }
    public async getDueTippers(time: number): Promise<ITipper[]> {
        const url = `${this.baseUrl}/users?role=tippers&next_scheduled_lte=${time}`;

        const headers = await this.getHeaders();
        const params: AxiosRequestConfig = {
            method: 'GET',
            url,
            headers
        };

        const res = await this.http(params);

        return res.data.items;
    }

    public async updateTipper(tipper: ITipper): Promise<void> {
        const headers = await this.getHeaders();
        const params: AxiosRequestConfig = {
            method: 'PATCH',
            url: `${this.baseUrl}/users`,
            headers,
            data: JSON.stringify([ tipper ])
        };

        const res = await this.http(params);

        return res.data;
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

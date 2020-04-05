import { SecretsManager } from 'aws-sdk';
import jsonwebtoken from 'jsonwebtoken';
import config from 'config';
import logger from '../logging/logger';


const appConfig = config.get('app') as any;

export default class JWTAuthenticator {
    private _local: boolean;
    private _cachedSecret?: string;
    public constructor(
        private secretsManager = new SecretsManager({ region: appConfig.region }),
        private jwt = jsonwebtoken
    ) {
        this._local = process.env.NODE_ENV === 'develop';
        this.refreshSecret();
    }

    public async sign(): Promise<string> {
        await this.refreshSecret();
        const ttl = parseInt(appConfig.jwtTTTL);
        
        const token = this.jwt.sign(
            { user: { role: 'appService' } },
            this._cachedSecret as string,
            { expiresIn: appConfig.jwtTTL }
        );

        return token;
    }

    private async refreshSecret() {
        if (this._local) {
            this._cachedSecret = process.env.TIPS_JWT_SECRET;
            logger.info('Running locally, using JWT secret from env');

            return ;
        }

        const res = await this.secretsManager.getSecretValue({
            SecretId: appConfig.jwtSecretKey
        }).promise();

        if (typeof res.SecretString === 'undefined') {
            throw new Error('Unable to refresh shared JWT secret');
        }
        console.log(res.SecretString);

        // TODO: I guess we need to parse?
        this._cachedSecret = res.SecretString;
    }

}

export const singleton = new JWTAuthenticator();

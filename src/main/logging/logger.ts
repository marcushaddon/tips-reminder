import { createLogger, transports, format } from 'winston';
import config from 'config';
const appConfig = config.get('app') as any;

const logger = createLogger({
    level: 'info',
    defaultMeta: {
        service: appConfig.service
    },
    transports: [
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.simple()
            )
        })
    ]
});

export default logger;

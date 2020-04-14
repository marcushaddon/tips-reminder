import { createLogger, transports, format } from 'winston';
import config from '../../config';
const appConfig = config.get('app') as any;

const _logger = createLogger({
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

class Logger {
    context: { [field: string]: any } = {};
    _log(message: string, ctx: { [field: string]: any }, loggerMethod: (msg: string, ctx: any) => void): void {
        const logobj = { ...this.context, ...ctx, event: message };
        loggerMethod(message, logobj);
    }
    info(message: string, ctx: { [field: string]: any } = {}): void {
        this._log(message, ctx, _logger.info);
    }
    error(message: string, error: { [field: string]: any } = {}): void {
        this._log(message, { error }, _logger.info);
    }

    putCtx(ctx: { [field: string]: any }): void {
        this.context = { ...this.context, ...ctx };
    }

    clearCtx(): void {
        this.context = {};
    }
}

const logger = new Logger();
export default logger;

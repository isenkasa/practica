import { pino, Logger as PinoLoggerImpl, DestinationStream } from 'pino';
import { LOG_LEVELS, Logger } from './definition';

export default class PinoLogger implements Logger {
  readonly #logger: PinoLoggerImpl;

  constructor(
    private level: LOG_LEVELS,
    private prettyPrintEnabled: boolean,
    private destStream?: DestinationStream | string
  ) {
    const opts = {
      level,
      transport: prettyPrintEnabled
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              sync: true,
            },
          }
        : undefined,
    };
    this.#logger = pino(opts);
  }

  debug(message: string, metadata?: Record<any, unknown>): void {
    this.#logger.debug(metadata, message);
  }

  error(message: string, metadata?: Record<any, unknown>): void {
    this.#logger.error(metadata, message);
  }

  info(message: string, metadata?: Record<any, unknown>): void {
    this.#logger.info(metadata, message);
  }

  warning(message: string, metadata?: Record<any, unknown>): void {
    this.#logger.warn(metadata, message);
  }
}

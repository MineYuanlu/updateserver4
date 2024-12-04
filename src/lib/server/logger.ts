import pino from 'pino';

const logger = pino({
	level: 'info',
});

export const getLogger = (name: string) => logger.child({ name });

import { Global, Module, Provider, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

const redisProvider: Provider = {
    provide: REDIS_CLIENT,
    useFactory: (configService: ConfigService) => {
        const logger = new Logger('RedisModule');
        const redisUrl = configService.get<string>('redis.url') || 'redis://localhost:6379';

        const client = new Redis(redisUrl, {
            maxRetriesPerRequest: 1,
            enableOfflineQueue: false,
            retryStrategy: (times) => {
                if (times > 3) return null;
                return Math.min(times * 100, 2000);
            },
        });

        client.on('error', (err) => {
            logger.warn(`Redis notice: ${err.message}`);
        });

        client.on('connect', () => {
            logger.log('Redis Client Connected');
        });

        return client;
    },
    inject: [ConfigService],
};

@Global()
@Module({
    providers: [redisProvider],
    exports: [REDIS_CLIENT],
})
export class RedisModule { }

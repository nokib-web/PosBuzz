import { Global, Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

const redisProvider: Provider = {
    provide: REDIS_CLIENT,
    useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('redis.url') || 'redis://localhost:6379';
        return new Redis(redisUrl);
    },
    inject: [ConfigService],
};

@Global()
@Module({
    providers: [redisProvider],
    exports: [REDIS_CLIENT],
})
export class RedisModule { }

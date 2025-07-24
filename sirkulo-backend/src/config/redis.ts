import { createClient, RedisClientType } from 'redis';
import config from './index';

/**
 * Redis client instance
 */
let redisClient: RedisClientType;

/**
 * Initialize Redis connection
 */
export const initializeRedis = async (): Promise<void> => {
  try {
    redisClient = createClient({
      url: `redis://${config.redis.host}:${config.redis.port}`,
      password: config.redis.password,
    });

    redisClient.on('error', (error) => {
      console.error('❌ Redis Client Error:', error);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connection established successfully');
    });

    await redisClient.connect();
  } catch (error) {
    console.error('❌ Error during Redis connection initialization:', error);
    process.exit(1);
  }
};

/**
 * Get Redis client instance
 */
export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call initializeRedis() first.');
  }
  return redisClient;
};

/**
 * Close Redis connection
 */
export const closeRedisConnection = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.disconnect();
    console.log('✅ Redis connection closed');
  }
};

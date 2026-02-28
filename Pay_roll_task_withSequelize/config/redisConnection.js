const { createClient } = require('redis');

let client;

async function createRedisClient() {
  if (client) return client;

  client = createClient({
    url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`,
  });

  client.on('error', (err) => {
    console.error('Redis Client Error', err);
  });

  if (!client.isOpen) {
    await client.connect();
  }

  return client;
}

module.exports = {
  createRedisClient,
};


# ts-ioredis-pool

[![CI](https://github.com/StephenMP/ts-ioredis-pool/actions/workflows/CI.yaml/badge.svg?branch=main&event=push)](https://github.com/StephenMP/ts-ioredis-pool/actions/workflows/CI.yaml)

Connection pooling for ioredis in TypeScript.

Supports
- Node 10+
- Redis 4+

## Usage

Basic usage:

```typescript
// In some file (e.g. src/pool.ts)
const ioRedisPoolOpts = IORedisPoolOptions
  .fromUrl(process.env.REDIS_URL as string)
  // This accepts the RedisOptions class from ioredis as an argument
  // https://github.com/luin/ioredis/blob/master/lib/redis/RedisOptions.ts
  .withIORedisOptions({
    name: 'test',
    keyPrefix: 'ioredis_test_',
  })
  // This accepts the Options class from @types/generic-pool as an argument
  // https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/generic-pool/index.d.ts#L36
  .withPoolOptions({
    min: 2,
    max: 20,
  })

export const ioRedisPool = new IORedisPool(ioRedisPoolOpts)

// In some other file (e.g. src/myfile.ts)
import { ioRedisPool } from './pool.ts'

// ...some code

async function setRedis(key: string, obj: any) {
  const client = await pool.getConnection()
  if (client) {
    client.set(key, obj)

    // Don't forget to release your connection
    await pool.release(client)
  }
}
```

You can also connect via host and port:

```typescript
// In some file (e.g. src/pool.ts)
const ioRedisPoolOpts = IORedisPoolOptions
  .fromHostAndPort(
    process.env.REDIS_HOST as string,
    parseInt(process.env.REDIS_PORT as string)
  )
  .withIORedisOptions({
    name: 'test',
    keyPrefix: 'ioredis_test_',
    password: process.env.REDIS_PASS as string,
  })
  .withPoolOptions({
    min: 2,
    max: 20,
  })

export const ioRedisPool = new IORedisPool(ioRedisPoolOpts)
```

A more anonymous way of executing redis commands. This allows you access to the ioredis client methods while also managing the acquisition and release of the connections from the pool for you so you don't have to worry about it.

```typescript
// assuming you already have an IORedisPool instance
const someValue = await ioRedisPool.execute(async (client) => {
  // Here you have access to ioredis commands
  return await client.get('some-key')
})

// You can run multiple commands
await ioRedisPool.execute(async (client) => {
  // Here you have access to ioredis commands
  const set = client.set('some-key', 'some-value')
  const del = client.del('some-other-key')

  await Promise.all([set, del])
  return await client.del('another-key')
})
```

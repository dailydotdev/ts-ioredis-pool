import { IORedisPool } from './index'
import { IORedisPoolOptions } from './ioredis-pool'
import { Redis as IRedis } from 'ioredis'

global.fail = (error?: any): never => {
  throw new Error(error)
}

const testSet = (client: IRedis | undefined, pool: IORedisPool | undefined) => {
  beforeEach(async () => {
    client = await pool?.getConnection()
  })

  it('Can set', async () => {
    if (client) {
      client.set('test', 'test redis')
      await expect(client.get('test')).resolves.toBe('test redis')
    }
  })

  it('Can del', async () => {
    if (client) {
      client?.del('test')
      await expect(client.get('test')).resolves.toBeNull()
    }
  })

  it('Can execute', async () => {
    if (pool && client) {
      pool.execute(async () => {
        client?.set('test-execute', 'value')
      })
      await expect(client.get('test-execute')).resolves.toBe('value')

      const testVal = await pool.execute(async (client) => {
        return await client.get('test-execute')
      })
      expect(testVal).toBe('value')

      pool.execute(async () => {
        client?.del('test-execute')
      })
      await expect(client.get('test')).resolves.toBeNull()
    }
  })

  it('Can disconnect', async () => {
    if (client) {
      await pool?.disconnect(client)
      await expect(pool?.release(client)).rejects.toThrow('Resource not currently part of this pool')
      client = undefined
    }
  })

  afterEach(async () => {
    if (client) {
      await pool?.release(client)
    }
  })
}

describe('test ioredis-pool from host and port', () => {
  if (!process.env.REDIS_HOST || !process.env.REDIS_PORT) {
    fail('REDIS_HOST or REDIS_PORT env var is not set!')
  } else {
    let pool: IORedisPool | undefined
    let client: IRedis | undefined

    beforeAll(() => {
      const port = parseInt(process.env.REDIS_PORT as string)
      const opts = IORedisPoolOptions.fromHostAndPort(process.env.REDIS_HOST as string, port)
        .withIORedisOptions({
          password: process.env.REDIS_PASS as string,
          name: 'test',
          keyPrefix: 'ioredis_test_',
        })
        .withPoolOptions({
          min: 2,
          max: 20,
        })

      if (process.env.REDIS_TLS === 'true') {
        opts.redisOptions.tls = {
          rejectUnauthorized: false,
        }
      }

      pool = new IORedisPool(opts)
    })

    testSet(client, pool)

    afterAll(() => {
      return pool?.end()
    })
  }
})

describe('test ioredis-pool from url', () => {
  if (!process.env.REDIS_URL) {
    fail('REDIS_URL env var is not set!')
  } else {
    let pool: IORedisPool | undefined
    let client: IRedis | undefined

    beforeAll(() => {
      const opts = IORedisPoolOptions.fromUrl(process.env.REDIS_URL as string)
        .withIORedisOptions({
          name: 'test',
          keyPrefix: 'ioredis_test_',
        })
        .withPoolOptions({
          min: 2,
          max: 20,
        })

      if (process.env.REDIS_TLS === 'true') {
        opts.redisOptions.tls = {
          rejectUnauthorized: false,
        }
      }

      pool = new IORedisPool(opts)
    })

    testSet(client, pool)

    afterAll(() => {
      return pool?.end()
    })
  }
})

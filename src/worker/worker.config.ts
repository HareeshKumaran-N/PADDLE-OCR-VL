import { ConnectionOptions } from 'bullmq'

export const redis_connection: ConnectionOptions = {
  url: process.env.REDIS_URL!
}
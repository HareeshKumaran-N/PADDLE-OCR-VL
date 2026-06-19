// test-job.ts
import { Queue } from 'bullmq'

const queue = new Queue('file-processing', {
  connection: {
    url: "rediss://default:AWlUAAIncDIyMzUxM2YzYjY3ZjU0MmYyYTNmZWMzNzY0MTdkN2JmMHAyMjY5NjQ@workable-camel-26964.upstash.io:6379"
  }
})

await queue.add('process-file', {
  fileName: 'Delivery challan (1).pdf',
  fileType: 'pdf'
})

console.log('✅ Job added!')
process.exit(0)
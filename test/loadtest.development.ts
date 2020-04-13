import loadtest from 'loadtest'

console.log('[Test] Starting load test...')

const options = {
    url: 'http://localhost:3001/',
    maxRequests: 1000,
    // concurrency: 100,
    maxSeconds: 10,
    // requestsPerSecond: 100
}

loadtest.loadTest(options, function (error: Error, result: any) {
    if (error) {
        return console.error('[Test] Got an error', error)
    }
    console.log('[Test] Tests run successfully', result)
})
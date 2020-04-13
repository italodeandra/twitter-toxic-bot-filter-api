import loadtest from 'loadtest'

console.log('[Test] Starting load test...')

const options = {
    url: 'https://twitter-toxic-bot-filter-api-staging.italodeandra.de/',
    maxRequests: 1000,
    concurrency: 10,
    maxSeconds: 10,
    // requestsPerSecond: 100
}

loadtest.loadTest(options, function (error: Error, result: any) {
    if (error) {
        return console.error('[Test] Got an error', error)
    }
    console.log('[Test] Tests run successfully', result)
})
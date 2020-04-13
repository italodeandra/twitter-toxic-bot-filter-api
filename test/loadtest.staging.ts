import loadtest from 'loadtest'

console.log('[Test] Starting load test...')

const options = {
    url: 'https://twitter-toxic-bot-filter-api-staging.italodeandra.de/tweet-trap',
    maxRequests: 1000,
    concurrency: 50,
    // maxSeconds: 100,
    // requestsPerSecond: 100,
    headers: {
        authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQ3MTQ5NTc0NjkiLCJpYXQiOjE1ODY3OTI3NDZ9.FzRoufJY5JpzanQUbdiYEAKkA9ErdkJlEv-7ASsaBDM'
    }
}

loadtest.loadTest(options, function (error: Error, result: any) {
    if (error) {
        return console.error('[Test] Got an error', error)
    }
    console.log('[Test] Tests run successfully', result)
})
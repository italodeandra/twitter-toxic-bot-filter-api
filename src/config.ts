export default {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3001,
    apiHost: process.env.HOST || 'localhost',
    webUrl: process.env.WEB_URL || 'http://localhost:3000/',
    twitterConsumerApiKey: process.env.TWITTER_CONSUMER_API_KEY || 'kCkSebfJEIEx5ZPo7I7yJPub5',
    twitterConsumerApiSecretKey: process.env.TWITTER_CONSUMER_API_SECRET_KEY || '3coFZCfs1mjzBICWuO20NwsLEgnkYqSOTPQDTmUQPBTnd0LYYA',
    botometerApiHost: process.env.BOTOMETER_API_HOST || 'osome-botometer.p.rapidapi.com',
    botometerApiKey: process.env.BOTOMETER_API_KEY || '1af995785cmsh7db3b1b3daccbe3p161c6ejsnf9ebf9ad0429',
    databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/twitter_toxic_bot_filter',
    twitterAuthenticateUrl: (oauthToken: string) => `https://api.twitter.com/oauth/authenticate?oauth_token=${oauthToken}`,
    authSecret: process.env.AUTH_SECRET || 'chinforinfola'
}
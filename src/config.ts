export default {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3001,
    apiHost: process.env.API_HOST || 'localhost',
    webUrl: process.env.API_WEB_URL || 'http://localhost:3000/',
    twitterConsumerApiKey: process.env.API_TWITTER_CONSUMER_API_KEY || 'kCkSebfJEIEx5ZPo7I7yJPub5',
    twitterConsumerApiSecretKey: process.env.API_TWITTER_CONSUMER_API_SECRET_KEY || '3coFZCfs1mjzBICWuO20NwsLEgnkYqSOTPQDTmUQPBTnd0LYYA',
    botometerApiHost: process.env.API_BOTOMETER_API_HOST || 'osome-botometer.p.rapidapi.com',
    botometerApiKey: process.env.API_BOTOMETER_API_KEY || '1af995785cmsh7db3b1b3daccbe3p161c6ejsnf9ebf9ad0429',
    database: {
        host: process.env.API_DATABASE_HOST || 'localhost',
        port: process.env.API_DATABASE_PORT || '5432',
        username: process.env.API_DATABASE_USERNAME || 'postgres',
        password: process.env.API_DATABASE_PASSWORD || 'postgres',
        database: process.env.API_DATABASE_DATABASE || 'twitter_toxic_bot_filter'
    },
    twitterAuthenticateUrl: (oauthToken: string) => `https://api.twitter.com/oauth/authenticate?oauth_token=${oauthToken}`,
    authSecret: process.env.API_AUTH_SECRET || 'chinforinfola'
}
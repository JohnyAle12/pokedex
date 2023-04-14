export const AppConfiguration = () => ({
    environment: process.env.NODE_ENV || 'dev',
    port: process.env.APP_PORT || 3000,
    mongodb: process.env.MONGO_DB,
    defaultLimit: process.env.DEFAULT_LIMIT || 10
})
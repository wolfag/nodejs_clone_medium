export const config = {
  port: 3000,
  secret: 'wolfag',
  redisPort: 6379,
  redisHost: 'localhost',
  routes: {
    login: '/account/login',
    logout: 'account/logout',
  },
};

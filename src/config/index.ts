export const config = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'default_secret',
  EXPIRATION: process.env.JWT_EXPIRATION || '12h',
  ADMIN_ID: process.env.ADMIN_ID || '1',
  USER_ID: process.env.ADMIN_ID || '2', 
  SALTROUNDS: 10, // Default salt rounds for bcrypt
};

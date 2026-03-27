import dotenv from 'dotenv';

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  dbHost: process.env.DB_HOST || '127.0.0.1',
  dbPort: Number(process.env.DB_PORT || 3306),
  dbUser: process.env.DB_USER || 'root',
  dbPassword: process.env.DB_PASSWORD || 'example',
  dbName: process.env.DB_NAME || 'campus_complaints',
  jwtSecret: process.env.JWT_SECRET || 'replace_this_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h'
};

export default env;

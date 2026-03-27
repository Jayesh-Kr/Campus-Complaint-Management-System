import app from './app.js';
import env from './config/env.js';
import { testConnection } from './config/db.js';

const startServer = async () => {
  try {
    await testConnection();
    app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

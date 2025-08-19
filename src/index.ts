// src/index.ts

import app from './app';
import { config } from './config';
import { loadRoles, roleConfig } from './config/rolesConfig';
import mainRouter from './routes';

// This is the entry point for starting the server.
const startServer = async () => {
  try {
    await loadRoles(); // Load roles from the database.
    
    // Check if roles were loaded successfully using the correct 'roleConfig' object.
    if (!roleConfig.roles?.admin || !roleConfig.roles?.user) {
      console.error('Error: Required roles (admin/user) not found in the database. Please run the seeding script.');
      process.exit(1);
    }

    // Now that roles are loaded, we can set up the routes.
    app.use('/api', mainRouter);

    app.listen(config.PORT, () => {
      console.log(`Server is running at http://localhost:${config.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

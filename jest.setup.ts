import app from './src/app';
import mainRouter from './src/routes';
import { loadRoles } from './src/config/rolesConfig';
import { execSync } from 'child_process';

beforeAll(async () => {
  console.log('🚀 Migrating test DB...');
  execSync('npx prisma migrate dev', { stdio: 'inherit' });

  await loadRoles();

  app.use('/api', mainRouter);
});

afterAll(async () => {
  console.log('🧹 Cleaning up test DB...');
  // DB Cleanup or disconnect prisma here if needed
});
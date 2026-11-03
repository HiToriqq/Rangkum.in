import { app } from './app.js';
import { env } from './config/env.js';

const server = app.listen(env.PORT, () => {
  console.log(`\n🚀 Rangkum.in API Backend siap di port http://localhost:${env.PORT}`);
  console.log(`   STT Provider : ${env.STT_PROVIDER}`);
  console.log(`   LLM Provider : ${env.LLM_PROVIDER}`);
  console.log(`   CORS Origin  : ${env.CORS_ORIGIN}\n`);
});

process.on('SIGINT', () => {
  console.log('\nMematikan server API...');
  server.close(() => {
    process.exit(0);
  });
});

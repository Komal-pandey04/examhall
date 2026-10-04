import { env } from './config/env.js';
import { createApp } from './app.js';
import { db } from './db/database.js';
import { seedIfEmpty } from './db/seed.js';

if (seedIfEmpty()) console.log('Database was empty – sample questions loaded.');
if (!env.adminKey) console.warn('WARNING: ADMIN_KEY is not set – the admin panel is disabled.');

const server = createApp().listen(env.port, () => {
  console.log(`ExamHall API listening on port ${env.port}`);
  console.log(`Allowed origins: ${env.clientUrls.join(', ')}`);
});

function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

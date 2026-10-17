import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createServer } from './server.js';

const credentialsDirectory = process.env.CREDENTIALS_DIRECTORY;
if (!credentialsDirectory) throw new Error('Systemd credential directory is required.');

function readCredential(name) {
  return readFileSync(join(credentialsDirectory, name), 'utf8').trim();
}

const geminiKey = readCredential('gemini-api-key');
const backupKey = Buffer.from(readCredential('backup-encryption-key'), 'hex');
const port = Number(process.env.PORT || 38741);
const service = createServer({
  dbPath: process.env.DATABASE_PATH || '/var/lib/caloritrack/accounts.sqlite',
  allowedOrigin: process.env.APP_ORIGIN || 'https://caloritrack.144.91.96.77.sslip.io',
  geminiKey,
  backupKey,
  secureCookies: true
});

service.server.listen(port, '127.0.0.1', () => {
  console.info(`CaloriTrack API listening on 127.0.0.1:${port}`);
});

function shutdown() {
  service.close();
  setTimeout(() => process.exit(0), 1000).unref();
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

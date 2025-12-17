const fs = require('fs');
const path = require('path');
const https = require('http'); // Using http for local server

const LOG_ENDPOINT = 'http://127.0.0.1:7242/ingest/33b3fe3a-005c-4a78-ac5a-aad3fc8a9460';
const LOG_FILE = path.join(__dirname, '../.cursor/debug.log');

function log(message, data) {
  const payload = {
    location: 'saida-mobile/debug-check.js',
    message,
    data,
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: 'check-dependencies',
    hypothesisId: '1'
  };

  // Log to file
  try {
    fs.appendFileSync(LOG_FILE, JSON.stringify(payload) + '\n');
  } catch (e) {
    console.error('Failed to write to log file', e);
  }

  // Log to server
  try {
    fetch(LOG_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {});
  } catch (e) {}
  
  console.log(message, data);
}

log('Starting dependency check');

try {
  const reanimated = require.resolve('react-native-reanimated/package.json');
  log('Found react-native-reanimated', { path: reanimated });
} catch (e) {
  log('Failed to resolve react-native-reanimated', { error: e.message });
}

try {
  const worklets = require.resolve('react-native-worklets-core/package.json');
  log('Found react-native-worklets-core', { path: worklets });
} catch (e) {
  log('Failed to resolve react-native-worklets-core', { error: e.message });
}

try {
  const reanimatedPlugin = require.resolve('react-native-reanimated/plugin');
  log('Found react-native-reanimated/plugin', { path: reanimatedPlugin });
} catch (e) {
  log('Failed to resolve react-native-reanimated/plugin', { error: e.message });
}

log('Dependency check complete');


// Simple control server to manage Vite dev process
// Run: npm run control
// Provides endpoints:
// GET  /api/status -> { running, pid, url }
// POST /api/start  -> start dev server
// POST /api/stop   -> stop dev server
// POST /api/restart

const http = require('http');
const { spawn } = require('node:child_process');

let devProcess = null;
const DEV_URL = 'http://localhost:5173';
const CONTROL_PORT = process.env.CONTROL_PORT || 5555;

function startDev() {
  if (devProcess) return false;
  devProcess = spawn('npm', ['run', 'dev'], { shell: true, stdio: 'inherit' });
  devProcess.on('exit', () => { devProcess = null; });
  return true;
}
function stopDev() {
  if (!devProcess) return false;
  try {
    devProcess.kill('SIGINT');
  } catch {}
  devProcess = null;
  return true;
}
async function restartDev() {
  stopDev();
  await new Promise(r => setTimeout(r, 400));
  startDev();
  return true;
}

function json(res, code, obj) {
  const data = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' });
  res.end(data);
}

const server = http.createServer(async (req, res) => {
  const { url, method } = req;
  if (method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' });
    return res.end();
  }
  if (url === '/api/status' && method === 'GET') {
    return json(res, 200, { running: !!devProcess, pid: devProcess?.pid || null, url: devProcess ? DEV_URL : null });
  }
  if (url === '/api/start' && method === 'POST') {
    const ok = startDev();
    return json(res, ok ? 200 : 409, { started: ok });
  }
  if (url === '/api/stop' && method === 'POST') {
    const ok = stopDev();
    return json(res, ok ? 200 : 409, { stopped: ok });
  }
  if (url === '/api/restart' && method === 'POST') {
    await restartDev();
    return json(res, 200, { restarted: true });
  }
  if (url === '/' && method === 'GET') {
    res.writeHead(302, { Location: '/status.html' });
    return res.end();
  }
  res.writeHead(404); res.end('Not found');
});

server.listen(CONTROL_PORT, () => {
  console.log(`[control] Server listening on http://localhost:${CONTROL_PORT}`);
  console.log('[control] Endpoints: /api/status /api/start /api/stop /api/restart');
});

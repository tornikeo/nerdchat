import { error } from 'console';
import { WebSocketServer } from 'ws';

const PORT = 3831;
const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (ws, req) => {
  console.log('client connected:', req.socket.remoteAddress);

  ws.on('message', (data) => {
    // expect JSON messages { type, name, text }
    let msg;
    try { msg = JSON.parse(data.toString()); } catch(err) { 
      error(`error ${err}`); return; }

    // broadcast to all connected clients
    const out = JSON.stringify({
      from: msg.name || 'unknown',
      type: msg.type || 'message',
      text: msg.text || '',
      ts: Date.now()
    });

    for (const client of wss.clients) {
      if (client.readyState === client.OPEN) client.send(out);
    }
  });

  ws.on('close', () => console.log('client disconnected'));
});

console.log(`WebSocket server listening on ws://0.0.0.0:${PORT}`);

// print copyable command for remote CLI
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getLocalIPv4() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return '127.0.0.1';
}

const localIp = getLocalIPv4();
const relCmd = `node chat.js --server-url=ws://${localIp}:${PORT}`;

console.log('');
console.log('Give this command to the person on the other laptop:');
console.log('');
console.log(`  ${relCmd}`);
console.log('');
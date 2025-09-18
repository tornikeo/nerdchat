#!/usr/bin/env node
import { error } from 'console';
import { WebSocketServer } from 'ws';
// simple arg parser and help support
function getArg(name) {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '-h' || a === '--help') return 'HELP';
    if (a.startsWith(`${name}=`)) return a.split('=')[1];
    if (a === name && args[i + 1]) return args[i + 1];
  }
  return null;
}

if (getArg('-h') === 'HELP' || getArg('--help') === 'HELP') {
  console.log(`Usage: nerdserv [options]

Options:
  --port, -p <port>    Port to listen on (default: 3831)
  -h, --help           Show this help

Example:
  nerdserv --port 3831
`);
  process.exit(0);
}

const rawPort = getArg('--port') || getArg('-p');
const PORT = rawPort ? parseInt(rawPort, 10) || 3831 : 3831;
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
const relCmd = `nerdchat --server-url=ws://${localIp}:${PORT}`;

console.log(`To serve, allow 3831 port via 'sudo ufw allow 3831/tcp' first`);
console.log('Server is up. Give this command to the person next to you:');
console.log(`${relCmd}`);
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
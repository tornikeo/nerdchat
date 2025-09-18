import { log } from "console";
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({host: '0.0.0.0', port: 8080});

wss.on('connection', function connection(ws, req) {
  const ip = req.socket.remoteAddress;
  log(`connection from ${ip}`)
  
  ws.on('error', console.error);
  
  ws.on('message', function message(data, isBinary) {
    log(`received ${data} isBinary=${isBinary}`);
  });

  ws.send('something')
});

console.log(`listening on ws://${wss.options.host}:${wss.options.port}`);

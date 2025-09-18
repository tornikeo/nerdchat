// ...existing code...
import WebSocket from 'ws';
import readline from 'readline';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
  return new Promise(res => rl.question(question, ans => res(ans.trim())));
}

// simple arg parser: supports --server-url ws://192.168.1.2:3831
function getArg(name) {
  if (process.argv.length < 3) {
    throw Error("Invalid args - expected `--server-url ws://192.168.1.2:3831` or similar")
  }
  const a = process.argv[2];
  if (a.startsWith(`${name}=`)) 
    return a.split('=')[1];
  throw Error("Invalid args - expected `--server-url ws://192.168.1.2:3831` or similar")
}

const serverUrl = getArg('--server-url') || 'ws://127.0.0.1:3831';

// ...existing code...
(async () => {
  const name = await ask('Your name: ');
  const url = serverUrl;
  const ws = new WebSocket(url);

  ws.on('open', () => {
    console.log(`Connected to ${url}. Type messages and press Enter. Type /exit to quit.`);
    // announce join
    ws.send(JSON.stringify({ type: 'join', name, text: `${name} joined` }));
  });

  ws.on('message', (data) => {
    let msg;
    try { msg = JSON.parse(data.toString()); } catch { return; }
    // hide our own join broadcasts if desired; simple print
    const time = new Date(msg.ts || Date.now()).toLocaleTimeString();
    console.log(`[${time}] ${msg.from}: ${msg.text}`);
  });

  ws.on('close', () => {
    console.log('Disconnected from server');
    process.exit(0);
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err.message);
  });

  rl.on('line', (line) => {
    if (line.trim() === '/exit') {
      ws.close();
      rl.close();
      return;
    }
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'message', name, text: line }));
    } else {
      console.log('Not connected yet.');
    }
  });
})();
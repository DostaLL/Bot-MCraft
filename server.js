const express = require('express');
const http = require('http');
const { spawn } = require('child_process');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = new Set();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

function broadcastLog(data) {
  const msg = data.toString().trim();
  clients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    }
  });
}

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.send('[WebSocket подключён]');
  ws.on('close', () => clients.delete(ws));
});

app.post('/start-bot', (req, res) => {
  const { username, proxy, regCommand, roleplayCommand } = req.body;

  const botScript = `
    const mineflayer = require('mineflayer');
    const { SocksProxyAgent } = require('socks-proxy-agent');
    
    const options = {
      host: 'cheatmine.ru',
      port: 25565,
      username: ${JSON.stringify(username)},
      password: null,
      version: '1.12.2'
    };

    if (${JSON.stringify(proxy)} && ${JSON.stringify(proxy)}.trim() !== '') {
      options.agent = new SocksProxyAgent(${JSON.stringify(proxy)});
      console.log('[i] Используется прокси: ' + ${JSON.stringify(proxy)});
    } else {
      console.log('[i] Подключение с основного IP (без прокси)');
    }

    const bot = mineflayer.createBot(options);

    bot.once('spawn', () => {
      console.log('[+] Бот зашел на сервер');

      setTimeout(() => {
        bot.chat(${JSON.stringify(regCommand)});
        console.log('[>] Отправлена команда регистрации: ' + ${JSON.stringify(regCommand)});

        setTimeout(() => {
          bot.chat(${JSON.stringify(roleplayCommand)});
          console.log('[>] Отправлена команда: ' + ${JSON.stringify(roleplayCommand)});
        }, 7000);

      }, 5000);
    });

    bot.on('message', msg => console.log('[Чат] ' + msg.toString()));
    bot.on('error', err => console.error('[Ошибка]', err));
    bot.on('end', () => console.log('[!] Бот отключился от сервера'));
    bot.on('chat', (username, msg) => {
      if (username === bot.username) return;
      console.log('[' + username + '] ' + msg);
      if (msg.toLowerCase() === 'привет') {
        bot.chat('Привет, ' + username + '!');
      }
    });
  `;

  fs.writeFileSync('bot.js', botScript, 'utf-8');
  const botProcess = spawn('node', ['bot.js']);

  botProcess.stdout.on('data', data => broadcastLog(`[LOG] ${data}`));
  botProcess.stderr.on('data', data => broadcastLog(`[ERR] ${data}`));

  botProcess.on('close', code => {
    broadcastLog(`[INFO] Бот завершил работу (код ${code})`);
  });

  res.send('Бот запущен!');
});

server.listen(3000, () => {
  console.log('Сервер работает: http://localhost:3000');
});

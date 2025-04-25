const mineflayer = require('mineflayer');
const { SocksProxyAgent } = require('socks-proxy-agent');

const host = 'cheatmine.ru';
const port = 25565;
const username = 'ПроляАнблок';
const password = null;
const proxy = '';
const regCommand = '/reg 217755';
const roleplayCommand = '/roleplay';

function createBot() {
    const options = {
        host,
        port,
        username,
        password,
        version: '1.12.2'
    };

    if (proxy && proxy.trim() !== '') {
        options.agent = new SocksProxyAgent(proxy);
        console.log(`[i] Используется прокси: ${proxy}`);
    } else {
        console.log('[i] Подключение с основного IP (без прокси)');
    }

    const bot = mineflayer.createBot(options);

    bot.once('spawn', () => {
        console.log('[+] Бот зашел на сервер');

        setTimeout(() => {
            bot.chat(regCommand);
            console.log(`[>] Отправлена команда регистрации: ${regCommand}`);

            setTimeout(() => {
                bot.chat(roleplayCommand);
                console.log(`[>] Отправлена команда: ${roleplayCommand}`);
            }, 7000);

        }, 5000);
    });

    bot.on('message', message => {
        console.log(`[Чат] ${message.toString()}`);
    });

    bot.on('error', err => {
        console.error('[Ошибка]', err);
    });

    bot.on('end', () => {
        console.log('[!] Бот отключился от сервера');
    });

    bot.on('chat', (username, message) => {
        if (username === bot.username) return;
        console.log(`[${username}] ${message}`);

        if (message.toLowerCase() === 'привет') {
            bot.chat(`Привет, ${username}!`);
        }
    });
}

createBot();

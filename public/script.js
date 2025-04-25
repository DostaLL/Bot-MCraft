function startBot() {
  const username = document.getElementById('username').value || 'Ботик';
  const proxy = document.getElementById('proxy').value || '';
  const regCommand = document.getElementById('regCommand').value || '/reg 1234';
  const roleplayCommand = document.getElementById('roleplayCommand').value || '/roleplay';

  fetch('/start-bot', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ username, proxy, regCommand, roleplayCommand })
  })
  .then(res => res.text())
  .then(msg => appendToConsole(`[INFO] ${msg}`))
  .catch(err => appendToConsole(`[ERROR] ${err}`));
}

function appendToConsole(msg) {
  const consoleEl = document.getElementById('console');
  consoleEl.textContent += `\n${msg}`;
  consoleEl.scrollTop = consoleEl.scrollHeight;
}

const socket = new WebSocket(`ws://${location.host}`);

socket.addEventListener('message', event => {
  appendToConsole(event.data);
});

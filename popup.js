(() => {
  const intervalInput = document.getElementById('interval');
  const amountInput   = document.getElementById('amount');
  const btnStart      = document.getElementById('btn-start');
  const btnStop       = document.getElementById('btn-stop');
  const statusEl      = document.getElementById('status');

  // Restore saved settings from storage
  chrome.storage.local.get(['interval', 'amount', 'scrolling'], (data) => {
    if (data.interval) intervalInput.value = data.interval;
    if (data.amount)   amountInput.value   = data.amount;
    syncUI(!!data.scrolling);
  });

  function syncUI(isRunning) {
    btnStart.disabled = isRunning;
    btnStop.disabled  = !isRunning;
    statusEl.textContent = isRunning ? '● Scrolling…' : 'Idle';
    statusEl.className   = isRunning ? 'running' : '';
  }

  function getParams() {
    const interval = Math.max(50,  parseInt(intervalInput.value, 10) || 500);
    const amount   = Math.max(1,   parseInt(amountInput.value,   10) || 100);
    return { interval, amount };
  }

  function saveAndSend(action) {
    const params = getParams();
    // Normalise values back into inputs
    intervalInput.value = params.interval;
    amountInput.value   = params.amount;

    chrome.storage.local.set({
      interval: params.interval,
      amount:   params.amount,
      scrolling: action === 'start',
    });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;
      chrome.tabs.sendMessage(tabs[0].id, { action, ...params });
    });

    syncUI(action === 'start');
  }

  btnStart.addEventListener('click', () => saveAndSend('start'));
  btnStop.addEventListener('click',  () => saveAndSend('stop'));
})();

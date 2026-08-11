(() => {
  const intervalInput = document.getElementById('interval');
  const amountInput   = document.getElementById('amount');

  // Restore saved settings
  chrome.storage.local.get(['interval', 'amount'], (data) => {
    if (data.interval) intervalInput.value = data.interval;
    if (data.amount)   amountInput.value   = data.amount;
  });

  function applySettings() {
    const interval = Math.max(50, parseInt(intervalInput.value, 10) || 500);
    const amount   = Math.max(1,  parseInt(amountInput.value,   10) || 100);

    // Normalise displayed values
    intervalInput.value = interval;
    amountInput.value   = amount;

    chrome.storage.local.set({ interval, amount });

    // Push new settings to the active tab's content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;
      chrome.tabs.sendMessage(tabs[0].id, { action: 'settings', interval, amount });
    });
  }

  // Apply on any input change (live update)
  intervalInput.addEventListener('change', applySettings);
  amountInput.addEventListener('change',   applySettings);
})();

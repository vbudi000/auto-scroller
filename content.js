(() => {
  let timerId = null;

  function startScroll(interval, amount) {
    // Clear any existing timer before starting a new one
    stopScroll();
    timerId = setInterval(() => {
      window.scrollBy({ top: amount, behavior: 'smooth' });

      // Auto-stop when the page bottom is reached
      const atBottom =
        window.innerHeight + Math.round(window.scrollY) >= document.body.scrollHeight;
      if (atBottom) stopScroll();
    }, interval);
  }

  function stopScroll() {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'start') {
      startScroll(message.interval, message.amount);
    } else if (message.action === 'stop') {
      stopScroll();
    }
  });
})();

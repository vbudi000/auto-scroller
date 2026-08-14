(() => {
  // Prevent double-injection on re-inject
  if (window.__autoScrollerInit) return;
  window.__autoScrollerInit = true;

  let timerId  = null;
  let interval = 5000;
  let amount   = 100;

  // ── Scroll engine ──────────────────────────────────────────────────────────

  function startScroll() {
    stopScroll();
    timerId = setInterval(() => {
      window.scrollBy({ top: amount, behavior: 'smooth' });
      const atBottom =
        window.innerHeight + Math.round(window.scrollY) >= document.body.scrollHeight;
      if (atBottom) {
        stopScroll();
        setWidgetState(false);
      }
    }, interval);
    setWidgetState(true);
  }

  function stopScroll() {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function isRunning() { return timerId !== null; }

  // ── Floating widget ────────────────────────────────────────────────────────

  const HOST_ID = '__auto-scroller-widget__';

  function buildWidget() {
    if (document.getElementById(HOST_ID)) return;

    const host = document.createElement('div');
    host.id = HOST_ID;

    // Shadow DOM keeps styles isolated from the page
    const shadow = host.attachShadow({ mode: 'closed' });

    const style = document.createElement('style');
    style.textContent = `
      :host { all: initial; }

      #wrap {
        position: fixed;
        bottom: 18px;
        right: 18px;
        z-index: 2147483647;
        display: flex;
        align-items: center;
        gap: 0;
        background: rgba(30, 30, 30, 0.72);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        border-radius: 20px;
        padding: 4px 10px 4px 6px;
        font-family: -apple-system, "Segoe UI", system-ui, sans-serif;
        font-size: 11px;
        color: #e8e8e8;
        opacity: 0.35;
        transition: opacity 0.2s;
        user-select: none;
        cursor: default;
        white-space: nowrap;
      }

      #wrap:hover { opacity: 1; }

      #wrap.active { opacity: 0.85; }

      #toggle {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        padding: 0;
        margin-right: 6px;
        flex-shrink: 0;
        transition: background 0.15s;
        outline: none;
      }

      #toggle:hover { background: rgba(255,255,255,0.15); }

      #toggle svg { display: block; }

      #label {
        font-size: 11px;
        letter-spacing: 0.01em;
        color: #d0d0d0;
        min-width: 32px;
      }
    `;

    const wrap = document.createElement('div');
    wrap.id = 'wrap';

    const btn = document.createElement('button');
    btn.id = 'toggle';
    btn.title = 'Toggle auto-scroll';

    const label = document.createElement('span');
    label.id = 'label';
    label.textContent = 'Scroll';

    wrap.appendChild(btn);
    wrap.appendChild(label);
    shadow.appendChild(style);
    shadow.appendChild(wrap);
    document.documentElement.appendChild(host);

    btn.addEventListener('click', () => {
      if (isRunning()) {
        stopScroll();
        setWidgetState(false);
      } else {
        startScroll();
      }
    });

    setWidgetState(false);
  }

  function playIcon() {
    return `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="2,1 11,6 2,11" fill="#2eF757"/>
    </svg>`;
  }

  function stopIcon() {
    return `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="8" height="8" rx="1" fill="#fc4545"/>
    </svg>`;
  }

  function setWidgetState(running) {
    const host = document.getElementById(HOST_ID);
    if (!host || !host.shadowRoot) return;
    const shadow = host.shadowRoot;
    const wrap  = shadow.getElementById('wrap');
    const btn   = shadow.getElementById('toggle');
    const label = shadow.getElementById('label');

    if (running) {
      wrap.classList.add('active');
      btn.innerHTML  = stopIcon();
      btn.title      = 'Stop scrolling';
      label.textContent = 'Stop';
    } else {
      wrap.classList.remove('active');
      btn.innerHTML  = playIcon();
      btn.title      = 'Start scrolling';
      label.textContent = 'Scroll';
    }
  }

  // ── Message listener (settings updates from popup) ─────────────────────────

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'settings') {
      interval = message.interval;
      amount   = message.amount;
      // If currently running, restart with new settings
      if (isRunning()) startScroll();
    }
  });

  // ── Init ───────────────────────────────────────────────────────────────────

  // Load persisted settings then build widget
  chrome.storage.local.get(['interval', 'amount'], (data) => {
    if (data.interval) interval = data.interval;
    if (data.amount)   amount   = data.amount;
    buildWidget();
  });
})();

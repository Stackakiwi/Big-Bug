/* Big Bug v19.1.0-ios.2. Presentation only: no simulation, purchase grants,
   or save mutations live here. BigBugGame owns persisted settings and state. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const setText = (id, value) => { const el = $(id); if (el && el.textContent !== value) el.textContent = value; };
  let previousPlaying = false;
  let latestState = null;
  let settingsSignature = "";
  let settingButtons = [];
  const setData = (key, value) => { if (document.body.dataset[key] !== value) document.body.dataset[key] = value; };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function settingsSection() {
    if ($('bbMobileSettings')) return;
    const panel = document.querySelector('#settings .panel');
    if (!panel) return;
    const section = document.createElement('div');
    section.id = 'bbMobileSettings'; section.className = 'bbMobileSettings';
    section.setAttribute('aria-label', 'Touch and performance settings');
    const rows = [
      ['touchControls', 'Touch controls', 'Tap or drag on the garden, or use a thumb stick. A control deck is available when folded.', [['drag','TAP / DRAG'],['joystick','THUMB STICK']]],
      ['graphics', 'Performance', 'Auto balances detail and smooth play. Battery uses a lower render resolution.', [['auto','AUTO'],['battery','BATTERY']]],
      ['haptics', 'Haptics', 'Gentle feedback for game actions on supported devices.', [[true,'ON'],[false,'OFF']]],
      ['reduceMotion', 'Reduce motion', 'Reduce menu animation and screen effects. Your system preference is respected.', [[false,'SYSTEM'],[true,'REDUCED']]]
    ];
    for (const [setting, title, description, values] of rows) {
      const row = document.createElement('div'); row.className = 'bbMobileSetting';
      const labelId = `bb-setting-${setting}`;
      const text = document.createElement('div'); text.className = 'settingText';
      const titleEl = document.createElement('b'); titleEl.id = labelId; titleEl.textContent = title;
      const desc = document.createElement('div'); desc.className = 'muted'; desc.textContent = description;
      text.append(titleEl, desc);
      const options = document.createElement('div'); options.className = 'bbSettingOptions';
      options.setAttribute('role', 'group'); options.setAttribute('aria-labelledby', labelId);
      if (setting === 'touchControls') options.id = 'mobileTouchMode';
      for (const [value, label] of values) {
        const button = document.createElement('button'); button.type = 'button';
        button.dataset.mobileSetting = setting; button.dataset.mobileValue = String(value);
        button.textContent = label; button.setAttribute('aria-pressed', 'false');
        button.addEventListener('click', () => {
          const api = window.BigBugGame;
          if (!api || typeof api.setMobileSetting !== 'function') return;
          const result = api.setMobileSetting(setting, value);
          update(result && typeof result === 'object' ? result : api.getMobileState?.() || latestState || {});
        });
        options.append(button);
      }
      row.append(text, options); section.append(row);
    }
    const before = $('pcControlsRow') || panel.querySelector('.settingsHelpBtn');
    panel.insertBefore(section, before || null);
    settingButtons = Array.from(section.querySelectorAll("[data-mobile-setting]"));
  }

  function updateSettings(settings = {}) {
    const values = {
      touchControls: settings.touchControls === 'joystick' ? 'joystick' : 'drag',
      graphics: settings.graphics === 'battery' ? 'battery' : 'auto',
      haptics: settings.haptics !== false,
      reduceMotion: settings.reduceMotion === true
    };
    const effectiveReduceMotion = values.reduceMotion || reduceMotion.matches || !!window.BBMobile?.state.nativeLayout?.reduceMotion;
    const signature = JSON.stringify(values) + effectiveReduceMotion;
    if (signature === settingsSignature) return;
    settingsSignature = signature;
    for (const button of settingButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.mobileValue === String(values[button.dataset.mobileSetting])));
    }
    setData("bbControl", values.touchControls);
    setData("bbReduceMotion", String(effectiveReduceMotion));
  }

  function update(state = {}) {
    latestState = state;
    const settings = state.settings || {};
    updateSettings(settings);
    const playing = state.playing === true && state.paused !== true;
    setData("bbPlaying", String(playing));
    const folded = (document.body.dataset.bbLayout || '').startsWith('fold-');
    const joystick = settings.touchControls === 'joystick';
    const deck = $('mobileControlDeck');
    if (deck) {
      const visible = playing && (folded || joystick);
      if (deck.classList.contains('hidden') === visible) deck.classList.toggle('hidden', !visible);
      if (deck.getAttribute('aria-hidden') !== String(!visible)) deck.setAttribute('aria-hidden', String(!visible));
    }
    const mode = state.mode === 'endless' ? 'Mosquito Mode' : state.mode === 'gold' ? 'Gold Waves' : 'Story Mode';
    setText('mobileModeLabel', mode);
    setText('mobileWaveValue', `${Math.max(1, Math.floor(Number(state.wave) || 1))}`);
    setText('mobileHealthValue', `${Math.max(0, Math.ceil(Number(state.hp) || 0))} / ${Math.max(0, Math.ceil(Number(state.maxHp) || 0))}`);
    setText('mobileControlHint', 'Drag the thumb stick to move. Attacks are automatic.');
    if (playing && !previousPlaying) {
      const focus = document.activeElement;
      if (focus instanceof HTMLElement && focus.closest('.screen')) focus.blur();
    }
    previousPlaying = playing;
  }

  function refreshAccessibility() {
    const labels = {
      pauseBtn: 'Pause game',
      endlessTripleBtn: 'Use double attack boost', endlessRepelBtn: 'Use repellent',
      mobileJoystick: 'Movement control. Drag to move your bug.',
      gardenBookBtn: 'Open Garden Book', homeCreditsBtn: 'View credits'
    };
    for (const [id, label] of Object.entries(labels)) {
      const el = $(id); if (el) el.setAttribute('aria-label', label);
    }
    const joystick = $('mobileJoystick');
    if (joystick) { joystick.setAttribute('role', 'group'); joystick.setAttribute('aria-roledescription', 'touch movement control'); }
    for (const screen of document.querySelectorAll('.screen')) {
      const heading = screen.querySelector('h2');
      if (!heading) continue;
      if (!heading.id) heading.id = `bb-heading-${screen.id}`;
      screen.setAttribute('aria-labelledby', heading.id);
    }
    if (!$('bbAnnouncements')) {
      const live = document.createElement('div'); live.id = 'bbAnnouncements';
      live.className = 'bbVisuallyHidden'; live.setAttribute('role', 'status');
      live.setAttribute('aria-live', 'polite'); live.setAttribute('aria-atomic', 'true');
      document.body.append(live);
    }
  }

  function announce(message) { setText('bbAnnouncements', String(message || '')); }
  window.BigBugMobileUI = { update, refreshAccessibility, announce };
  settingsSection(); refreshAccessibility();
  const deck = $('mobileControlDeck');
  if (deck && typeof ResizeObserver === 'function') {
    const deckObserver = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (!rect || rect.height <= 0 || rect.width <= 0) return;
      // These only change presentation; native/root geometry remains authoritative.
      const height = deck.getBoundingClientRect().height;
      setData('bbDeckCompact', String(height < 260));
      setData('bbDeckTiny', String(height < 180));
    });
    deckObserver.observe(deck);
  }
  document.addEventListener('bigbug:state', event => update(event.detail || {}));
  document.addEventListener('bigbug:layout', () => update(window.BigBugGame?.getMobileState?.() || latestState || {}));
  reduceMotion.addEventListener?.('change', () => updateSettings(latestState?.settings || {}));
  update(window.BigBugGame?.getMobileState?.() || {});
})();

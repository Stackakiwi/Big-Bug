/* Big Bug iOS bridge — v19.1.0-ios.2. No web checkout or simulated success. */
(function () {
  'use strict';
  const PACKS = Object.freeze({
    'com.bigbug.game.gold50': 50,
    'com.bigbug.game.gold150': 150,
    'com.bigbug.game.gold300': 300,
    'com.bigbug.game.gold750': 750
  });
  const native = !!(window.__BB_NATIVE_HOST__ && window.webkit &&
    window.webkit.messageHandlers && window.webkit.messageHandlers.bigBugNative);
  const prices = new Map();
  let paymentsAllowed = false, busy = false, deliveryBlocked = false, readySent = false, lastPlaying = null;
  let deliveryQueue = Promise.resolve();
  const waitingDeliveries = [];
  const delivering = new Set();
  let lastLayout = null;
  const allowedActions = new Set(['ready', 'products', 'purchase', 'restore',
    'purchaseAcknowledged', 'saveBackup', 'haptic', 'activity']);

  function post(body) {
    if (!native || !body || !allowedActions.has(body.action)) return false;
    if (body.action === 'haptic' && window.BigBugGame && window.BigBugGame.getMobileState &&
        window.BigBugGame.getMobileState().haptics === false) return false;
    try { window.webkit.messageHandlers.bigBugNative.postMessage(body); return true; }
    catch (_) { return false; }
  }
  function status(message, error) {
    const node = document.getElementById('storeStatus');
    if (node) {
      node.textContent = message;
      node.setAttribute('role', error ? 'alert' : 'status');
    }
  }
  function refreshButtons() {
    Object.entries(PACKS).forEach(([id, amount]) => {
      const button = document.getElementById('goldPack' + amount);
      if (!button) return;
      button.dataset.productId = id;
      const price = prices.get(id);
      const enabled = native && paymentsAllowed && !!price && !busy && !deliveryBlocked;
      button.disabled = !enabled;
      button.setAttribute('aria-disabled', String(!enabled));
      button.textContent = price || (native ? 'Unavailable' : 'iOS App Only');
      button.setAttribute('aria-label', price ? amount + ' Gold Leaves, ' + price : amount + ' Gold Leaves, unavailable');
    });
    const restore = document.getElementById('restorePurchasesBtn');
    if (restore) restore.disabled = !native || busy;
  }
  function exportSnapshot() {
    try {
      const game = window.BigBugGame;
      return game && typeof game.exportSaveBackup === 'function' ? game.exportSaveBackup() : null;
    } catch (_) { return null; }
  }
  function snapshot() {
    const value = exportSnapshot();
    return value ? post({action: 'saveBackup', snapshot: value}) : false;
  }
  function queueDelivery(transaction) {
    if (!native || !transaction || typeof transaction.id !== 'string' ||
        !/^[0-9]{1,32}$/.test(transaction.id) || !Object.hasOwn(PACKS, transaction.productID)) return;
    const quantity = transaction.quantity === undefined ? 1 : transaction.quantity;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10 ||
        transaction.amount !== PACKS[transaction.productID] * quantity) return;
    if (!window.BigBugGame || typeof window.BigBugGame.grantPurchase !== 'function') {
      waitingDeliveries.push(transaction); return;
    }
    if (delivering.has(transaction.id)) return;
    delivering.add(transaction.id);
    deliveryQueue = deliveryQueue.then(async function () {
      busy = true; deliveryBlocked = true; refreshButtons();
      try {
        const result = await window.BigBugGame.grantPurchase(transaction);
        const successful = result === true || (result && result.ok === true);
        const saved = successful ? exportSnapshot() : null;
        if (!successful || !saved || !post({action: 'purchaseAcknowledged', transactionID: transaction.id, snapshot: saved})) {
          status('Your purchase is waiting for a safe save. Free some storage and reopen the shop to retry delivery.', true);
          busy = false; refreshButtons();
        } else {
          status('Saving your Gold Leaves…');
          // Keep buttons disabled until native confirms its second durable copy.
        }
      } catch (_) {
        status('The purchase has not finished saving. Reopen the shop to retry delivery without another charge.', true);
        busy = false; refreshButtons();
      } finally { delivering.delete(transaction.id); }
    }).catch(function () { busy = false; refreshButtons(); });
  }

  function receiveStoreEvent(event) {
    if (!native || !event || typeof event.type !== 'string') return;
    switch (event.type) {
      case 'ready':
        if (event.busy === false) { busy = false; deliveryBlocked = false; }
        refreshButtons(); break;
      case 'products':
        paymentsAllowed = event.canMakePayments === true;
        prices.clear();
        if (Array.isArray(event.products)) event.products.forEach(function (product) {
          if (Object.hasOwn(PACKS, product.id) && typeof product.price === 'string' && product.price.length < 80)
            prices.set(product.id, product.price);
        });
        status(!paymentsAllowed ? 'Purchases are restricted on this device.' : prices.size ? 'Optional Gold Leaf packs. Apple confirms every purchase.' : 'Packs are unavailable. Check your connection and try again.');
        refreshButtons(); break;
      case 'purchasing': busy = true; status('Confirm your purchase with Apple.'); refreshButtons(); break;
      case 'delivery': queueDelivery(event.transaction); break;
      case 'delivered':
        busy = false; deliveryBlocked = false; status('Gold Leaves saved. Thank you for supporting Big Bug.');
        refreshButtons();
        if (window.BigBugGame && window.BigBugGame.getMobileState) {
          const state = window.BigBugGame.getMobileState();
          if (state && state.haptics !== false) post({action: 'haptic', kind: 'success'});
        }
        break;
      case 'cancelled': busy = false; status('Purchase cancelled.'); refreshButtons(); break;
      case 'pending': busy = false; status(event.message || 'Waiting for purchase approval.'); refreshButtons(); break;
      case 'restoreComplete': busy = false; status(event.message || 'Purchases checked.'); refreshButtons(); break;
      case 'revoked': busy = false; status(event.message || 'A refunded purchase was not delivered.'); refreshButtons(); break;
      case 'error': case 'saveError': case 'unavailable':
        if (event.type === 'saveError') deliveryBlocked = true;
        busy = false; status(event.message || 'The shop is unavailable. Please try again later.', true); refreshButtons(); break;
      case 'backupError': status(event.message || 'A backup could not be saved.', true); break;
    }
  }
  function requestPurchase(productID) {
    if (!native || !paymentsAllowed || busy || deliveryBlocked || !prices.has(productID) || !Object.hasOwn(PACKS, productID)) return false;
    busy = true; refreshButtons();
    if (!post({action: 'purchase', productID: productID})) {
      busy = false; refreshButtons(); status('The App Store could not be reached.', true); return false;
    }
    return true;
  }
  function updateLayout(payload) {
    if (!native || !payload) return;
    lastLayout = payload;
    if (window.BigBugGame && typeof window.BigBugGame.updateNativeLayout === 'function')
      window.BigBugGame.updateNativeLayout(payload);
    // Observers can refresh their labels without becoming responsible for layout.
    window.dispatchEvent(new CustomEvent('bigbug:native-layout', {detail: payload}));
  }
  function lifecycle(payload) {
    if (!native) return;
    const state = typeof payload === 'string' ? payload : payload && payload.state;
    if (!['active', 'inactive', 'background'].includes(state)) return;
    if (window.BigBugGame && typeof window.BigBugGame.handleLifecycle === 'function')
      window.BigBugGame.handleLifecycle(state);
    if (state !== 'active') snapshot();
    window.dispatchEvent(new CustomEvent('bigbug:native-lifecycle', {detail: {state: state}}));
  }
  function gameReady() {
    if (!native || !window.BigBugGame) return;
    if (!readySent) { readySent = true; post({action: 'ready'}); }
    if (lastLayout && typeof window.BigBugGame.updateNativeLayout === 'function') window.BigBugGame.updateNativeLayout(lastLayout);
    while (waitingDeliveries.length) queueDelivery(waitingDeliveries.shift());
    snapshot();
  }

  window.BigBugNative = Object.freeze({
    available: native, products: PACKS, request: post, requestPurchase: requestPurchase,
    receiveStoreEvent: receiveStoreEvent, updateLayout: updateLayout, lifecycle: lifecycle,
    gameReady: gameReady, saveBackup: snapshot,
    receiveSaveBackup: function (payload) {
      if (!native) return;
      window.__BB_NATIVE_BACKUP__ = payload;
      if (window.BigBugGame && typeof window.BigBugGame.restoreNativeBackup === 'function') window.BigBugGame.restoreNativeBackup(payload);
    },
    refreshProducts: function () { if (native) post({action: 'products'}); },
    restorePurchases: function () {
      if (!native || busy) return false;
      busy = true; status('Checking purchases with Apple…'); refreshButtons();
      if (post({action: 'restore'})) return true;
      busy = false;
      status('The App Store could not be reached. Try again.', true);
      refreshButtons();
      return false;
    },
    haptic: function (kind) { return post({action: 'haptic', kind: kind || 'light'}); }
  });

  function bind() {
    Object.entries(PACKS).forEach(function ([id, amount]) {
      const button = document.getElementById('goldPack' + amount);
      if (button) button.addEventListener('click', function () { requestPurchase(id); });
    });
    const restore = document.getElementById('restorePurchasesBtn');
    if (restore) restore.addEventListener('click', window.BigBugNative.restorePurchases);
    const refresh = document.getElementById('refreshStoreBtn');
    if (refresh) refresh.addEventListener('click', window.BigBugNative.refreshProducts);
    document.addEventListener('click', function (event) {
      if (event.target && event.target.closest && event.target.closest('[data-action="goldShop"]') && native)
        post({action: 'products'});
    });
    refreshButtons();
    if (!native) status('Gold Leaf purchases are available in the iOS app. You can still earn Gold Leaves by playing.');
    gameReady();
    if (native) setInterval(function () {
      if (document.hidden || !window.BigBugGame || !window.BigBugGame.getMobileState) return;
      const playing = window.BigBugGame.getMobileState().playing === true;
      if (playing !== lastPlaying) { lastPlaying = playing; post({action: 'activity', playing: playing}); }
    }, 1000);
  }
  window.addEventListener('bigbug:game-ready', gameReady);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, {once: true});
  else bind();
})();

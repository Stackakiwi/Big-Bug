/* Big Bug v19.1.0-ios.10 — viewport, save bootstrap and render budget.
   Geometry comes from the current view and UIKit reserved regions, never a model name. */
(() => {
  'use strict';
  const REVISION_KEY = 'big_bug_native_revision_v1';
  const SAVE_KEYS = ['big_bug_save_v1', 'big_bug_gold_v1', 'big_bug_gold_unlocks_v1',
    'big_bug_first_help_seen_v1', 'big_bug_run_recovery_v1', REVISION_KEY];
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const number = (n, fallback = 0) => Number.isFinite(Number(n)) ? Number(n) : fallback;
  const isNative = !!window.webkit?.messageHandlers?.bigBugNative;
  const touch = isNative || navigator.maxTouchPoints > 0 || matchMedia('(pointer: coarse)').matches;
  let backupError = false;
  try {
    const backup = window.__BB_NATIVE_BACKUP__;
    const localRevision = number(localStorage.getItem(REVISION_KEY));
    let validLocal = false;
    try {
      const data=JSON.parse(localStorage.getItem('big_bug_save_v1'));
      validLocal=!!data&&typeof data==='object'&&!Array.isArray(data)&&data.schemaVersion===3&&
        ['goldLeaves','scrap','best'].every(key=>Number.isFinite(data[key])&&data[key]>=0)&&
        !!data.settings&&typeof data.settings==='object'&&!!data.upgrades&&typeof data.upgrades==='object';
      if(validLocal&&data.iapTransactions!==undefined){
        validLocal=!!data.iapTransactions&&typeof data.iapTransactions==='object'&&!Array.isArray(data.iapTransactions)&&
          Object.entries(data.iapTransactions).every(([id,v])=>/^\d{1,30}$/.test(id)&&v&&typeof v.productID==='string'&&Number.isSafeInteger(v.amount)&&v.amount>0);
      }
    } catch (_) {}
    if (backup && typeof backup.storage === 'object' &&
        (number(backup.revision) > localRevision || !validLocal)) {
      // Replay only application-owned keys. A null value is an intentional deletion.
      for (const key of SAVE_KEYS) if (Object.hasOwn(backup.storage, key)) {
        const value = backup.storage[key];
        if (value === null) localStorage.removeItem(key);
        else if (typeof value === 'string' && value.length <= 4000000) localStorage.setItem(key, value);
      }
      localStorage.setItem(REVISION_KEY, String(number(backup.revision)));
    }
  } catch (_) { backupError = true; }

  const state = {
    native: isNative, touch, backupError, nativeLayout: null, rect: null, controls: null,
    canvas: null, locked: null, quality: 1, frameCost: 0, frameGap: 1000/60,
    background: false, lastLayoutSignature: '', lastQualityAt: 0,
    settings: { touchControls: 'drag', haptics: true, reduceMotion: false },
    joystick: { active: false, x: 0, y: 0 }
  };
  const root = document.documentElement;
  document.body.dataset.bbTouch = String(touch);
  document.body.dataset.bbNative = String(isNative);
  document.body.dataset.bbPlaying = 'false';
  const safeProbe = document.createElement('div');
  safeProbe.setAttribute('aria-hidden', 'true');
  safeProbe.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
  document.body.appendChild(safeProbe);
  const css = (name, value) => root.style.setProperty(name, value + 'px');
  function systemSafeInsets() {
    const style = getComputedStyle(safeProbe);
    const n = state.nativeLayout?.safeInsets || {};
    return Object.fromEntries(['top','right','bottom','left'].map(side =>
      [side, Math.max(number(parseFloat(style['padding' + side[0].toUpperCase() + side.slice(1)])), number(n[side]))]));
  }
  function rect(value) {
    return { x: number(value.x), y: number(value.y), width: Math.max(0, number(value.width)), height: Math.max(0, number(value.height)) };
  }
  function overlap(a, b) {
    return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
  }
  function avoidOcclusions(pane, occlusions) {
    let r = { ...pane };
    for (const raw of occlusions) {
      const o = rect(raw); if (!overlap(r, o)) continue;
      // Keep the entire play/control pane clear of a camera or Dynamic Island.
      const choices = [
        { loss: o.y + o.height - r.y, edge:'top' },
        { loss: r.y + r.height - o.y, edge:'bottom' },
        { loss: o.x + o.width - r.x, edge:'left' },
        { loss: r.x + r.width - o.x, edge:'right' }
      ].filter(v => v.loss >= 0).sort((a,b) => a.loss-b.loss);
      const best = choices[0]; if (!best) continue;
      if (best.edge === 'top') { r.y += best.loss; r.height -= best.loss; }
      if (best.edge === 'bottom') r.height -= best.loss;
      if (best.edge === 'left') { r.x += best.loss; r.width -= best.loss; }
      if (best.edge === 'right') r.width -= best.loss;
    }
    r.width = Math.max(1, r.width); r.height = Math.max(1, r.height); return r;
  }
  function computeLayout() {
    const layout = state.nativeLayout;
    const width = Math.max(1, Math.round(layout?.width || window.visualViewport?.width || innerWidth));
    const height = Math.max(1, Math.round(layout?.height || window.visualViewport?.height || innerHeight));
    const safe = systemSafeInsets();
    let stage = { x:safe.left, y:safe.top, width:Math.max(1,width-safe.left-safe.right), height:Math.max(1,height-safe.top-safe.bottom) };
    let controls = { ...stage }, kind = width >= 600 ? 'expanded' : 'compact';
    const divisions = (layout?.divisions || []).map(rect).filter(d => (d.width > 0 || d.height > 0) && overlap(d, stage));
    const fold = divisions[0];
    if (fold) {
      const endX = stage.x + stage.width, endY = stage.y + stage.height;
      if (fold.width >= fold.height) {
        controls = { x:stage.x, y:Math.max(stage.y,fold.y+fold.height), width:stage.width, height:Math.max(1,endY-Math.max(stage.y,fold.y+fold.height)) };
        stage.height = Math.max(1,Math.min(endY,fold.y)-stage.y); kind='fold-horizontal';
      } else {
        controls = { x:Math.max(stage.x,fold.x+fold.width), y:stage.y, width:Math.max(1,endX-Math.max(stage.x,fold.x+fold.width)), height:stage.height };
        stage.width = Math.max(1,Math.min(endX,fold.x)-stage.x); kind='fold-vertical';
      }
    }
    stage = avoidOcclusions(stage, layout?.occlusions || []);
    controls = avoidOcclusions(controls, layout?.occlusions || []);
    // The painted floor can reach underneath hardware margins. The playable
    // field and controls still use the safe rect and stop at the Duo hinge.
    const surface = fold ? stage : { x:0, y:0, width, height };
    const insetLeft = stage.x - surface.x, insetTop = stage.y - surface.y;
    const insetRight = surface.x + surface.width - stage.x - stage.width;
    const insetBottom = surface.y + surface.height - stage.y - stage.height;
    state.rect = stage; state.surface = surface; state.controls = controls; state.kind = kind;
    state.width = width; state.height = height;
    document.body.dataset.bbLayout = kind;
    document.body.dataset.bbCompactHeight = String(stage.height < 500);
    css('--bb-app-width',width); css('--bb-app-height',height);
    for (const side of ['top','right','bottom','left']) {
      css('--bb-safe-'+side,safe[side]);
      css('--bb-stage-safe-'+side,0);
      css('--bb-menu-safe-'+side,0);
    }
    // Menus share the calculated safe pane in an open display too, where a
    // camera or window control can be reserved without an active fold.
    for (const [prefix,r] of [['stage',stage],['surface',surface],['menu',stage],['control',controls]]) {
      for (const [key,value] of Object.entries({left:r.x,top:r.y,width:r.width,height:r.height})) css('--bb-'+prefix+'-'+key,value);
    }
    const stageNode = document.getElementById('gameStage');
    if (stageNode) Object.assign(stageNode.style,{left:surface.x+'px',top:surface.y+'px',width:surface.width+'px',height:surface.height+'px'});
    for (const [side,value] of Object.entries({left:insetLeft,right:insetRight,top:insetTop,bottom:insetBottom})) {
      css('--bb-surface-inset-'+side,value);
    }
    let logical = state.locked;
    if (!logical) {
      const ratio = stage.width / stage.height, shortSide = 390;
      logical = ratio >= 1 ? {width:Math.min(900,Math.round(shortSide*ratio)),height:shortSide}
        : {width:shortSide,height:Math.min(900,Math.round(shortSide/ratio))};
    }
    const scale = Math.min(stage.width/logical.width,stage.height/logical.height);
    state.canvas = { width:logical.width,height:logical.height,scale,
      left:(stage.width-logical.width*scale)/2,top:(stage.height-logical.height*scale)/2 };
    const canvasNode = document.getElementById('game');
    if (canvasNode) {
      canvasNode.style.setProperty('inset','auto','important');
      for (const [key,value] of Object.entries({
        left:state.canvas.left+insetLeft, top:state.canvas.top+insetTop,
        width:logical.width*scale, height:logical.height*scale
      })) canvasNode.style.setProperty(key,value+'px','important');
    }
    return state.canvas;
  }
  function hasReducedRenderBudget() {
    return !!state.nativeLayout?.lowPower || number(state.nativeLayout?.thermalState) >= 2;
  }
  function renderScale(w,h) {
    const low = hasReducedRenderBudget();
    const pixels = (low ? 650000 : 1250000) * state.quality;
    const dprLimit = !low && state.touch && state.kind === 'compact' ? 2 : 1.75;
    const effectiveDPR = Math.min(number(devicePixelRatio,1), dprLimit) * (state.canvas?.scale || 1) * Math.sqrt(state.quality);
    return Math.max(.25,Math.min(effectiveDPR,Math.sqrt(pixels/Math.max(1,w*h))));
  }
  function targetFPS() { return 60; }
  function observeFrame(cost,now,gap) {
    if (state.background) return;
    state.frameCost = state.frameCost ? state.frameCost*.96+cost*.04 : cost;
    if (gap>0) state.frameGap=state.frameGap*.96+Math.min(gap,50)*.04;
    const elapsed=now-state.lastQualityAt;
    if (elapsed<2500) return;
    // Use missed draw deadlines as well as JavaScript work. A browser can have
    // a low refresh cap of its own, so also require evidence of rendering load.
    const underLoad=state.frameCost>13||(state.frameGap>19.5&&state.frameCost>7);
    const comfortable=state.frameCost<6&&state.frameGap<18&&elapsed>=9000;
    const next=underLoad?Math.max(.5,state.quality-.15):comfortable?Math.min(1,state.quality+.1):state.quality;
    if (next!==state.quality){
      state.quality=next;
      state.lastQualityAt=now;
      window.BigBugGame?.refreshViewport();
    }
  }
  function setNativeLayout(payload) {
    if(!payload||!Number.isFinite(payload.width)||!Number.isFinite(payload.height)||payload.width<=0||payload.height<=0)return;
    state.nativeLayout={...payload,divisions:Array.isArray(payload.divisions)?payload.divisions:[],occlusions:Array.isArray(payload.occlusions)?payload.occlusions:[]};
    const signature=JSON.stringify([payload.width,payload.height,payload.safeInsets,payload.divisions,payload.occlusions,payload.lowPower,payload.thermalState,payload.reduceMotion]);
    if(signature===state.lastLayoutSignature)return;
    state.lastLayoutSignature=signature;
    window.BigBugGame?.refreshViewport(true);
    if(!window.BigBugGame)computeLayout();
    applySettings(state.settings);
  }
  function applySettings(settings) {
    state.settings={...state.settings,...settings};
    document.body.dataset.bbControls=state.settings.touchControls;
    const reduced=!!state.settings.reduceMotion||!!state.nativeLayout?.reduceMotion||matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.body.dataset.bbReducedMotion=String(reduced);
    document.body.dataset.bbReduceMotion=String(reduced);
  }
  window.BBMobile={state,SAVE_KEYS,REVISION_KEY,computeLayout,renderScale,hasReducedRenderBudget,targetFPS,observeFrame,setNativeLayout,applySettings,
    lockArena(width,height){state.locked={width,height};},unlockArena(){state.locked=null;},
    isReducedMotion(){return document.body.dataset.bbReducedMotion==='true';}};
  const nativePending=window.__BB_NATIVE_LAYOUT__;
  if(nativePending)setNativeLayout(nativePending);
  applySettings(state.settings);
  let resizeToken=0;
  function changed(){cancelAnimationFrame(resizeToken);resizeToken=requestAnimationFrame(()=>{resizeToken=0;window.BigBugGame?.refreshViewport(true);});}
  window.visualViewport?.addEventListener('resize',changed);
  window.addEventListener('orientationchange',changed);
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change',()=>applySettings(state.settings));
})();

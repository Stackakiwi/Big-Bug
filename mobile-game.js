/* Big Bug v19.1.0-ios.10. Game-to-native boundary; no debug unlocks. */
(() => {
  'use strict';
  const platform=window.BBMobile;
  const products=Object.freeze({'com.bigbug.game.gold50':50,'com.bigbug.game.gold150':150,
    'com.bigbug.game.gold300':300,'com.bigbug.game.gold750':750});
  let backupTimer=0,lastStateAt=0,stickPointer=null,lastHapticAt=0;
  let previousGeometry=null;
  const joystick=document.getElementById('mobileJoystick');
  const thumb=document.getElementById('mobileJoystickThumb');
  function nativePost(message){
    if(!platform.state.native)return false;
    try{window.webkit.messageHandlers.bigBugNative.postMessage(message);return true;}catch(_){return false;}
  }
  function exportSaveBackup(){
    try{
      const storage={};for(const key of platform.SAVE_KEYS)storage[key]=localStorage.getItem(key);
      return {storage,revision:Math.max(0,Number(storage[platform.REVISION_KEY])||0)};
    }catch(_){return null;}
  }
  function flushNativeBackup(){
    clearTimeout(backupTimer);backupTimer=0;
    if(!platform.state.native)return false;
    const snapshot=exportSaveBackup();return snapshot?nativePost({action:'saveBackup',snapshot}):false;
  }
  function queueNativeBackup(){
    if(!platform.state.native||backupTimer)return;
    backupTimer=setTimeout(flushNativeBackup,350);
  }
  function grantPurchase(transaction){
    // Native StoreKit verifies the signed transaction before sending this message.
    if(!platform.state.native||!transaction||typeof transaction.id!=='string'||!/^\d{1,30}$/.test(transaction.id)||!Object.hasOwn(products,transaction.productID))return false;
    const quantity=transaction.quantity===undefined?1:transaction.quantity;
    if(!Number.isInteger(quantity)||quantity<1||quantity>10||transaction.amount!==products[transaction.productID]*quantity)return false;
    const id=transaction.id,existing=save.iapTransactions?.[id];
    if(existing){
      if(existing.productID!==transaction.productID||existing.amount!==transaction.amount)return false;
      try{const disk=JSON.parse(localStorage.getItem(SAVEKEY));return disk?.iapTransactions?.[id]?.productID===transaction.productID&&disk.iapTransactions[id].amount===transaction.amount;}catch(_){return false;}
    }
    const gold=(save.goldLeaves||0)+transaction.amount;
    if(!Number.isSafeInteger(gold))return false;
    const next={...save,goldLeaves:gold,iapTransactions:{...save.iapTransactions,
      [id]:{productID:transaction.productID,amount:transaction.amount,appliedAt:Date.now()}}};
    // Balance and delivery ID are one localStorage write. If it fails, neither is applied.
    if(!storageWrite(SAVEKEY,JSON.stringify(next)))return false;
    save=next;storageWrite(GOLDKEY,String(gold));refreshGoldUI();syncMobileState(performance.now(),true);
    return true;
  }
  function getMobileState(){
    return {version:'v19.1.0-ios.10',mode:game?.mode||'story',wave:game?.wave||1,
      hp:game?.p?.hp||0,maxHp:game?.p?.maxHp||100,playing:gameplayInputAllowed(),
      visible:gameplayVisible(),paused:!!game?.paused,settings:{...save.settings},
      haptics:save.settings.haptics!==false,layout:platform.state.kind,
      viewport:{width:W,height:H},renderScale:D,targetFPS:platform.targetFPS()};
  }
  function syncMobileState(now=performance.now(),force=false){
    if(!force&&now-lastStateAt<120)return;lastStateAt=now;
    const state=getMobileState();
    const playing=String(state.playing);if(document.body.dataset.bbPlaying!==playing)document.body.dataset.bbPlaying=playing;
    window.BigBugMobileUI?.update(state);
  }
  function setMobileSetting(key,value){
    if(!['touchControls','haptics','reduceMotion'].includes(key))return getMobileState();
    const allowed={touchControls:['drag','joystick'],haptics:[true,false],reduceMotion:[true,false]};
    if(!allowed[key].includes(value))return getMobileState();
    save.settings[key]=value;persist();resetGameInput();platform.applySettings(save.settings);
    syncMobileState(performance.now(),true);return getMobileState();
  }
  function resetJoystick(){
    stickPointer=null;Object.assign(platform.state.joystick,{active:false,x:0,y:0});
    if(thumb)thumb.style.transform='translate(-50%, -50%)';
    joystick?.classList.remove('active');
  }
  function updateJoystick(event){
    if(stickPointer!==event.pointerId||!gameplayInputAllowed())return;
    const r=joystick.getBoundingClientRect(),radius=Math.max(1,Math.min(r.width,r.height)*.32);
    let x=event.clientX-r.left-r.width/2,y=event.clientY-r.top-r.height/2;
    const magnitude=Math.hypot(x,y);if(magnitude>radius){x*=radius/magnitude;y*=radius/magnitude;}
    const dead=Math.hypot(x,y)<radius*.12;
    const normalized=Math.hypot(x,y)||1;
    // Constant speed preserves established game balance. The stick chooses direction.
    Object.assign(platform.state.joystick,{active:true,x:dead?0:x/normalized,y:dead?0:y/normalized});
    if(thumb)thumb.style.transform=`translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    if(event.cancelable)event.preventDefault();
  }
  if(joystick){
    joystick.addEventListener('pointerdown',event=>{
      if(!gameplayInputAllowed()||stickPointer!==null||(event.button!=null&&event.button!==0))return;
      resetGameInput();stickPointer=event.pointerId;initAudio();joystick.classList.add('active');
      try{joystick.setPointerCapture(stickPointer);}catch(_){}
      updateJoystick(event);event.stopPropagation();
    });
    joystick.addEventListener('pointermove',updateJoystick);
    const end=event=>{if(event.pointerId!==stickPointer)return;resetJoystick();if(game?.p){game.p.moveX=game.p.x;game.p.moveY=game.p.y;}};
    for(const type of ['pointerup','pointercancel','lostpointercapture'])joystick.addEventListener(type,end);
    joystick.addEventListener('contextmenu',event=>event.preventDefault());
  }
  function refreshViewport(interaction=false){
    const wasPlaying=gameplayInputAllowed(),before=previousGeometry;
    resize();const current=JSON.stringify([platform.state.kind,platform.state.width,platform.state.height,
      platform.state.rect,platform.state.controls,platform.state.canvas]);
    previousGeometry=current;
    // Power, thermal and accessibility updates also arrive as layout messages.
    // Keep a held touch intact unless the actual displayed geometry changed.
    if(interaction&&before!==null&&before!==current){
      resetGameInput();
      if(wasPlaying){
        // Layout changes never move game entities or silently restart a run.
        game.backgroundPaused=false;game.paused=true;saveRunRecovery('layout-change');
        refreshPauseStats();showGameUI(false);$('quitConfirm').classList.add('hidden');$('pauseMain').classList.remove('hidden');screen('pause');
      }
    }
    if(typeof resizeTitleGarden==='function')resizeTitleGarden();
    syncMobileState(performance.now(),true);
  }
  function handleLifecycle(state){
    if(state==='inactive'||state==='background'){
      api.nativeInactive=true;suspendGameForBackground();
    }else if(state==='active'){
      api.nativeInactive=false;resumeGameAfterBackground();
    }
  }
  function haptic(kind='light'){
    const now=performance.now();if(save.settings.haptics===false||now-lastHapticAt<180)return;
    lastHapticAt=now;nativePost({action:'haptic',kind});
  }
  const api={nativeInactive:false,getMobileState,setMobileSetting,syncMobileState,resetJoystick,
    refreshViewport,grantPurchase,exportSaveBackup,queueNativeBackup,flushNativeBackup,handleLifecycle,
    updateNativeLayout:payload=>platform.setNativeLayout(payload)};
  window.BigBugGame=api;
  platform.applySettings(save.settings);refreshViewport();
  document.addEventListener('click',event=>{
    if(event.target.closest('button:not(:disabled),.choice'))haptic('light');
    requestAnimationFrame(()=>syncMobileState(performance.now(),true));
  },{passive:true});
  // A bounded periodic checkpoint also protects against termination without pagehide.
  setInterval(()=>{if(game&&!game.over&&!platform.state.background){saveRunRecovery('periodic');flushNativeBackup();}},15000);
  if(platform.state.backupError)storageNotice();
  // Migrate a loaded desktop save to include mobile preferences and the receipt ledger.
  persist();flushNativeBackup();

  const privacy=document.createElement('section');privacy.id='privacy';privacy.className='screen hidden';
  privacy.innerHTML='<div class="panel"><h2>PRIVACY</h2><p>Big Bug stores your progress, settings, and purchase delivery records on this device. The game works offline after installation.</p><p>Optional Gold Leaf purchases are processed by Apple. Your payment details are not available to the game.</p><p>This build has no advertising, third-party analytics, account sign-in, or tracking code. It does not request access to your camera, microphone, contacts, or location.</p><p>Deleting the app can delete local progress and spent consumable purchases. Check Purchases completes pending deliveries; it does not recover spent Gold Leaves.</p><button class="btn dark" data-action="settingsFromHelp">BACK</button></div>';
  document.body.appendChild(privacy);screens.push('privacy');
  const settingsPanel=document.querySelector('#settings .panel');
  const privacyButton=document.createElement('button');privacyButton.className='btn dark';privacyButton.textContent='PRIVACY';privacyButton.type='button';
  privacyButton.onclick=()=>{showGameUI(false);screen('privacy');};
  settingsPanel.insertBefore(privacyButton,settingsPanel.querySelector('.settingsDanger'));
})();

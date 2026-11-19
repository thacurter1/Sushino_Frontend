(function(root){
 'use strict';
 const formatter=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
 function rome(now){return Object.fromEntries(formatter.formatToParts(now).map(p=>[p.type,p.value]));}
 function dateKey(p){return p.year+'-'+p.month+'-'+p.day;}
 function windows(date){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return [];
  const d=new Date(date+'T12:00:00Z');
  if(!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==date)return [];
  const day=d.getUTCDay();
  return [...(day===0||day>=4?[[750,900]]:[]),[1170,day>=3&&day<=6?1380:1410]];
 }
 const clock=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
 function slots(date,now=new Date(),lunchOnly=false){
  const p=rome(now),today=dateKey(p),minimum=Number(p.hour)*60+Number(p.minute)+Number(p.second)/60+30;
  if(date<today)return [];
  const out=[];
  for(const [start,end] of windows(date).filter(([start])=>!lunchOnly||start<900))for(let m=start;m+30<=end;m+=30){if(date>today||m>=minimum)out.push(clock(m)+'-'+clock(m+30));}
  return out;
 }
 function valid(mode,date,slot,now=new Date(),lunchOnly=false){return ['ritiro','delivery'].includes(mode)&&slots(date,now,lunchOnly).includes(slot);}
 function isLunchCart(cart,handles){return (cart.items||[]).some(item=>handles.includes(item.handle)||item.product_type==='Tropical Box Pranzo');}
 function isGiftOnlyCart(cart){const items=cart.items||[];return items.length>0&&items.every(item=>item.gift_card===true||item.handle==='tropical-gift-card');}
 const api={slots,valid,windows,isLunchCart,isGiftOnlyCart};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 root.SushinoServiceTime=api;
 if(typeof document==='undefined')return;
 function init(){
  const mode=document.getElementById('sushino-service-mode'),date=document.getElementById('sushino-service-date'),slot=document.getElementById('sushino-service-slot'),error=document.getElementById('sushino-service-error'),button=document.querySelector('[data-sushino-checkout]');
  if(!mode||!date||!slot||!button||mode.dataset.ready)return;
  mode.dataset.ready='true';let busy=false,lunchOnly=false,giftOnly=false;
  const serviceFields=document.getElementById('sushino-service-fields');
  function showServiceFields(){if(serviceFields)serviceFields.hidden=giftOnly;for(const field of [mode,date,slot])field.required=!giftOnly;}
  const lunchHandles=(button.dataset.lunchHandles||'').split(',').filter(Boolean);
  const lunchMessage='Le Tropical Box Pranzo sono disponibili solo giovedì, venerdì, sabato e domenica, dalle 12:30 alle 15:00. Scegli una fascia di pranzo oppure rimuovi le box pranzo.';
  const keys={mode:'Sushino - Modalita',date:'Sushino - Data',slot:'Sushino - Fascia'};
  function populate(){
   const previous=slot.value;date.min=dateKey(rome(new Date()));
   slot.replaceChildren(new Option('Scegli una fascia oraria',''));
   const available=slots(date.value,new Date(),lunchOnly);for(const s of available)slot.add(new Option(s.replace('-',' – '),s));
   if(available.includes(previous))slot.value=previous;
   slot.disabled=!date.value||available.length===0;
   error.textContent=lunchOnly?lunchMessage:date.value&&!available.length?'Nessuna fascia disponibile: scegli un altro giorno.':'';
  }
  date.addEventListener('change',populate);mode.addEventListener('change',()=>{error.textContent='';});
  document.addEventListener('sushino:cart-loaded',event=>{
   if(busy)return;giftOnly=isGiftOnlyCart(event.detail);showServiceFields();lunchOnly=isLunchCart(event.detail,lunchHandles);const a=event.detail.attributes||{};
   if(!mode.value)mode.value=a[keys.mode]==='Ritiro'?'ritiro':a[keys.mode]==='Consegna a domicilio'?'delivery':'';
   if(!date.value)date.value=a[keys.date]||dateKey(rome(new Date()));
   const old=slot.value||a[keys.slot];populate();if(slots(date.value,new Date(),lunchOnly).includes(old))slot.value=old;
  });
  button.addEventListener('click',async event=>{
   event.preventDefault();if(busy)return;
   if(!giftOnly&&!valid(mode.value,date.value,slot.value,new Date(),lunchOnly)){
    populate();error.textContent=lunchOnly?lunchMessage:'Scegli ritiro o consegna, giorno e una fascia ancora disponibile (almeno 30 minuti di anticipo).';
    (!mode.value?mode:!date.value?date:slot).focus();return;
   }
   busy=true;button.disabled=true;mode.disabled=true;date.disabled=true;slot.disabled=true;button.setAttribute('aria-disabled','true');const label=button.textContent;button.textContent='Salvataggio orario…';error.textContent='';
   try{
    if(giftOnly){
     const base=button.dataset.root||'/';
     const check=await fetch(base+'cart.js');
     if(!check.ok)throw Error('Non riesco a verificare il carrello. Riprova.');
     const latest=await check.json();
     if(!isGiftOnlyCart(latest)){giftOnly=false;showServiceFields();lunchOnly=isLunchCart(latest,lunchHandles);populate();throw Error('Il carrello contiene anche cibo: scegli ritiro o consegna e una fascia oraria.');}
     const attributes={[keys.mode]:'',[keys.date]:'',[keys.slot]:''};
     const saved=await fetch(base+'cart/update.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({attributes})});
     if(!saved.ok)throw Error('Non riesco ad aggiornare il carrello. Riprova.');
     const confirmed=await saved.json();
     if(!confirmed.item_count||!isGiftOnlyCart(confirmed)||Object.entries(attributes).some(([k,v])=>(confirmed.attributes?.[k]||'')!==v))throw Error('Il carrello è cambiato: riaprilo e riprova.');
     window.location.assign(button.dataset.checkoutUrl);return;
    }
    const attributes={[keys.mode]:mode.value==='ritiro'?'Ritiro':'Consegna a domicilio',[keys.date]:date.value,[keys.slot]:slot.value};
    const base=button.dataset.root||'/';
    const response=await fetch(base+'cart/update.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({attributes})});
    if(!response.ok)throw Error('Non riesco a salvare l’orario. Riprova.');
    const cart=await response.json();
    if(!cart.item_count||Object.entries(attributes).some(([k,v])=>cart.attributes?.[k]!==v))throw Error('Carrello o orario non confermato. Riapri il carrello e riprova.');
    lunchOnly=isLunchCart(cart,lunchHandles);
    if(!valid(mode.value,date.value,slot.value,new Date(),lunchOnly)){populate();throw Error(lunchOnly?lunchMessage:'La fascia è scaduta durante il salvataggio. Scegli un nuovo orario.');}
    window.location.assign(button.dataset.checkoutUrl);
   }catch(e){error.textContent=e.message||'Collegamento non riuscito. Riprova.';}
   finally{busy=false;button.disabled=false;mode.disabled=false;date.disabled=false;slot.disabled=false;button.removeAttribute('aria-disabled');button.textContent=label;}
  });
  populate();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})(typeof globalThis!=='undefined'?globalThis:this);

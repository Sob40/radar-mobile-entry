'use strict';
(()=>{
 const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const fragment=new URLSearchParams(location.hash.slice(1)).get('access');
 let key=fragment||'';
 try{key=key||localStorage.getItem('radar-personal-access')||'';if(fragment)localStorage.setItem('radar-personal-access',fragment);}catch{}
 // The key stays in the URL fragment (never sent to GitHub) so a saved favourite
 // also works if the browser clears local storage. No credentials in public files.
 async function endpoint(){
  try{const r=await fetch('https://api.github.com/repos/Sob40/radar-mobile-entry/contents/endpoint.json',{headers:{Accept:'application/vnd.github.raw+json'},cache:'no-store',signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error();return await r.json();}
  catch{const r=await fetch('endpoint.json?v='+Date.now(),{cache:'no-store',signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error();return await r.json();}
 }
 function cards(rows,url){return rows.map(r=>`<a class="route" href="${esc(url+'/field/?route='+encodeURIComponent(r.id)+'#access='+encodeURIComponent(key))}"><h2>${esc(r.name)}</h2><p>${r.visited} de ${r.total} visitas registradas</p><progress value="${Number(r.visited)||0}" max="${Number(r.total)||1}" aria-label="Progreso"></progress><div class="open"><span>Abrir ruta</span><span aria-hidden="true">→</span></div></a>`).join('');}
 async function load(){
  $('refresh').disabled=true;$('status').textContent='Buscando tus rutas…';$('routes').innerHTML='';$('archive').hidden=true;$('count').textContent='';
  try{
   if(!/^[A-Za-z0-9_-]{30,100}$/.test(key))throw Error('Abre tu enlace personal: en el Mac, entra en Rutas → Mi enlace móvil → Copiar enlace fijo. Solo tendrás que hacerlo una vez.');
   const target=await endpoint(),url=target.url;
   if(!/^https:\/\/[a-z0-9-]+\.trycloudflare\.com$/.test(url||''))throw Error('Radar está desconectado. Abre Radar en el Mac y vuelve a pulsar Actualizar.');
   const r=await fetch(url+'/api/mobile/routes',{headers:{Authorization:'Bearer '+key},cache:'no-store',signal:AbortSignal.timeout(15000)});
   if(r.status===401)throw Error('Este acceso se ha desconectado. Copia tu enlace personal desde Rutas en el Mac.');
   if(!r.ok)throw Error('connection');
   const data=await r.json(),active=data.routes.filter(r=>r.active!==false),finished=data.routes.filter(r=>r.active===false);
   $('routes').innerHTML=cards(active,url);$('finished').innerHTML=cards(finished,url);$('archive').hidden=!finished.length;
   $('count').textContent=active.length+' ruta'+(active.length===1?' activa':'s activas');$('status').textContent=active.length?'':'Todavía no tienes rutas activas. Crea una desde el Mac y aparecerá aquí.';
  }catch(e){$('status').textContent=e.message&&e.message!=='connection'&&!/fetch|network|timeout|abort/i.test(e.message)?e.message:'No se puede conectar con el Mac. Comprueba que esté encendido y Radar abierto; después pulsa Actualizar.';}
  finally{$('refresh').disabled=false;}
 }
 $('refresh').onclick=load;load();
})();

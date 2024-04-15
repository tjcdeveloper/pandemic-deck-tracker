(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const c of r)if(c.type==="childList")for(const l of c.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&o(l)}).observe(document,{childList:!0,subtree:!0});function t(r){const c={};return r.integrity&&(c.integrity=r.integrity),r.referrerPolicy&&(c.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?c.credentials="include":r.crossOrigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function o(r){if(r.ep)return;r.ep=!0;const c=t(r);fetch(r.href,c)}})();function $(){return window.crypto.getRandomValues(new Uint32Array(1))[0]}function _(e,n=!1){const t=$(),o=`_${t}`;return Object.defineProperty(window,o,{value:r=>(n&&Reflect.deleteProperty(window,o),e==null?void 0:e(r)),writable:!1,configurable:!0}),t}async function O(e,n={}){return new Promise((t,o)=>{const r=_(l=>{t(l),Reflect.deleteProperty(window,`_${c}`)},!0),c=_(l=>{o(l),Reflect.deleteProperty(window,`_${r}`)},!0);window.__TAURI_IPC__({cmd:e,callback:r,error:c,...n})})}const C={};function P(){document.querySelectorAll(".modal").forEach(e=>{const n=document.querySelector(`#${e.dataset.modalTriggerId}`);n!==null&&(n.onclick=t=>{t.preventDefault(),U(e.id)},e.querySelectorAll("button.modal-close").forEach(t=>{t.onclick=()=>k(e.id)}),e.querySelectorAll("button.modal-ok").forEach(t=>{const o="callback"in t.dataset?window[t.dataset.callback]:null;t.onclick=()=>k(e.id,o)}),C[e.id]={modal:e,trigger:n})})}function U(e){C[e].modal.classList.add("open")}function k(e,n){C[e].modal.classList.remove("open"),typeof n=="function"&&n()}function B(){document.querySelectorAll(".ts-toggle").forEach(e=>{const n=e.querySelector(".ts-toggle-btn"),t=e.querySelector(".ts-toggle-content");if(n===null||t===null)return;const o={elBtn:n,elContent:t};o.elContent.classList.add("hidden"),o.elBtn.onclick=r=>{r.preventDefault();let c=o.elBtn.dataset.altText??o.elBtn.innerText;o.elBtn.dataset.altText=o.elBtn.innerText,o.elBtn.innerText=c,o.elContent.classList.contains("hidden")?o.elContent.classList.remove("hidden"):o.elContent.classList.add("hidden")}})}let a=[],w=[],s=[],u=[],g,b,T,h,m,p;function i(e){return e.cloneNode(!0)}async function K(){await O("load_deck").then(e=>{a=JSON.parse(e),a.sort((n,t)=>n.card_name<t.card_name?-1:n.card_name>t.card_name?1:0)}).catch(e=>{console.error(e)})}function M(){const e=document.querySelector("#ts-epidemic-modal fieldset#ts-epidemic-cities");if(e===null){console.error("FATAL ERROR: Unable to find fieldset for epidemic modal radio buttons!");return}const n=document.createElement("div");n.classList.add("epidemic-modal_city");const t=document.createElement("input");t.setAttribute("type","radio"),t.name="epidemicCity",a.forEach(o=>{const r=i(n),c=i(t),l=document.createElement("label");c.id=`ts-epidemic-radio-${o.id.toString()}`,l.innerText=o.card_name,l.setAttribute("for",c.id),r.classList.add(o.colour.toLowerCase()),r.append(c,l),c.value=o.id.toString(),e.append(r)})}function F(){const e=document.querySelector("#draw-buttons");if(e===null){console.error("FATAL ERROR: Unable to find container for buttons!");return}const n=document.createElement("button");n.classList.add("btn","draw-btn"),a.forEach(t=>{const o=i(n);o.classList.add("btn-"+t.colour.toLowerCase()),o.innerText=t.card_name,o.onclick=()=>{A(t.id),L()},e.append(o)})}function I(){const e=document.createElement("div");e.classList.add("row","card-row");const n=document.createElement("div");n.classList.add("col-grow");const t=document.createElement("div");t.innerText="0",a.forEach(d=>{w[d.id]=d.number_of_copies,s[d.id]=u[d.id]=0;const f=i(n),E=i(t),v=i(e);f.innerText=`${d.card_name}:`,E.id=`ts-num-cards-unknown-${d.id}`,v.append(f,E);const q=i(f),R=i(t),S=i(e);R.id=`ts-num-cards-known-${d.id}`,S.append(q,R);const x=i(f),D=i(t),N=i(e);D.id=`ts-num-cards-discard-${d.id}`,N.append(x,D),g.append(v),b.append(S),T.append(N)}),e.classList.add("card-total"),n.innerText="Total:";const o=i(n);m=i(t);const r=i(e);m.id="ts-cards-total-known",r.append(o,m);const c=i(n);p=i(t);const l=i(e);p.id="ts-cards-total-discard",l.append(c,p),t.id="ts-cards-total-unknown",h=t,e.append(n,h),g.append(e),b.append(r),T.append(l)}function A(e,n=!1){s[e]===0&&w[e]===0||(!n&&s[e]>0?s[e]--:w[e]--,u[e]++)}function L(){let e=0,n=0,t=0;w.forEach((o,r)=>{y("unknown",r,o),e+=o}),s.forEach((o,r)=>{y("known",r,o),n+=o}),u.forEach((o,r)=>{y("discard",r,o),t+=o}),h.innerText=e.toString(),m.innerText=n.toString(),p.innerText=t.toString()}function y(e,n,t){const o=document.querySelector(`#ts-num-cards-${e}-${n}`);o!==null&&(o.innerText=t.toString())}window.addEventListener("DOMContentLoaded",()=>{K().then(()=>{console.log("Deck loaded"),M(),I(),F(),L()});let e=document.querySelector("#ts-cards-unknown"),n=document.querySelector("#ts-cards-known"),t=document.querySelector("#ts-cards-discard");if(e===null||n===null||t===null){console.error("FATAL ERROR: Missing div for cards. Cannot continue.");return}g=e,b=n,T=t,P(),B()});window.doEpidemic=()=>{console.log("Doing epidemic");const e=document.querySelector("#ts-epidemic-cities input:checked");console.log(e),e!==null&&A(Number(e.value),!0),u.forEach((n,t)=>{console.log(`Moving ${n} for city ${t}`),s[t]+=n,u[t]=0}),L()};
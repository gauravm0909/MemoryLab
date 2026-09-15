'use strict';

const $ = id => document.getElementById(id);
let dim = 12, alpha = 0.65, decay = 0.02, step = 0;
let M = makeMatrix(dim), facts = [], events = [], lastQuery = null;
const truth = new Map();
const palette = ['#00b4d7','#007ddc','#19a569','#eb8c23','#7350c3','#c8414b'];

function makeMatrix(n){ return Array.from({length:n},()=>Array(n).fill(0)); }
function hashString(s){ let h=2166136261>>>0; for(let i=0;i<s.length;i++){h^=s.charCodeAt(i); h=Math.imul(h,16777619);} return h>>>0; }
function vec(seed,n){ let x=hashString(seed)||1, a=[]; for(let i=0;i<n;i++){x^=x<<13;x^=x>>>17;x^=x<<5;x>>>=0;a.push(((x%2001)/1000)-1);} const norm=Math.hypot(...a)||1; return a.map(v=>v/norm); }
function dot(a,b){let s=0;for(let i=0;i<a.length;i++)s+=a[i]*b[i];return s}
function norm(a){return Math.hypot(...a)||1}
function cosine(a,b){return dot(a,b)/(norm(a)*norm(b));}
function keyVec(k){return vec('key:'+k,dim)}
function valueVec(v){return vec('value:'+v,dim)}
function read(q){ const qv=keyVec(q), out=Array(dim).fill(0); for(let i=0;i<dim;i++)for(let j=0;j<dim;j++)out[j]+=qv[i]*M[i][j]; return out; }
function candidates(){ return [...new Set(facts.map(f=>f.value).concat([...truth.values()]))]; }
function predict(q){ const out=read(q); let best=null, bestScore=-Infinity; for(const v of candidates()){const score=cosine(out,valueVec(v)); if(score>bestScore){bestScore=score;best=v;}} return {value:best,score:best===null?0:bestScore}; }
function writeFact(k,v,reason='memory write'){
  if(!k||!v)return;
  // Fixed-size recurrent associative memory: decay + rank-1 write.
  for(let i=0;i<dim;i++)for(let j=0;j<dim;j++)M[i][j]*=(1-decay);
  const kv=keyVec(k), vv=valueVec(v);
  for(let i=0;i<dim;i++)for(let j=0;j<dim;j++)M[i][j]+=alpha*kv[i]*vv[j];
  facts.push({key:k,value:v,step:++step}); truth.set(k,v); addEvent(reason,`${k} → ${v}`); render();
}
function addEvent(a,b){events.unshift({a,b,step}); events=events.slice(0,20); renderTimeline();}
function renderTimeline(){ $('eventCount').textContent=`${events.length} event${events.length===1?'':'s'}`; $('timeline').innerHTML=events.map(e=>`<div class="event"><b>t=${e.step}</b> · ${escapeHtml(e.a)} — ${escapeHtml(e.b)}</div>`).join(''); }
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function draw(){
  const c=$('heatmap'), ctx=c.getContext('2d'), W=c.width,H=c.height; ctx.clearRect(0,0,W,H); ctx.fillStyle='#071a2d';ctx.fillRect(0,0,W,H);
  const max=Math.max(0.0001,...M.flat().map(x=>Math.abs(x))), cell=Math.min(W,H)/dim, ox=(W-cell*dim)/2, oy=(H-cell*dim)/2;
  for(let i=0;i<dim;i++)for(let j=0;j<dim;j++){
    const v=M[i][j]/max, p=Math.min(1,Math.abs(v)), hue=v>=0?190:355;
    ctx.fillStyle=`hsla(${hue},85%,${25+45*p}%,${.25+.7*p})`;ctx.fillRect(ox+j*cell,oy+i*cell,Math.ceil(cell-1),Math.ceil(cell-1));
  }
  ctx.strokeStyle='#ffffff22';ctx.strokeRect(ox,oy,cell*dim,cell*dim);
}
function render(){
  $('alphaOut').value=alpha.toFixed(2);$('decayOut').value=decay.toFixed(2);$('dimOut').value=dim;
  $('stepLabel').textContent=`step ${step}`;$('stateSize').textContent=`${dim} × ${dim}`;$('factsCount').textContent=facts.length;
  const nz=M.flat().filter(v=>Math.abs(v)>1e-7).length;$('nonzero').textContent=nz;$('footprint').textContent=`${dim*dim} cells`;
  draw();
}
function recall(q){
  q=q.trim(); if(!q)return; lastQuery=q; const r=predict(q), gt=truth.get(q)||null;
  $('queryShown').textContent=q;$('prediction').textContent=r.value||'No learned answer';$('truth').textContent=gt||'Not available';
  $('confidence').textContent=r.value?`${Math.max(0,Math.min(1,(r.score+1)/2))*100|0}%`:'—';
  const correct=!!gt && r.value===gt; const badge=$('resultBadge'); badge.className='badge '+(gt?(correct?'good':'bad'):'neutral');badge.textContent=gt?(correct?'CORRECT':'INTERFERENCE'):'NO GROUND TRUTH';
  $('explanation').textContent=gt ? (correct?'The current state preserves enough signal to retrieve the expected value.':'The fixed state contains competing associations; the new write has interfered with the earlier association.') : 'This query has no registered ground truth. Add a fact first to create a measurable test.';
  addEvent('recall',`${q} → ${r.value||'unknown'} (score ${r.score.toFixed(2)})`);
}
function reset(){dim=Number($('dim').value);M=makeMatrix(dim);facts=[];truth.clear();events=[];step=0;lastQuery=null;$('queryShown').textContent='—';$('prediction').textContent='—';$('truth').textContent='—';$('confidence').textContent='—';$('resultBadge').className='badge neutral';$('resultBadge').textContent='No query';$('explanation').textContent='Run the preset or write a fact, then query it. Try a conflict to expose interference.';renderTimeline();render();}
function preset(){reset(); const seq=[['France','Paris'],['Germany','Berlin'],['Japan','Tokyo'],['Italy','Rome'],['Spain','Madrid']]; seq.forEach(([k,v])=>writeFact(k,v,'guided write')); setTimeout(()=>recall('Germany'),80);}
function conflict(){if(!facts.length){preset();setTimeout(conflict,120);return} const base=facts[0]; writeFact(base.key, base.value==='Paris'?'Lyon':'Wrong-'+base.value,'conflicting write'); setTimeout(()=>recall(base.key),80);}

$('alpha').addEventListener('input',e=>{alpha=Number(e.target.value);render()});
$('decay').addEventListener('input',e=>{decay=Number(e.target.value);render()});
$('dim').addEventListener('input',e=>{dim=Number(e.target.value);reset()});
$('resetBtn').onclick=reset;$('presetBtn').onclick=preset;$('conflictBtn').onclick=conflict;
$('addBtn').onclick=()=>writeFact($('factKey').value.trim(),$('factValue').value.trim(),'manual write');
$('queryBtn').onclick=()=>recall($('query').value);
$('query').addEventListener('keydown',e=>{if(e.key==='Enter')recall(e.target.value)});

reset();

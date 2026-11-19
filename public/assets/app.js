document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('moodChart');
  if (canvas && Array.isArray(window.moodData)) drawMoodChart(canvas, window.moodData);

  const form = document.getElementById('chatForm');
  if (!form) return;
  const input = document.getElementById('chatInput');
  const list = document.getElementById('chatMessages');
  const status = document.getElementById('chatStatus');
  const send = form.querySelector('button');
  function addBubble(text, who, label='') {
    const wrap = document.createElement('div');
    wrap.className = 'chat-bubble ' + (who === 'user' ? 'user-bubble' : 'assistant-bubble');
    const p = document.createElement('p');
    p.textContent = text;
    wrap.appendChild(p);
    if (label) { const small=document.createElement('small'); small.textContent=label; wrap.appendChild(small); }
    list.appendChild(wrap); list.scrollTop = list.scrollHeight;
  }
  async function sendMessage(text) {
    if (!text.trim()) return;
    addBubble(text, 'user'); input.value=''; send.disabled=true; status.textContent='Thinking…';
    try {
      const response = await fetch('/api/chat', {
        method:'POST',
        headers:{'Content-Type':'application/json','X-CSRF-Token':window.APP_CSRF || ''},
        body:JSON.stringify({message:text})
      });
      const data=await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to send message.');
      addBubble(data.reply, 'assistant', data.mode === 'gemma' ? 'Gemma-generated · Verify important health information with a professional' : (data.mode === 'safety' ? 'Safety guidance' : 'Fallback guidance · Gemma service unavailable'));
      status.textContent='Please use professional medical care for diagnosis or treatment.';
    } catch(e) {
      addBubble(e.message || 'Something went wrong. Please try again.', 'assistant');
      status.textContent='Message could not be sent.';
    } finally { send.disabled=false; input.focus(); }
  }
  form.addEventListener('submit', e=>{e.preventDefault();sendMessage(input.value);});
  document.querySelectorAll('[data-prompt]').forEach(b=>b.addEventListener('click',()=>sendMessage(b.dataset.prompt)));
});

function drawMoodChart(canvas, data) {
  const ctx=canvas.getContext('2d'), dpr=window.devicePixelRatio||1, width=canvas.clientWidth||500, height=220;
  canvas.width=width*dpr; canvas.height=height*dpr; ctx.scale(dpr,dpr);
  const pad={l:34,r:16,t:20,b:34}, w=width-pad.l-pad.r, h=height-pad.t-pad.b;
  ctx.clearRect(0,0,width,height); ctx.font='11px Inter, Arial'; ctx.fillStyle='#89939a'; ctx.strokeStyle='#edf0ef'; ctx.lineWidth=1;
  for(let v=1;v<=5;v++){const y=pad.t+h-(v-1)*h/4;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(width-pad.r,y);ctx.stroke();ctx.fillText(String(v),8,y+4);}
  if(!data.length)return;
  const pts=data.map((d,i)=>({x:pad.l+(data.length===1?w/2:i*w/(data.length-1)),y:pad.t+h-(d.value-1)*h/4,label:d.label}));
  ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle='#159b8b';ctx.lineWidth=3;ctx.lineJoin='round';ctx.stroke();
  pts.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,4,0,Math.PI*2);ctx.fillStyle='#159b8b';ctx.fill();ctx.fillStyle='#89939a';ctx.textAlign='center';ctx.fillText(p.label,p.x,height-10);});
}

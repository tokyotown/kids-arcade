/* ===================================================================
   ARCADE EXTRAS — shared premium layer
   • Original pop-style background music (bass + chords + melody + drums)
   • Custom-name leaderboard entry (friends can save their own scores)
   • Crowd-roar + air-horn "hype" blast for streaks / records
   • Auto-injected mute button
   Exposes: window.ARCADE
   =================================================================== */
window.ARCADE = (function(){
  let AC=null;
  function ac(){ if(!AC){ try{ AC=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } if(AC&&AC.state==="suspended") AC.resume(); return AC; }

  /* ---------- note frequencies ---------- */
  const N={ C2:65.41,D2:73.42,E2:82.41,F2:87.31,G2:98.00,A2:110.00,B2:123.47,
    C3:130.81,D3:146.83,E3:164.81,F3:174.61,G3:196.00,A3:220.00,B3:246.94,
    C4:261.63,D4:293.66,E4:329.63,F4:349.23,G4:392.00,A4:440.00,B4:493.88,
    C5:523.25,D5:587.33,E5:659.25,F5:698.46,G5:783.99,A5:880.00 };
  // Chords for the classic pop loop I–V–vi–IV (C G Am F) and a brighter one
  function tri(a,b,c){ return [a,b,c]; }
  const TRACKS={
    // upbeat, bouncy — Hoops
    hoops:{ bpm:114, bars:[
      {bass:N.C2, chord:tri(N.C4,N.E4,N.G4), lead:[N.G4,N.C5,N.E5,N.C5]},
      {bass:N.G2, chord:tri(N.B3,N.D4,N.G4), lead:[N.D5,N.B4,N.G4,N.B4]},
      {bass:N.A2, chord:tri(N.A3,N.C4,N.E4), lead:[N.E5,N.C5,N.A4,N.C5]},
      {bass:N.F2, chord:tri(N.F3,N.A3,N.C4), lead:[N.A4,N.C5,N.F5,N.C5]} ] },
    // driving, adventurous — Hunting
    hunt:{ bpm:108, bars:[
      {bass:N.A2, chord:tri(N.A3,N.C4,N.E4), lead:[N.A4,N.E5,N.C5,N.E5]},
      {bass:N.F2, chord:tri(N.F3,N.A3,N.C4), lead:[N.F5,N.C5,N.A4,N.C5]},
      {bass:N.C3, chord:tri(N.C4,N.E4,N.G4), lead:[N.G4,N.C5,N.G4,N.E4]},
      {bass:N.G2, chord:tri(N.G3,N.B3,N.D4), lead:[N.B4,N.D5,N.G4,N.D5]} ] },
    // bright & happy — everything else
    fun:{ bpm:120, bars:[
      {bass:N.C2, chord:tri(N.C4,N.E4,N.G4), lead:[N.E5,N.G5,N.E5,N.C5]},
      {bass:N.A2, chord:tri(N.A3,N.C4,N.E4), lead:[N.C5,N.E5,N.A4,N.C5]},
      {bass:N.F2, chord:tri(N.F3,N.A3,N.C4), lead:[N.A4,N.C5,N.F5,N.A5]},
      {bass:N.G2, chord:tri(N.G3,N.B3,N.D4), lead:[N.D5,N.B4,N.G4,N.D5]} ] }
  };

  /* ---------- music engine (lookahead scheduler) ---------- */
  const music={
    timer:null, step:0, track:null, next:0, master:null, started:false,
    get muted(){ return localStorage.getItem("arcade_muted")==="1"; },
    setMuted(m){ try{ localStorage.setItem("arcade_muted", m?"1":"0"); }catch(e){} if(this.master){ const a=ac(); this.master.gain.setTargetAtTime(m?0:0.16, a.currentTime, 0.05); } updateMuteBtn(); },
    toggle(){ this.setMuted(!this.muted); },
    ensure(name){ if(this.started) return; this.start(name); },
    start(name){ const a=ac(); if(!a) return; this.track=TRACKS[name]||TRACKS.fun; this.started=true; this.step=0;
      if(!this.master){ this.master=a.createGain(); this.master.gain.value=this.muted?0:0.16; this.master.connect(a.destination); }
      this.next=a.currentTime+0.12; if(this.timer) clearInterval(this.timer); this.timer=setInterval(()=>this.sched(),25); },
    stop(){ if(this.timer){ clearInterval(this.timer); this.timer=null; } this.started=false; },
    sched(){ const a=ac(); if(!a||!this.track) return; const spb=(60/this.track.bpm)/4; // 16 steps per bar
      while(this.next < a.currentTime+0.18){ this.play(this.step, this.next, spb); this.next+=spb; this.step++; } },
    voice(freq,t,dur,type,vol){ const a=ac(); const o=a.createOscillator(),g=a.createGain(); o.type=type; o.frequency.value=freq;
      g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+0.02); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
      o.connect(g); g.connect(this.master); o.start(t); o.stop(t+dur+0.02); },
    drum(t,kind){ const a=ac(); if(kind==="kick"){ const o=a.createOscillator(),g=a.createGain(); o.type="sine"; o.frequency.setValueAtTime(140,t); o.frequency.exponentialRampToValueAtTime(45,t+0.12); g.gain.setValueAtTime(0.5,t); g.gain.exponentialRampToValueAtTime(0.0001,t+0.14); o.connect(g); g.connect(this.master); o.start(t); o.stop(t+0.16); }
      else { const n=a.createBufferSource(); const len=Math.floor(a.sampleRate*(kind==="snare"?0.14:0.04)); const b=a.createBuffer(1,len,a.sampleRate); const d=b.getChannelData(0); for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len); n.buffer=b; const g=a.createGain(); g.gain.value=kind==="snare"?0.18:0.08; const hp=a.createBiquadFilter(); hp.type="highpass"; hp.frequency.value=kind==="snare"?1200:6000; n.connect(hp); hp.connect(g); g.connect(this.master); n.start(t); } },
    play(gstep, t, spb){ const p=this.track; const bars=p.bars.length; const bar=Math.floor((gstep%(bars*16))/16), sib=gstep%16; const B=p.bars[bar];
      // bass on each quarter
      if(sib%4===0) this.voice(B.bass, t, spb*3.6, "triangle", 0.22);
      // chord pad at bar start (sustained-ish)
      if(sib===0){ B.chord.forEach(f=> this.voice(f, t, spb*14, "sine", 0.05)); }
      // lead melody: one note per quarter
      if(sib%4===0){ const note=B.lead[(sib/4)|0]; if(note) this.voice(note, t+spb*0.1, spb*2.2, "square", 0.06); }
      // extra lead flourish on the "and" of beats for bounce
      if(sib%4===2){ const note=B.lead[(sib/4)|0]; if(note) this.voice(note*1.0, t, spb*0.8, "square", 0.035); }
      // drums
      if(sib===0||sib===8) this.drum(t,"kick");
      if(sib===4||sib===12) this.drum(t,"snare");
      if(sib%2===0) this.drum(t,"hat");
    }
  };

  /* ---------- hype: "OH YEAH" clip, with synth fallback ---------- */
  let ohyeah=null;
  function hype(){
    try{ if(!ohyeah){ ohyeah=new Audio("ohyeah.mp3"); ohyeah.volume=0.9; } ohyeah.currentTime=0;
      const p=ohyeah.play(); if(p&&p.catch) p.catch(function(){ synthHype(); }); return; }catch(e){}
    synthHype();
  }
  function synthHype(){ const a=ac(); if(!a) return; const g=a.createGain(); g.gain.value=0.0001; g.connect(a.destination);
    const t=a.currentTime;
    // air horn: three stacked saw tones with vibrato
    [220,277,330].forEach((f,i)=>{ const o=a.createOscillator(); o.type="sawtooth"; o.frequency.value=f;
      const lfo=a.createOscillator(); lfo.frequency.value=6; const lg=a.createGain(); lg.gain.value=6; lfo.connect(lg); lg.connect(o.frequency); lfo.start(t); lfo.stop(t+0.9);
      o.connect(g); o.start(t+i*0.02); o.stop(t+0.9); });
    // crowd roar: filtered noise swell
    const len=Math.floor(a.sampleRate*1.2); const buf=a.createBuffer(1,len,a.sampleRate); const d=buf.getChannelData(0); for(let i=0;i<len;i++)d[i]=(Math.random()*2-1);
    const n=a.createBufferSource(); n.buffer=buf; n.loop=false; const bp=a.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=900; bp.Q.value=0.6; const ng=a.createGain(); ng.gain.setValueAtTime(0.0001,t); ng.gain.exponentialRampToValueAtTime(0.3,t+0.25); ng.gain.exponentialRampToValueAtTime(0.0001,t+1.2);
    n.connect(bp); bp.connect(ng); ng.connect(a.destination); n.start(t);
    g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.22,t+0.05); g.gain.setValueAtTime(0.22,t+0.5); g.gain.exponentialRampToValueAtTime(0.0001,t+0.95);
  }

  /* ---------- custom-name leaderboard ---------- */
  function lastName(def){ return (localStorage.getItem("arcade_lastname")||def||"PLAYER").toUpperCase(); }
  function promptName(def, score){
    return new Promise(res=>{
      const ov=document.createElement("div"); ov.style.cssText="position:fixed;inset:0;z-index:99998;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.55);font-family:'Trebuchet MS',sans-serif;";
      const card=document.createElement("div"); card.style.cssText="background:#20143a;border:3px solid #ffd84d;border-radius:18px;padding:22px 24px;text-align:center;color:#fff;max-width:320px;box-shadow:0 16px 50px rgba(0,0,0,.6);";
      card.innerHTML="<div style='font-size:22px;font-weight:bold;color:#ffd84d;margin-bottom:4px'>🏆 High Score!</div>"+
        "<div style='font-size:32px;font-weight:bold'>"+score+"</div>"+
        "<div style='opacity:.85;margin:6px 0 10px'>Enter a name for the leaderboard:</div>"+
        "<input id='axName' maxlength='10' value='"+def+"' style=\"font-family:inherit;font-size:20px;font-weight:bold;text-align:center;text-transform:uppercase;width:180px;padding:9px;border-radius:10px;border:2px solid #8a5cff;background:#160e2c;color:#fff\">"+
        "<div style='display:flex;gap:8px;justify-content:center;margin-top:14px'>"+
        "<button id='axSave' style='cursor:pointer;border:none;border-radius:999px;padding:10px 20px;font-family:inherit;font-weight:bold;font-size:16px;color:#fff;background:linear-gradient(150deg,#8a5cff,#ff5fa2)'>Save</button>"+
        "<button id='axSkip' style='cursor:pointer;border:none;border-radius:999px;padding:10px 18px;font-family:inherit;font-weight:bold;font-size:15px;color:#fff;background:rgba(255,255,255,.16)'>Skip</button></div>";
      ov.appendChild(card); document.body.appendChild(ov);
      const inp=card.querySelector("#axName"); setTimeout(()=>{inp.focus(); inp.select();},60);
      function done(v){ if(ov.parentNode) ov.parentNode.removeChild(ov); res(v); }
      card.querySelector("#axSave").onclick=()=>{ const v=(inp.value||def).toUpperCase().replace(/[^A-Z0-9 ]/g,"").slice(0,10)||def; try{localStorage.setItem("arcade_lastname",v);}catch(e){} done(v); };
      card.querySelector("#axSkip").onclick=()=>done(null);
      inp.onkeydown=(e)=>{ if(e.key==="Enter") card.querySelector("#axSave").click(); };
    });
  }
  async function saveScore(profile, game, defName, score){
    if(!(score>0)) return;
    let qualifies=true;
    try{ const r=await fetch("/.netlify/functions/scores",{cache:"no-store"}); if(r.ok){ const data=await r.json(); const list=data[profile+":"+game]||[]; qualifies = list.length<10 || score>(list[list.length-1]?list[list.length-1].score:0); } }catch(e){ qualifies=true; }
    if(!qualifies) return;
    hype(); // "OH YEAH" — a new top score!
    const name=await promptName(lastName(defName), score);
    if(name===null) return;
    try{ fetch("/.netlify/functions/scores",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({profile:profile, game:game, name:name, score:score})}).catch(function(){}); }catch(e){}
  }

  /* ---------- mute button (auto-injected) ---------- */
  let muteBtn=null;
  function updateMuteBtn(){ if(muteBtn) muteBtn.textContent = music.muted? "🔇" : "🎵"; }
  function injectMuteButton(){ if(muteBtn) return; muteBtn=document.createElement("button");
    muteBtn.style.cssText="position:fixed;bottom:12px;right:12px;z-index:99997;width:44px;height:44px;border-radius:50%;border:2px solid rgba(255,255,255,.4);background:rgba(0,0,0,.5);color:#fff;font-size:20px;cursor:pointer;";
    muteBtn.onclick=()=>{ ac(); music.toggle(); }; updateMuteBtn(); document.body.appendChild(muteBtn); }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",injectMuteButton); else injectMuteButton();

  /* auto-start music on first user gesture (browsers block audio before a gesture) */
  function firstGesture(){ ac(); music.ensure(window.ARCADE_TRACK||"fun"); ["pointerdown","keydown","touchstart"].forEach(ev=>window.removeEventListener(ev,firstGesture,true)); }
  ["pointerdown","keydown","touchstart"].forEach(ev=>window.addEventListener(ev,firstGesture,true));

  return { ac, music, hype, saveScore, promptName, lastName, injectMuteButton };
})();

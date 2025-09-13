const $id = (id) => document.getElementById(id);

const startBtn = $id('startButton');
const pauseBtn = $id('pauseButton');
const resumeBtn = $id('resumeButton');
const stopBtn = $id('stopButton');
const resetBtn = $id('resetButton');
const minutesInput = $id('minutesInput');
const display = $id('display');
const progressBar = $id('progressBar');

const startPomoBtn = $id('startPomodoro');
const pausePomoBtn = $id('pausePomodoro');
const resumePomoBtn = $id('resumePomodoro');
const resetPomoBtn = $id('resetPomodoro');
const pomoDisplay = $id('pomodoroDisplay');
const workInput = $id('workInput');
const breakInput = $id('breakInput');

const addNoteBtn = $id('addNote');
const noteInput = $id('noteInput');
const notesList = $id('notesList');
const searchInput = $id('searchNote');

const pointsEl = $id('points');
const streakEl = $id('streak');
const themeButtons = document.querySelectorAll('.theme-btn');

const STORAGE = {
  points: 'focusflow_points',
  streak: 'focusflow_streak',
  notes: 'focusflow_notes',
  theme: 'focusflow_theme'
};

let points = parseInt(localStorage.getItem(STORAGE.points)) || 0;
let streak = parseInt(localStorage.getItem(STORAGE.streak)) || 0;
pointsEl.textContent = points;
streakEl.textContent = streak;

let notes = JSON.parse(localStorage.getItem(STORAGE.notes) || '[]');

let currentTheme = localStorage.getItem(STORAGE.theme) || 'light';
document.body.classList.add(currentTheme);

const beep = (freq=440,dur=150)=>{
  try{
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type='sine'; osc.frequency.value=freq;
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.00001,ctx.currentTime+dur/1000);
    setTimeout(()=>{osc.stop(); ctx.close();}, dur+50);
  }catch(e){}
};

let timer=null, timeLeft=0, totalTime=0;

const fmt = s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

const updateBar = ()=>{progressBar.style.width = totalTime ? Math.min(100, ((totalTime-timeLeft)/totalTime)*100)+'%' : '0%';};

const runTimer = ()=>{
  clearInterval(timer);
  timer=setInterval(()=>{
    display.textContent=fmt(timeLeft)+' left';
    updateBar();
    timeLeft--;
    if(timeLeft<0){clearInterval(timer); timer=null; display.textContent="⏰ Time's up!"; beep(880,200); addPoints(5);}
  },1000);
};

startBtn.addEventListener('click', ()=>{
  const m=parseInt(minutesInput.value,10);
  if(isNaN(m)||m<=0){display.textContent='Enter valid minutes'; return;}
  if(timer) clearInterval(timer);
  timeLeft=m*60; totalTime=timeLeft; runTimer();
});

pauseBtn.addEventListener('click',()=>{if(timer){clearInterval(timer);timer=null;display.textContent+=' (Paused)';}});
resumeBtn.addEventListener('click',()=>{if(!timer && timeLeft>0) runTimer();});
stopBtn.addEventListener('click',()=>{if(timer) clearInterval(timer); timer=null; display.textContent+=' (Stopped)';});
resetBtn.addEventListener('click',()=>{if(timer) clearInterval(timer); timer=null; timeLeft=0; totalTime=0; minutesInput.value=''; display.textContent='00:00'; progressBar.style.width='0%';});

let pomoTimer=null, pomoLeft=0, pomoTotal=0, isWork=true;

const runPomodoro = ()=>{
  clearInterval(pomoTimer);
  pomoTimer=setInterval(()=>{
    pomoDisplay.textContent=(isWork?'Work: ':'Break: ')+fmt(pomoLeft);
    pomoLeft--;
    if(pomoLeft<0){
      clearInterval(pomoTimer); pomoTimer=null; beep(600,250);
      if(isWork){addPoints(10); isWork=false; startPomoAuto();}
      else{isWork=true; startPomoAuto();}
    }
  },1000);
};

const startPomoAuto = ()=>{
  const w=parseInt(workInput.value,10)||25;
  const b=parseInt(breakInput.value,10)||5;
  pomoLeft=(isWork?w:b)*60; pomoTotal=pomoLeft; runPomodoro();
};

startPomoBtn.addEventListener('click',()=>{isWork=true; startPomoAuto();});
pausePomoBtn.addEventListener('click',()=>{if(pomoTimer){clearInterval(pomoTimer); pomoTimer=null; pomoDisplay.textContent+=' (Paused)';}});
resumePomoBtn.addEventListener('click',()=>{if(!pomoTimer && pomoLeft>0) runPomodoro();});
resetPomoBtn.addEventListener('click',()=>{if(pomoTimer) clearInterval(pomoTimer); pomoTimer=null; isWork=true; pomoLeft=(parseInt(workInput.value,10)||25)*60; pomoDisplay.textContent=fmt(pomoLeft)+' (Pomodoro)';});

const addPoints = n=>{
  points+=n; pointsEl.textContent=points; localStorage.setItem(STORAGE.points,points);
  streak+=1; streakEl.textContent=streak; localStorage.setItem(STORAGE.streak,streak);
};

const renderNotes = filter=>{
  notesList.innerHTML='';
  const filtered = notes.filter(n=>n.text.toLowerCase().includes((filter||'').toLowerCase()));
  filtered.forEach((note,i)=>{
    const li=document.createElement('li'); li.className='note-item';
    const txt=document.createElement('div'); txt.className='note-text'; txt.textContent=note.text;
    const act=document.createElement('div'); act.className='note-actions';
    const del=document.createElement('button'); del.textContent='✕'; del.title='Delete';
    del.onclick=()=>{notes.splice(i,1); localStorage.setItem(STORAGE.notes,JSON.stringify(notes)); renderNotes(searchInput.value);}
    act.appendChild(del); li.appendChild(txt); li.appendChild(act); notesList.appendChild(li);
  });
};

addNoteBtn.addEventListener('click',()=>{
  const val=noteInput.value.trim();
  if(!val) return;
  notes.unshift({text:val,created:Date.now()});
  localStorage.setItem(STORAGE.notes,JSON.stringify(notes));
  renderNotes();
  noteInput.value='';
});

searchInput.addEventListener('input',e=>renderNotes(e.target.value));

themeButtons.forEach(btn=>{
  btn.addEventListener('click',()=>{
    const t=btn.getAttribute('data-theme');
    document.body.classList.remove('light','focus','dark');
    document.body.classList.add(t);
    localStorage.setItem(STORAGE.theme,t);
  });
});

const init = ()=>{
  notes=JSON.parse(localStorage.getItem(STORAGE.notes)||'[]');
  renderNotes();
  pomoDisplay.textContent=fmt((parseInt(workInput.value,10)||25)*60)+' (Pomodoro)';
};
init();

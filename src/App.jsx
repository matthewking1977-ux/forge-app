import { useState, useRef, useEffect } from "react";

/* ─────────── TOKENS ─────────── */
const C = {
  bg:      "#080810",
  surface: "#0E0E18",
  card:    "#14141E",
  raised:  "#1C1C28",
  border:  "rgba(255,255,255,0.07)",
  lime:    "#CAFF00",
  blue:    "#00C8FF",
  orange:  "#FF9800",
  red:     "#FF4545",
  purple:  "#B040FF",
  muted:   "rgba(255,255,255,0.38)",
  dim:     "rgba(255,255,255,0.12)",
  subtle:  "rgba(255,255,255,0.06)",
};

const GR = {
  "Upper Push":   "135deg, #FF4545, #FF9800",
  "Lower Body":   "135deg, #FF9800, #FFD600",
  "Upper Pull":   "135deg, #0070FF, #00C8FF",
  "Full Body":    "135deg, #00C850, #CAFF00",
  "Conditioning": "135deg, #B040FF, #FF40AA",
};
const grad  = f => `linear-gradient(${GR[f] || "135deg, #1C1C28, #14141E"})`;
const fClr  = f => ({ "Upper Push":C.red,"Lower Body":C.orange,"Upper Pull":C.blue,"Full Body":C.lime,"Conditioning":C.purple })[f] || C.muted;

/* ─────────── STATIC DATA ─────────── */
const SCHEDULE = {
  0:{day:"Sun",focus:"Upper Push", muscles:"Chest · Shoulders · Triceps"},
  1:{day:"Mon",focus:"Lower Body", muscles:"Quads · Glutes · Hamstrings"},
  3:{day:"Wed",focus:"Upper Pull", muscles:"Back · Biceps · Rear Delts"},
  4:{day:"Thu",focus:"Full Body",  muscles:"Compounds · Core · Mobility"},
};
const SUPPS = [
  { period:"Morning",      time:"7–8am",         emoji:"☀️", items:[
    {name:"Vitamin D3",           dose:"5,000 IU",  why:"Bone · Immune · Hormone"},
    {name:"Omega-3 Fish Oil",     dose:"2g EPA+DHA", why:"Heart · Joints · Brain"},
    {name:"Creatine Monohydrate", dose:"5g",         why:"Strength · Muscle · Mind"},
    {name:"Collagen Peptides",    dose:"10g",        why:"Joints · Tendons · Skin"},
  ]},
  { period:"Post-Workout", time:"Within 30 min",  emoji:"💪", items:[
    {name:"Whey Protein Isolate", dose:"25–30g",     why:"Muscle protein synthesis"},
  ]},
  { period:"Evening",      time:"7–9pm",          emoji:"🌙", items:[
    {name:"Magnesium Glycinate",  dose:"400mg",      why:"Sleep · Muscle recovery"},
    {name:"Zinc Picolinate",      dose:"30mg",       why:"Testosterone · Immunity"},
    {name:"Ashwagandha KSM-66",   dose:"600mg",      why:"Cortisol · Stress · Sleep"},
  ]},
];
const WATER_GOAL = 3000;
const WATER_SCHED = [
  ["7:00am","500ml on waking"],["9:00am","250ml with supps"],
  ["12:00pm","500ml with lunch"],["3:00pm","250ml afternoon"],
  ["5:30pm","500ml pre-workout"],["7:30pm","500ml post-workout"],["9:00pm","500ml evening"],
];
const FOCUS_OPTIONS = [
  {id:"Upper Push",   sub:"Chest · Shoulders · Triceps"},
  {id:"Lower Body",   sub:"Quads · Glutes · Hamstrings"},
  {id:"Upper Pull",   sub:"Back · Biceps · Rear Delts"},
  {id:"Full Body",    sub:"Compounds · Core"},
  {id:"Conditioning", sub:"Cardio · HIIT · Circuits"},
];

/* ─────────── SVG NAV ICONS ─────────── */
const Ico = {
  home:(
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>),
  train:(
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>),
  progress:(
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
    </svg>),
  supps:(
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>),
  recovery:(
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>),
};

/* ─────────── SHARED COMPONENTS ─────────── */
function Ring({ val, max, size=90, sw=7, color, bg, children }) {
  const r=(size-sw)/2, circ=2*Math.PI*r, pct=Math.min(Math.max(val/max,0),1);
  return (
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{display:"block",transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={bg||C.subtle} strokeWidth={sw}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={circ*(1-pct)} strokeLinecap="round"
          style={{transition:"stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
        {children}
      </div>
    </div>
  );
}

function Card({ children, style:s, glow }) {
  return (
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:18,
      boxShadow:glow?`0 4px 28px ${glow}20`:"0 2px 16px rgba(0,0,0,0.35)",...s}}>
      {children}
    </div>
  );
}

function HeroCard({ focus, isRest, children }) {
  return (
    <div style={{
      borderRadius:24, overflow:"hidden", position:"relative",
      minHeight:164, padding:"22px 24px",
      background: isRest
        ? "linear-gradient(145deg, #1E1E32 0%, #14141E 100%)"
        : grad(focus),
      boxShadow: isRest
        ? "0 4px 20px rgba(0,0,0,0.5)"
        : `0 8px 32px ${fClr(focus)}30`,
      border: isRest ? `1px solid rgba(255,255,255,0.1)` : "none",
    }}>
      {!isRest && <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.28)"}}/>}
      <div style={{position:"relative",zIndex:1}}>{children}</div>
    </div>
  );
}

function Badge({ children, color=C.lime }) {
  return <span style={{fontSize:11,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",
    background:`${color}18`,color,border:`1px solid ${color}30`,padding:"4px 12px",borderRadius:20}}>{children}</span>;
}

function PrimaryBtn({ children, onClick, color=C.lime, disabled, full, style:s }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:full?"100%":"auto",padding:"15px 24px",borderRadius:14,border:"none",
      background:disabled?C.raised:`linear-gradient(135deg,${color}EE,${color}BB)`,
      color:disabled?"rgba(255,255,255,0.2)":"#000",
      fontSize:14,fontWeight:800,letterSpacing:"0.02em",
      cursor:disabled?"not-allowed":"pointer",fontFamily:"inherit",
      display:"flex",alignItems:"center",justifyContent:"center",gap:8,
      boxShadow:disabled?"none":`0 4px 20px ${color}30`,transition:"all 0.15s",...s
    }}>{children}</button>
  );
}

function GhostBtn({ children, onClick, disabled, full, style:s }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:full?"100%":"auto",padding:"13px 20px",borderRadius:14,
      background:"transparent",border:`1px solid ${disabled?C.border:C.border}`,
      color:disabled?"rgba(255,255,255,0.2)":C.muted,
      fontSize:13,fontWeight:600,cursor:disabled?"not-allowed":"pointer",fontFamily:"inherit",
      display:"flex",alignItems:"center",justifyContent:"center",gap:8,...s
    }}>{children}</button>
  );
}

function SL({ children }) {
  return <p style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:700,marginBottom:14}}>{children}</p>;
}

function Num({ children, color, size=28 }) {
  return <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:size,fontWeight:400,letterSpacing:"0.05em",color:color||"white",lineHeight:1}}>{children}</span>;
}

/* ═══════════════════════════════════════
   HOME
═══════════════════════════════════════ */
function Home({ water, addWater, whoop }) {
  const now=new Date(), dow=now.getDay(), today=SCHEDULE[dow];
  const hr=now.getHours();
  const greeting=hr<12?"Morning":hr<17?"Afternoon":"Evening";
  const rCol=whoop.recovery>=67?C.lime:whoop.recovery>=34?C.orange:C.red;
  const wPct=Math.round(water/WATER_GOAL*100);

  return (
    <div style={{padding:"0 20px 100px"}}>

      {/* Greeting */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
        <div>
          <p style={{fontSize:14,color:C.muted,marginBottom:5}}>
            {now.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})}
          </p>
          <h1 style={{fontSize:28,fontWeight:800,letterSpacing:"-0.4px",lineHeight:1.2}}>
            Good {greeting} 👋<br/><span style={{color:C.lime}}>Matt</span>
          </h1>
        </div>
        <div style={{width:48,height:48,borderRadius:"50%",flexShrink:0,
          background:`linear-gradient(135deg,${C.lime},#00D870)`,
          display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:`0 4px 18px ${C.lime}35`}}>
          <Num size={22} color="#000">M</Num>
        </div>
      </div>

      {/* Today hero */}
      <div style={{marginBottom:16}}>
        <HeroCard focus={today?.focus} isRest={!today}>
          <Badge color={today ? fClr(today.focus) : "rgba(255,255,255,0.6)"}>
            {today ? "Training Day" : "Rest Day"}
          </Badge>
          <p style={{
            fontFamily:"'Bebas Neue',sans-serif",
            fontSize:42, letterSpacing:"0.05em",
            marginTop:10, marginBottom:6, lineHeight:1,
            color:"white",
            textShadow: today ? "0 2px 12px rgba(0,0,0,0.4)" : "none"
          }}>
            {today ? today.focus.toUpperCase() : "REST & RECOVER"}
          </p>
          <p style={{fontSize:15,color:"rgba(255,255,255,0.8)",lineHeight:1.4}}>
            {today ? today.muscles : "Active recovery · Mobility · Light walk"}
          </p>
        </HeroCard>
      </div>

      {/* Recovery + Water — vertical layout for legibility */}
      <div style={{display:"flex",gap:12,marginBottom:16}}>

        {/* Recovery */}
        <Card style={{flex:1,padding:"18px 16px",textAlign:"center"}} glow={whoop.recovery?rCol:undefined}>
          <p style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:700,marginBottom:14}}>Recovery</p>
          <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
            <Ring val={whoop.recovery} max={100} size={72} sw={6} color={whoop.recovery?rCol:C.subtle}>
              <span style={{fontSize:17,fontWeight:900,color:whoop.recovery?"white":C.muted}}>{whoop.recovery||"–"}</span>
            </Ring>
          </div>
          <p style={{fontWeight:800,fontSize:16,color:whoop.recovery?rCol:"rgba(255,255,255,0.4)",lineHeight:1.2}}>
            {!whoop.recovery?"No data":whoop.recovery>=67?"Green 🟢":whoop.recovery>=34?"Yellow 🟡":"Red 🔴"}
          </p>
          {whoop.hrv>0 && <p style={{fontSize:13,color:C.muted,marginTop:5}}>HRV {whoop.hrv}ms</p>}
        </Card>

        {/* Water */}
        <Card style={{flex:1,padding:"18px 16px",textAlign:"center"}} glow={wPct>=100?C.lime:C.blue}>
          <p style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:700,marginBottom:14}}>Hydration</p>
          <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
            <Ring val={water} max={WATER_GOAL} size={72} sw={6} color={wPct>=100?C.lime:C.blue}>
              <span style={{fontSize:15,fontWeight:900}}>{(water/1000).toFixed(1)}L</span>
            </Ring>
          </div>
          <p style={{fontWeight:800,fontSize:15,color:wPct>=100?C.lime:C.blue,lineHeight:1.2,marginBottom:8}}>
            {wPct>=100?"Goal hit! 🎯":`${WATER_GOAL-water}ml left`}
          </p>
          <button onClick={()=>addWater(250)} style={{
            background:`${C.blue}18`,border:`1px solid ${C.blue}35`,color:C.blue,
            fontSize:12,padding:"5px 14px",borderRadius:20,cursor:"pointer",fontWeight:700,fontFamily:"inherit"
          }}>+ 250ml</button>
        </Card>
      </div>

      {/* Weekly grid */}
      <Card style={{marginBottom:16}}>
        <SL>This Week</SL>
        <div style={{display:"flex",gap:6}}>
          {[0,1,2,3,4,5,6].map(d=>{
            const s=SCHEDULE[d], isT=d===dow;
            const dayLabel=["SUN","MON","TUE","WED","THU","FRI","SAT"][d];
            return (
              <div key={d} style={{flex:1,textAlign:"center"}}>
                <p style={{
                  fontSize:10, letterSpacing:"0.04em",
                  color: isT ? "white" : C.muted,
                  fontWeight: isT ? 800 : 500,
                  marginBottom:8
                }}>{dayLabel[0]}</p>
                <div style={{
                  aspectRatio:"1", borderRadius:12,
                  background: s
                    ? (isT ? grad(s.focus) : C.raised)
                    : "rgba(255,255,255,0.04)",
                  border: `2px solid ${
                    isT
                      ? (s ? fClr(s.focus) : "rgba(255,255,255,0.4)")
                      : s ? `${fClr(s.focus)}45` : "transparent"
                  }`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  boxShadow: isT && s ? `0 3px 12px ${fClr(s.focus)}40` : "none",
                }}>
                  {s && (
                    <div style={{
                      width:8,height:8,borderRadius:"50%",
                      background: isT ? "white" : fClr(s.focus),
                      opacity: isT ? 1 : 0.7
                    }}/>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Profile stats */}
      <Card>
        <SL>Profile</SL>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
          {[["Age","49 yrs"],["Weight","82 kg"],["Level","Mid"],["Days","4/wk"],["Status","Returning"],["Goal","Strength"]].map(([k,v])=>(
            <div key={k} style={{background:C.raised,borderRadius:12,padding:"12px 10px",textAlign:"center",border:`1px solid ${C.border}`}}>
              <p style={{fontSize:10,color:C.muted,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:5,fontWeight:600}}>{k}</p>
              <p style={{fontSize:13,fontWeight:800,color:"white"}}>{v}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════
   TRAIN
═══════════════════════════════════════ */
function Train({ whoop }) {
  const [workout,setWorkout]=useState(null);
  const [loading,setLoading]=useState(false);
  const [setsDone,setSetsDone]=useState({});      // {exIdx: numSetsCompleted}
  const [restTimer,setRestTimer]=useState(null);  // {secondsLeft, totalSeconds, exerciseName, setNum, totalSets, nextUp}
  const [overrideFocus,setOverrideFocus]=useState(null);
  const [showPicker,setShowPicker]=useState(false);
  const dow=new Date().getDay();
  const scheduled=SCHEDULE[dow];
  const isRest=!scheduled;
  const active=overrideFocus||(scheduled?{id:scheduled.focus,sub:scheduled.muscles}:null);

  // Rest countdown
  useEffect(()=>{
    if(!restTimer||restTimer.secondsLeft<=0){
      if(restTimer?.secondsLeft===0) setRestTimer(null);
      return;
    }
    const t=setTimeout(()=>setRestTimer(r=>r?{...r,secondsLeft:r.secondsLeft-1}:null),1000);
    return()=>clearTimeout(t);
  },[restTimer]);

  const parseRest=rest=>{
    if(!rest)return 60;
    const m=rest.match(/(\d+)\s*min/);if(m)return parseInt(m[1])*60;
    const s=rest.match(/(\d+)/);return s?parseInt(s[1]):60;
  };

  const tapSet=(exIdx,exercise,exercises)=>{
    const done=setsDone[exIdx]||0;
    if(done>=exercise.sets)return;
    const newDone=done+1;
    setSetsDone(s=>({...s,[exIdx]:newDone}));
    const isLastSet=newDone>=exercise.sets;
    const isLastExercise=exIdx>=exercises.length-1;
    if(!isLastSet||!isLastExercise){
      const secs=parseRest(exercise.rest);
      const nextUp=!isLastSet
        ?`Set ${newDone+1} of ${exercise.sets} — ${exercise.name}`
        :exercises[exIdx+1]?.name||'Cool-down';
      setRestTimer({secondsLeft:secs,totalSeconds:secs,exerciseName:exercise.name,setNum:newDone,totalSets:exercise.sets,nextUp});
    }
  };

  // ── Hardcoded fallback workouts (used when API fails) ──────────────────
  const FALLBACKS = {
    "Upper Push": {
      focus:"Upper Push", duration:"50 min", intensity:"Moderate", recoveryNote:"", isBonus:false,
      warmup:["5 min light cardio","Band pull-aparts x15","Arm circles x10 each direction"],
      exercises:[
        {name:"Barbell Bench Press",    sets:3,reps:"10-12",rest:"90s",tip:"3-sec descent, full control"},
        {name:"Dumbbell Shoulder Press",sets:3,reps:"10-12",rest:"75s",tip:"Don't lock out at the top"},
        {name:"Incline Dumbbell Press", sets:3,reps:"10-12",rest:"75s",tip:"Slight incline, squeeze at top"},
        {name:"Lateral Raises",         sets:3,reps:"12-15",rest:"60s",tip:"Lead with elbows, slight lean"},
        {name:"Cable Tricep Pushdown",  sets:3,reps:"12-15",rest:"60s",tip:"Elbows pinned, full extension"},
        {name:"Overhead Tricep Ext.",   sets:2,reps:"12-15",rest:"60s",tip:"Full stretch at the bottom"},
      ],
      cooldown:["Chest doorway stretch 30s","Cross-body shoulder stretch 30s","Tricep overhead stretch 30s"],
      ageNote:"Prioritise joint warm-up. Use lighter loads on first sets and build up."
    },
    "Lower Body": {
      focus:"Lower Body", duration:"55 min", intensity:"Moderate", recoveryNote:"", isBonus:false,
      warmup:["5 min bike","Leg swings front-to-back x10 each","Bodyweight squats x15 slow"],
      exercises:[
        {name:"Barbell Back Squat",     sets:3,reps:"10-12",rest:"120s",tip:"Sit back, chest up, knees track toes"},
        {name:"Romanian Deadlift",      sets:3,reps:"10-12",rest:"90s", tip:"Hinge at hips, feel hamstring stretch"},
        {name:"Leg Press",              sets:3,reps:"12-15",rest:"75s", tip:"Feet shoulder-width, full range"},
        {name:"Walking Lunges",         sets:3,reps:"10 each",rest:"75s",tip:"Upright torso, controlled step"},
        {name:"Leg Curl Machine",       sets:3,reps:"12-15",rest:"60s", tip:"Slow on the way down"},
        {name:"Calf Raises",            sets:3,reps:"15-20",rest:"45s", tip:"Full stretch at bottom of each rep"},
      ],
      cooldown:["Standing quad stretch 30s each","Hamstring stretch lying down 30s","Hip flexor lunge stretch 30s"],
      ageNote:"Knees are the priority at 49. Never let them collapse inward and avoid deep knee flexion if tender."
    },
    "Upper Pull": {
      focus:"Upper Pull", duration:"50 min", intensity:"Moderate", recoveryNote:"", isBonus:false,
      warmup:["5 min rowing machine","Band face pulls x15","Scapular retractions x10"],
      exercises:[
        {name:"Barbell Bent-Over Row",  sets:3,reps:"10-12",rest:"90s", tip:"Hinge to 45°, pull to lower chest"},
        {name:"Lat Pulldown",           sets:3,reps:"10-12",rest:"75s", tip:"Lean back slightly, pull to chin"},
        {name:"Seated Cable Row",       sets:3,reps:"10-12",rest:"75s", tip:"Squeeze shoulder blades together"},
        {name:"Dumbbell Bicep Curl",    sets:3,reps:"10-12",rest:"60s", tip:"Full range, no swinging"},
        {name:"Face Pulls",             sets:3,reps:"15",   rest:"60s", tip:"Elbows high, rotate externally"},
        {name:"Hammer Curls",           sets:2,reps:"12",   rest:"60s", tip:"Neutral grip, controlled tempo"},
      ],
      cooldown:["Lat stretch overhead 30s each","Bicep wall stretch 30s","Child's pose 45s"],
      ageNote:"Rear delt and rotator cuff health is vital at 49. Face pulls are non-negotiable — don't skip them."
    },
    "Full Body": {
      focus:"Full Body", duration:"55 min", intensity:"Moderate", recoveryNote:"", isBonus:false,
      warmup:["5 min treadmill walk","Hip circles x10 each","Thoracic spine rotations x10 each"],
      exercises:[
        {name:"Barbell Deadlift",       sets:3,reps:"6-8",  rest:"120s",tip:"Brace core, push floor away"},
        {name:"Dumbbell Bench Press",   sets:3,reps:"10-12",rest:"90s", tip:"Controlled descent, slight arch"},
        {name:"Goblet Squat",           sets:3,reps:"12",   rest:"75s", tip:"Heels down, elbows inside knees"},
        {name:"Dumbbell Row",           sets:3,reps:"10-12",rest:"75s", tip:"Brace on bench, row to hip"},
        {name:"Overhead Press (DB)",    sets:3,reps:"10-12",rest:"75s", tip:"Brace core, press in straight line"},
        {name:"Plank",                  sets:3,reps:"30-45s",rest:"45s",tip:"Squeeze glutes and core throughout"},
      ],
      cooldown:["Full spine child's pose 45s","Hip flexor stretch 30s each","Doorway chest stretch 30s"],
      ageNote:"Compound movements give the best return at your age. Focus on the movement pattern, not the weight."
    },
    "Conditioning": {
      focus:"Conditioning", duration:"40 min", intensity:"Moderate", recoveryNote:"", isBonus:false,
      warmup:["3 min easy bike","Jumping jacks x20","High knees 30s"],
      exercises:[
        {name:"Rowing Machine",         sets:4,reps:"3 min",rest:"90s", tip:"Drive with legs first, then pull arms"},
        {name:"Kettlebell Swing",        sets:4,reps:"15",   rest:"60s", tip:"Hip hinge, not squat — power from glutes"},
        {name:"Box Step-Ups",           sets:3,reps:"10 each",rest:"60s",tip:"Drive through heel, upright torso"},
        {name:"Battle Ropes",           sets:4,reps:"30s",  rest:"60s", tip:"Slight squat stance, alternate arms"},
        {name:"Farmer's Carry",         sets:3,reps:"30m",  rest:"60s", tip:"Tall posture, shoulders packed down"},
      ],
      cooldown:["Full body stretch sequence 5 min","Deep breathing 1 min","Foam roll quads and back"],
      ageNote:"At 49, conditioning means sustainable effort — keep intensity at 7/10, not 10/10."
    },
  };

  // ── Adjust fallback volume for recovery ────────────────────────────────
  const applyRecovery = (workout, recovery, bonus) => {
    if(recovery===0 && !bonus) return workout;
    const exercises = workout.exercises.map(ex => ({
      ...ex,
      sets: recovery>0&&recovery<34 ? Math.max(2, ex.sets-1) : bonus ? Math.max(2, ex.sets-1) : ex.sets
    }));
    const note = recovery>0
      ? recovery>=67 ? "Green recovery — full volume today."
      : recovery>=34 ? "Yellow recovery — standard volume, controlled effort."
      : "Red recovery — reduced volume. Listen to your body."
      : "";
    return { ...workout, exercises, recoveryNote:note, isBonus:bonus, intensity:
      recovery>0&&recovery<34?"Light":recovery>=67&&!bonus?"Challenging":"Moderate"
    };
  };

  const generate=async(fo)=>{
    const f=fo||active; if(!f)return;
    setLoading(true);setWorkout(null);setSetsDone({});setRestTimer(null);setShowPicker(false);
    const bonus=!scheduled||(overrideFocus&&overrideFocus.id!==scheduled?.focus);
    const recovery=whoop.recovery;

    const recLine = recovery===0 ? ""
      : recovery>=67 ? `His Whoop recovery is ${recovery}% (Green) — full volume is fine today.`
      : recovery>=34 ? `His Whoop recovery is ${recovery}% (Yellow) — standard volume, moderate effort.`
      : `His Whoop recovery is ${recovery}% (Red) — reduce each exercise by 1 set and keep weight light.`;

    // Try API up to 2 times, then fall back to hardcoded
    let lastError = "";
    for(let attempt=0; attempt<2; attempt++){
      try{
        const res=await fetch("/api/claude",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({
            model:"claude-sonnet-4-20250514",
            max_tokens:1200,
            system:[
              "You are a gym trainer AI. Your ONLY output must be a valid JSON object.",
              "Do NOT include any text before or after the JSON.",
              "Do NOT use markdown code blocks.",
              "The JSON must have exactly these keys:",
              "focus (string), duration (string), intensity (string), recoveryNote (string),",
              "isBonus (boolean), warmup (array of 3 strings), exercises (array of 5-6 objects",
              "each with: name, sets (number), reps (string), rest (string), tip (string)),",
              "cooldown (array of 3 strings), ageNote (string)."
            ].join(" "),
            messages:[{
              role:"user",
              content:[
                `Design a ${f.id} workout session for Matt.`,
                `Matt is 49 years old, weighs 82kg, has intermediate gym experience, and is returning after several weeks off.`,
                `His goals are longevity, strength, and muscle definition.`,
                `Use only traditional proven exercises such as bench press, squat, deadlift, rows, shoulder press, and pull-ups.`,
                `Prioritise joint safety and controlled tempo throughout.`,
                recLine,
                bonus?"This is an unscheduled bonus session — keep total volume slightly lower than normal.":"",
                recovery>0?`Additional Whoop data: HRV ${whoop.hrv}ms, Resting HR ${whoop.rhr}bpm, Sleep ${whoop.sleep}%.`:"",
                `Include one specific tip for training safely at age 49 in the ageNote field.`,
              ].filter(Boolean).join(" ")
            }]
          })
        });
        const data=await res.json();
        if(data.type==="error"||!data.content?.[0]?.text) throw new Error("API error: "+(data.error?.message||"no content"));
        const raw=data.content[0].text;
        const s=raw.indexOf("{"), e=raw.lastIndexOf("}");
        if(s===-1||e===-1||e<=s) throw new Error("No JSON in response");
        const parsed=JSON.parse(raw.slice(s,e+1));
        if(!parsed.exercises?.length) throw new Error("Missing exercises array");
        setWorkout(parsed);
        setLoading(false);
        return;
      } catch(err){
        lastError=err.message;
        console.warn(`Attempt ${attempt+1} failed:`,err.message);
        if(attempt===0) await new Promise(r=>setTimeout(r,800)); // brief pause before retry
      }
    }

    // Both attempts failed — use hardcoded fallback
    console.warn("Using fallback workout. Last error:",lastError);
    const base=FALLBACKS[f.id]||FALLBACKS["Full Body"];
    setWorkout(applyRecovery({...base,focus:f.id},recovery,bonus));
    setLoading(false);
  };

  const totalSets=workout?.exercises?.reduce((a,ex)=>a+ex.sets,0)||0;
  const doneSets=workout?.exercises?.reduce((a,ex,i)=>a+Math.min(setsDone[i]||0,ex.sets),0)||0;
  const allDone=totalSets>0&&doneSets===totalSets;
  const acColor=active?fClr(active.id):C.muted;

  return (
    <div style={{padding:"0 20px 100px"}}>

      {/* ── Full-screen rest timer overlay ── */}
      {restTimer&&(
        <div style={{
          position:"fixed",inset:0,zIndex:200,background:C.bg,
          display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
          padding:"60px 32px 48px",fontFamily:"'DM Sans',sans-serif"
        }}>
          {/* What just finished */}
          <p style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.16em",marginBottom:8}}>Rest</p>
          <p style={{fontSize:20,fontWeight:800,marginBottom:4,textAlign:"center"}}>{restTimer.exerciseName}</p>
          <p style={{fontSize:14,color:C.muted,marginBottom:48}}>Set {restTimer.setNum} of {restTimer.totalSets} complete ✓</p>

          {/* Countdown ring */}
          <Ring val={restTimer.secondsLeft} max={restTimer.totalSeconds} size={220} sw={10} color={C.lime} bg={`${C.lime}15`}>
            <Num size={80} color={restTimer.secondsLeft<=10?C.orange:C.lime}>{restTimer.secondsLeft}</Num>
            <span style={{fontSize:13,color:C.muted,marginTop:2}}>seconds</span>
          </Ring>

          {/* Next up */}
          <div style={{marginTop:48,textAlign:"center",padding:"18px 24px",
            background:C.card,border:`1px solid ${C.border}`,borderRadius:16,width:"100%"}}>
            <p style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:6}}>Up Next</p>
            <p style={{fontSize:18,fontWeight:700,color:"white"}}>{restTimer.nextUp}</p>
          </div>

          {/* Skip */}
          <button onClick={()=>setRestTimer(null)} style={{
            marginTop:28,background:"transparent",border:`1px solid ${C.border}`,
            color:C.muted,fontSize:15,fontWeight:600,padding:"14px 48px",
            borderRadius:14,cursor:"pointer",fontFamily:"inherit"
          }}>Skip Rest →</button>
        </div>
      )}
      <div style={{marginBottom:20}}>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
          {active?<Badge color={acColor}>{active.id}</Badge>:<Badge color="rgba(255,255,255,0.4)">Rest Day</Badge>}
          {isRest&&<Badge color={C.orange}>Unscheduled</Badge>}
          {overrideFocus&&scheduled&&overrideFocus.id!==scheduled.focus&&<Badge color={C.orange}>Changed</Badge>}
        </div>
        <h2 style={{fontSize:30,fontWeight:900,letterSpacing:"-0.5px",marginBottom:6}}>Train</h2>
        <p style={{color:C.muted,fontSize:15}}>{active?.sub||"Pick a focus to get started"}</p>
      </div>

      {/* Rest day notice */}
      {isRest&&!workout&&!loading&&(
        <div style={{background:`${C.orange}10`,border:`1px solid ${C.orange}25`,borderRadius:16,padding:"16px 18px",marginBottom:16}}>
          <p style={{fontSize:15,fontWeight:700,color:C.orange,marginBottom:6}}>📅 Scheduled rest day</p>
          <p style={{fontSize:14,color:"rgba(255,255,255,0.65)",lineHeight:1.6}}>
            {whoop.recovery>0&&whoop.recovery<50
              ?`Your recovery is at ${whoop.recovery}% — rest is the smart call. But you can still train below.`
              :"Rest days let your muscles adapt and grow. That said, it's your choice."}
          </p>
        </div>
      )}

      {!workout&&!loading&&(
        <>
          {active&&!showPicker&&(
            <PrimaryBtn onClick={()=>generate()} color={acColor} full style={{marginBottom:10}}>
              ⚡  Generate {active.id}
            </PrimaryBtn>
          )}
          {!showPicker&&(
            <GhostBtn onClick={()=>setShowPicker(true)} full style={{marginBottom:16,fontSize:15}}>
              🔄  {active?"Change workout focus":"Choose what to train"}
            </GhostBtn>
          )}

          {showPicker&&(
            <div style={{marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <p style={{fontWeight:800,fontSize:18}}>Choose Focus</p>
                <button onClick={()=>setShowPicker(false)} style={{background:"none",border:"none",color:C.muted,fontSize:26,cursor:"pointer",lineHeight:1}}>×</button>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {FOCUS_OPTIONS.map(opt=>(
                  <div key={opt.id} onClick={()=>{setOverrideFocus(opt);generate(opt);}}
                    style={{borderRadius:18,overflow:"hidden",cursor:"pointer",position:"relative",
                      minHeight:84,display:"flex",alignItems:"center",
                      background:grad(opt.id),boxShadow:`0 4px 18px ${fClr(opt.id)}22`}}>
                    <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.28)"}}/>
                    <div style={{position:"relative",zIndex:1,padding:"18px 20px",flex:1}}>
                      <p style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,letterSpacing:"0.06em",lineHeight:1,marginBottom:5}}>{opt.id.toUpperCase()}</p>
                      <p style={{fontSize:14,color:"rgba(255,255,255,0.8)"}}>{opt.sub}</p>
                    </div>
                    <span style={{position:"relative",zIndex:1,paddingRight:20,fontSize:24,opacity:0.8}}>→</span>
                    {scheduled?.focus===opt.id&&(
                      <div style={{position:"absolute",top:10,right:10}}><Badge color="white">Scheduled</Badge></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {loading&&(
        <Card style={{textAlign:"center",padding:"48px 24px"}}>
          <div style={{fontSize:44,marginBottom:16}}>⚡</div>
          <p style={{fontWeight:800,fontSize:18,marginBottom:6}}>Building your session...</p>
          <p style={{color:C.muted,fontSize:14}}>
            {whoop.recovery>0?`Adjusting for ${whoop.recovery}% recovery`:"Generating your plan"}
          </p>
        </Card>
      )}

      {workout?.error&&(
        <Card style={{textAlign:"center",padding:"32px 24px"}}>
          <div style={{fontSize:36,marginBottom:12}}>⚠️</div>
          <p style={{fontWeight:800,fontSize:17,marginBottom:6}}>Generation failed</p>
          <p style={{color:C.muted,fontSize:14,marginBottom:20,lineHeight:1.6}}>
            {workout.message?.includes("API")
              ? "API connection issue — check your network and try again."
              : "Couldn't parse the workout. Tap retry — it usually works second time."}
          </p>
          <PrimaryBtn onClick={()=>generate()}>↺  Retry</PrimaryBtn>
        </Card>
      )}

      {workout&&!workout.error&&(
        <>
          {workout.isBonus&&(
            <div style={{background:`${C.orange}0E`,border:`1px solid ${C.orange}20`,borderRadius:14,padding:"11px 16px",marginBottom:12}}>
              <p style={{fontSize:12,color:C.orange}}>⚡ <strong>Bonus session</strong> — volume is slightly conservative. Listen to your body.</p>
            </div>
          )}

          {/* Session hero */}
          <div style={{marginBottom:14}}>
            <HeroCard focus={workout.focus}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <p style={{fontSize:11,color:"rgba(255,255,255,0.65)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>{workout.duration} · {workout.intensity}</p>
                  <p style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,letterSpacing:"0.06em",lineHeight:1}}>{workout.focus.toUpperCase()}</p>
                </div>
                <div style={{textAlign:"right"}}>
                  <Num size={42} color={allDone?C.lime:"white"}>{doneSets}/{totalSets}</Num>
                  <p style={{fontSize:10,color:"rgba(255,255,255,0.55)",textTransform:"uppercase",letterSpacing:"0.08em"}}>Sets</p>
                </div>
              </div>
              {workout.recoveryNote&&(
                <div style={{marginTop:12,background:"rgba(0,0,0,0.28)",borderRadius:10,padding:"8px 12px"}}>
                  <p style={{fontSize:12,color:"rgba(255,255,255,0.82)"}}>💓 {workout.recoveryNote}</p>
                </div>
              )}
              {allDone&&(
                <div style={{marginTop:10,background:"rgba(255,255,255,0.15)",borderRadius:10,padding:"9px 12px",textAlign:"center",backdropFilter:"blur(4px)"}}>
                  <p style={{fontSize:13,fontWeight:800}}>🎯 Session Complete! Excellent work.</p>
                </div>
              )}
            </HeroCard>
          </div>

          {/* Warm-up */}
          {workout.warmup?.length>0&&(
            <Card style={{marginBottom:12}}>
              <SL>Warm-Up</SL>
              {workout.warmup.map((w,i)=>(
                <p key={i} style={{fontSize:13,padding:"5px 0",color:C.muted,
                  borderBottom:i<workout.warmup.length-1?`1px solid ${C.border}`:"none"}}>{i+1}. {w}</p>
              ))}
            </Card>
          )}

          <SL>Main Session</SL>
          {workout.exercises?.map((ex,i)=>{
            const done=setsDone[i]||0;
            const isFullyDone=done>=ex.sets;
            return (
              <div key={i} style={{
                background:isFullyDone?`${fClr(workout.focus)}0D`:C.card,
                border:`1px solid ${isFullyDone?`${fClr(workout.focus)}35`:C.border}`,
                borderRadius:16,padding:"16px",marginBottom:10,
                boxShadow:"0 2px 12px rgba(0,0,0,0.25)"
              }}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                  <div style={{flex:1,paddingRight:12}}>
                    <p style={{fontWeight:700,fontSize:16,color:isFullyDone?fClr(workout.focus):"white",marginBottom:3}}>{ex.name}</p>
                    <p style={{fontSize:13,color:C.muted}}>{ex.reps} reps · {ex.rest} rest</p>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <Num size={22} color={isFullyDone?fClr(workout.focus):C.muted}>{done}/{ex.sets}</Num>
                    <p style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:"0.08em"}}>sets</p>
                  </div>
                </div>
                <div style={{display:"flex",gap:6,marginBottom:ex.tip?12:0}}>
                  {Array.from({length:ex.sets}).map((_,si)=>{
                    const isDone=si<done;
                    const isNext=si===done;
                    return (
                      <button key={si} onClick={()=>isNext?tapSet(i,ex,workout.exercises):undefined}
                        style={{
                          flex:1,height:46,borderRadius:10,fontFamily:"inherit",
                          background:isDone?fClr(workout.focus):isNext?`${fClr(workout.focus)}15`:C.raised,
                          border:`2px solid ${isDone?fClr(workout.focus):isNext?`${fClr(workout.focus)}55`:C.border}`,
                          color:isDone?"#000":isNext?fClr(workout.focus):C.muted,
                          fontSize:isDone?16:13,fontWeight:700,
                          cursor:isNext?"pointer":"default",
                          boxShadow:isNext?`0 2px 14px ${fClr(workout.focus)}25`:"none",
                          transition:"all 0.2s"
                        }}>
                        {isDone?"✓":`Set ${si+1}`}
                      </button>
                    );
                  })}
                </div>
                {ex.tip&&(
                  <p style={{fontSize:13,color:C.muted,paddingTop:12,borderTop:`1px solid ${C.border}`}}>
                    💡 {ex.tip}
                  </p>
                )}
              </div>
            );
          })}

          {workout.ageNote&&(
            <div style={{background:`${C.blue}0E`,border:`1px solid ${C.blue}22`,borderRadius:14,padding:"12px 16px",marginBottom:12}}>
              <p style={{fontSize:13,color:C.blue}}>🎯 <strong>Age 49 tip:</strong> {workout.ageNote}</p>
            </div>
          )}

          {workout.cooldown?.length>0&&(
            <Card style={{marginBottom:14}}>
              <SL>Cool-Down & Stretch</SL>
              {workout.cooldown.map((w,i)=>(
                <p key={i} style={{fontSize:13,padding:"5px 0",color:C.muted,
                  borderBottom:i<workout.cooldown.length-1?`1px solid ${C.border}`:"none"}}>🧘 {w}</p>
              ))}
            </Card>
          )}

          <div style={{display:"flex",gap:8}}>
            <GhostBtn onClick={()=>generate()} style={{flex:1}}>↺  Redo</GhostBtn>
            <GhostBtn onClick={()=>{setWorkout(null);setShowPicker(true);}} style={{flex:1}}>🔄  Change</GhostBtn>
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   PROGRESS
═══════════════════════════════════════ */
function Progress() {
  const [photos,setPhotos]=useState({start:null,current:null});
  const [analysis,setAnalysis]=useState("");
  const [loading,setLoading]=useState(false);
  const refs={start:useRef(),current:useRef()};

  const toB64=f=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(f);});
  const handleFile=t=>async e=>{
    const f=e.target.files?.[0]; if(!f)return;
    setPhotos(p=>({...p,[t]:{b64:null,url:null,mime:f.type}}));
    const b64=await toB64(f);
    setPhotos(p=>({...p,[t]:{b64,url:URL.createObjectURL(f),mime:f.type}}));
  };

  const analyse=async()=>{
    setLoading(true);setAnalysis("");
    try{
      const res=await fetch("/api/claude",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",max_tokens:1000,
          system:"Fitness progress coach. Analyse body composition changes honestly and encouragingly. Matt is 49yo male, 82kg, goals: longevity, strength, definition. Be specific about muscle groups. 4-5 paragraphs. End with 3 numbered next steps.",
          messages:[{role:"user",content:[
            {type:"image",source:{type:"base64",media_type:photos.start.mime,data:photos.start.b64}},
            {type:"image",source:{type:"base64",media_type:photos.current.mime,data:photos.current.b64}},
            {type:"text",text:"Image 1 = starting photo, Image 2 = current. Analyse visible changes in muscle definition, body composition, and posture by muscle group. End with 3 specific next steps toward longevity, strength, and definition."}
          ]}]
        })
      });
      const d=await res.json();
      if(d.type==="error"||!d.content?.[0]?.text) throw new Error("API error");
      setAnalysis(d.content[0].text);
    }catch(e){setAnalysis("Failed. Check connection and try again.");}
    setLoading(false);
  };

  return (
    <div style={{padding:"0 20px 100px"}}>
      <div style={{marginBottom:22}}>
        <h2 style={{fontSize:28,fontWeight:900,letterSpacing:"-0.5px"}}>Progress</h2>
        <p style={{color:C.muted,fontSize:13,marginTop:4}}>AI-powered body composition analysis</p>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        {[{t:"start",label:"Start",color:C.red},{t:"current",label:"Current",color:C.lime}].map(({t,label,color})=>(
          <div key={t} onClick={()=>refs[t].current.click()} style={{
            aspectRatio:"3/4",borderRadius:20,
            border:`2px dashed ${photos[t]?`${color}45`:C.border}`,
            background:C.card,overflow:"hidden",cursor:"pointer",position:"relative",
            display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
            boxShadow:"0 4px 20px rgba(0,0,0,0.35)"
          }}>
            {photos[t]?.url
              ?<img src={photos[t].url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={label}/>
              :<>
                <div style={{width:52,height:52,borderRadius:16,background:C.raised,
                  display:"flex",alignItems:"center",justifyContent:"center",marginBottom:10,border:`1px solid ${C.border}`}}>
                  <span style={{fontSize:24}}>📸</span>
                </div>
                <p style={{fontSize:13,fontWeight:700}}>{label} Photo</p>
                <p style={{fontSize:11,color:C.muted,marginTop:3}}>Tap to upload</p>
              </>
            }
            {photos[t]?.url&&(
              <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"12px 14px",
                background:"linear-gradient(to top,rgba(0,0,0,0.85),transparent)"}}>
                <p style={{fontSize:12,color,fontWeight:700}}>{label}</p>
              </div>
            )}
            <input ref={refs[t]} type="file" accept="image/*" onChange={handleFile(t)} style={{display:"none"}}/>
          </div>
        ))}
      </div>

      <PrimaryBtn onClick={analyse} disabled={!photos.start?.b64||!photos.current?.b64||loading} full style={{marginBottom:16}}>
        🔍  {loading?"Analysing...":"Analyse Progress"}
      </PrimaryBtn>

      {loading&&(
        <Card style={{textAlign:"center",padding:"44px 24px"}}>
          <div style={{fontSize:38,marginBottom:14}}>🔍</div>
          <p style={{fontWeight:800,fontSize:17,marginBottom:6}}>Comparing body composition...</p>
          <p style={{color:C.muted,fontSize:13}}>Analysing muscle definition & fat distribution changes</p>
        </Card>
      )}

      {analysis&&!loading&&(
        <Card>
          <SL>AI Progress Analysis</SL>
          <p style={{fontSize:15,lineHeight:1.78,color:"rgba(255,255,255,0.88)",whiteSpace:"pre-wrap"}}>{analysis}</p>
        </Card>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   SUPPLEMENTS
═══════════════════════════════════════ */
function Supps() {
  const [done,setDone]=useState({});
  const toggle=(p,i)=>{const k=`${p}-${i}`;setDone(d=>({...d,[k]:!d[k]}));};
  const total=SUPPS.reduce((a,s)=>a+s.items.length,0);
  const taken=Object.values(done).filter(Boolean).length;
  const pct=Math.round(taken/total*100);

  return (
    <div style={{padding:"0 20px 100px"}}>
      <div style={{marginBottom:22}}>
        <h2 style={{fontSize:28,fontWeight:900,letterSpacing:"-0.5px"}}>Supplements</h2>
        <p style={{color:C.muted,fontSize:13,marginTop:4}}>{taken}/{total} taken today</p>
      </div>

      {/* Progress hero */}
      <div style={{borderRadius:20,padding:20,marginBottom:24,position:"relative",overflow:"hidden",
        background:`linear-gradient(135deg,${C.lime}18,${C.lime}06)`,
        border:`1px solid ${C.lime}22`,boxShadow:`0 4px 28px ${C.lime}10`}}>
        <div style={{position:"absolute",right:-20,top:-20,width:100,height:100,borderRadius:"50%",background:`${C.lime}08`}}/>
        <div style={{position:"relative",zIndex:1}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:14}}>
            <p style={{fontWeight:700,fontSize:15}}>Daily Completion</p>
            <Num size={38} color={pct===100?C.lime:C.orange}>{pct}%</Num>
          </div>
          <div style={{height:6,borderRadius:3,background:C.subtle,overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:3,width:`${pct}%`,
              background:pct===100?C.lime:`linear-gradient(90deg,${C.orange},${C.lime})`,
              transition:"width 0.5s cubic-bezier(0.4,0,0.2,1)"}}/>
          </div>
          {pct===100&&<p style={{fontSize:13,color:C.lime,marginTop:10,textAlign:"center",fontWeight:700}}>🎯 All supplements taken today!</p>}
        </div>
      </div>

      {SUPPS.map((sec,pi)=>(
        <div key={pi} style={{marginBottom:28}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
            <div style={{width:40,height:40,borderRadius:13,background:C.raised,border:`1px solid ${C.border}`,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
              {sec.emoji}
            </div>
            <div>
              <p style={{fontWeight:800,fontSize:16}}>{sec.period}</p>
              <p style={{fontSize:11,color:C.muted}}>{sec.time}</p>
            </div>
          </div>
          {sec.items.map((item,ii)=>{
            const k=`${pi}-${ii}`,isDone=done[k];
            return (
              <div key={ii} onClick={()=>toggle(pi,ii)} style={{
                display:"flex",alignItems:"center",gap:14,padding:"14px 16px",
                borderRadius:16,cursor:"pointer",marginBottom:8,
                background:isDone?`${C.lime}08`:C.card,
                border:`1px solid ${isDone?`${C.lime}28`:C.border}`,
                transition:"all 0.2s",boxShadow:"0 2px 12px rgba(0,0,0,0.2)"
              }}>
                <div style={{
                  width:30,height:30,borderRadius:"50%",flexShrink:0,
                  background:isDone?C.lime:C.raised,
                  border:`1px solid ${isDone?`${C.lime}60`:C.border}`,
                  display:"flex",alignItems:"center",justifyContent:"center"
                }}>
                  {isDone&&<span style={{fontSize:14,color:"#000",fontWeight:900}}>✓</span>}
                </div>
                <div style={{flex:1}}>
                  <p style={{fontWeight:700,fontSize:15,color:isDone?C.lime:"white"}}>{item.name}</p>
                  <p style={{fontSize:13,color:C.muted,marginTop:2}}>{item.dose} · {item.why}</p>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      <div style={{background:`${C.blue}0E`,border:`1px solid ${C.blue}22`,borderRadius:20,padding:20}}>
        <p style={{fontSize:10,color:C.blue,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:10}}>💧 Hydration Schedule</p>
        <Num size={34} color={C.blue}>3.0L / DAY</Num>
        <p style={{fontSize:13,color:C.muted,marginTop:4,marginBottom:16}}>For 82kg active male. Increase on training days.</p>
        {WATER_SCHED.map(([t,v],i)=>(
          <div key={i} style={{display:"flex",gap:14,padding:"8px 0",borderBottom:i<WATER_SCHED.length-1?`1px solid ${C.border}`:"none"}}>
            <span style={{fontSize:12,color:C.blue,width:62,flexShrink:0,fontWeight:700}}>{t}</span>
            <span style={{fontSize:13,color:"rgba(255,255,255,0.7)"}}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   RECOVERY
═══════════════════════════════════════ */
function Recovery({ whoop, setWhoop }) {
  const [advice,setAdvice]=useState("");
  const [advLoad,setAdvLoad]=useState(false);
  const [scanLoad,setScanLoad]=useState(false);
  const [scanResult,setScanResult]=useState(null);
  const [scanError,setScanError]=useState("");
  const [shots,setShots]=useState([]);
  const [showMan,setShowMan]=useState(false);
  const fileRef=useRef();

  const toB64=f=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(f);});

  const handleFiles=async e=>{
    const files=Array.from(e.target.files||[]).slice(0,2);
    if(!files.length)return;
    const p=await Promise.all(files.map(async f=>({url:URL.createObjectURL(f),b64:await toB64(f),mime:f.type})));
    setShots(p);setScanResult(null);setScanError("");
    e.target.value="";
  };

  const scan=async()=>{
    if(!shots.length)return;
    setScanLoad(true);setScanResult(null);setScanError("");
    const imgs=shots.map(s=>({type:"image",source:{type:"base64",media_type:s.mime,data:s.b64}}));
    try{
      const res=await fetch("/api/claude",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",max_tokens:500,
          system:"Extract Whoop app metrics from screenshots. Return ONLY a raw JSON object — no markdown, no explanation, nothing else.",
          messages:[{role:"user",content:[...imgs,{type:"text",text:'Look at these Whoop screenshots and extract all numeric metrics you can see. Return ONLY this JSON (use 0 for any value not visible):\n{"recovery":0,"hrv":0,"rhr":0,"sleep":0,"strain":0,"respiratory":0,"sleepEfficiency":0,"hoursVsNeeded":0,"sleepConsistency":0}'}]}]
        })
      });
      const d=await res.json();
      if(d.type==="error"||!d.content?.[0]?.text) throw new Error("API error");
      const raw=d.content[0].text;
      const start=raw.indexOf("{"), end=raw.lastIndexOf("}");
      if(start===-1) throw new Error("No JSON found");
      const parsed=JSON.parse(raw.slice(start,end+1));
      setScanResult(parsed);
      setWhoop(w=>({...w,
        recovery:parsed.recovery||w.recovery,
        hrv:parsed.hrv||w.hrv,
        rhr:parsed.rhr||w.rhr,
        sleep:parsed.sleep||w.sleep,
        strain:parsed.strain||w.strain
      }));
    }catch(e){
      setScanError("Couldn't read the screenshots. Make sure they're clear Whoop screens and try again.");
    }
    setScanLoad(false);
  };

  const getAdvice=async()=>{
    setAdvLoad(true);setAdvice("");
    try{
      const res=await fetch("/api/claude",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",max_tokens:1000,
          system:"You are a recovery and performance coach for men over 45. Give clear, specific, practical advice. Write 3 short paragraphs covering: (1) recommended training intensity for today, (2) key nutrition focus, (3) one recovery action to prioritise.",
          messages:[{role:"user",content:`Matt, 49 years old, 82kg. Today's Whoop: Recovery ${whoop.recovery}%, HRV ${whoop.hrv}ms, Resting HR ${whoop.rhr}bpm, Sleep ${whoop.sleep}%, Yesterday's strain ${whoop.strain}/21. Goals: longevity, strength, definition. What should I do today?`}]
        })
      });
      const d=await res.json();
      if(d.type==="error"||!d.content?.[0]?.text) throw new Error("API error");
      setAdvice(d.content[0].text);
    }catch(e){setAdvice("Could not get advice. Check your connection and try again.");}
    setAdvLoad(false);
  };

  const rCol=whoop.recovery>=67?C.lime:whoop.recovery>=34?C.orange:C.red;
  const has=whoop.recovery>0;

  return (
    <div style={{padding:"0 20px 100px"}}>
      <div style={{marginBottom:22}}>
        <h2 style={{fontSize:28,fontWeight:900,letterSpacing:"-0.5px"}}>Recovery</h2>
        <p style={{color:C.muted,fontSize:13,marginTop:4}}>Scan your daily Whoop screenshots</p>
      </div>

      {/* Scan card */}
      <Card style={{marginBottom:14,background:`${C.lime}06`,border:`1px solid ${C.lime}18`}} glow={C.lime}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div>
            <p style={{fontWeight:800,fontSize:17,marginBottom:4}}>📲 Scan Whoop Screenshots</p>
            <p style={{fontSize:13,color:C.muted}}>Upload Recovery + Sleep screens</p>
          </div>
          <Badge color={C.lime}>No API needed</Badge>
        </div>

        {shots.length>0&&(
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            {shots.map((s,i)=>(
              <div key={i} style={{flex:1,borderRadius:12,overflow:"hidden",maxHeight:130,
                border:`1px solid ${C.lime}22`,position:"relative"}}>
                <img src={s.url} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top"}} alt={`Screen ${i+1}`}/>
                <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"5px 8px",background:"rgba(0,0,0,0.75)"}}>
                  <p style={{fontSize:10,color:C.lime,fontWeight:700}}>Screen {i+1}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>fileRef.current.click()} style={{
            flex:1,padding:"13px",borderRadius:12,background:C.raised,
            border:`1px solid ${C.border}`,color:"white",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"
          }}>{shots.length?"↺  Change":"📸  Upload"}</button>
          <button onClick={scan} disabled={!shots.length||scanLoad} style={{
            flex:2,padding:"13px",borderRadius:12,
            background:shots.length&&!scanLoad?`linear-gradient(135deg,${C.lime}EE,${C.lime}BB)`:"transparent",
            border:`1px solid ${shots.length?`${C.lime}50`:C.border}`,
            color:shots.length&&!scanLoad?"#000":C.muted,
            fontSize:13,fontWeight:800,cursor:shots.length&&!scanLoad?"pointer":"not-allowed",fontFamily:"inherit",
            boxShadow:shots.length&&!scanLoad?`0 4px 18px ${C.lime}25`:"none"
          }}>{scanLoad?"Scanning...":"🔍  Extract Metrics"}</button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} style={{display:"none"}}/>

        {scanLoad&&<p style={{fontSize:12,color:C.muted,textAlign:"center",marginTop:10}}>Reading your Whoop data...</p>}
        {scanError&&<p style={{fontSize:12,color:C.red,marginTop:10}}>⚠️ {scanError}</p>}

        {scanResult&&!scanLoad&&(
          <div style={{marginTop:14,background:`${C.lime}08`,border:`1px solid ${C.lime}18`,borderRadius:12,padding:14}}>
            <p style={{fontSize:9,color:C.lime,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:10}}>✓ Extracted & Applied</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {[["Recovery",scanResult.recovery,"%"],["HRV",scanResult.hrv,"ms"],["Resting HR",scanResult.rhr,"bpm"],["Sleep",scanResult.sleep,"%"],["Sleep Eff.",scanResult.sleepEfficiency,"%"],["Hrs vs Need",scanResult.hoursVsNeeded,"%"],["Consistency",scanResult.sleepConsistency,"%"],["Respiratory",scanResult.respiratory,""]].filter(([,v])=>v>0).map(([l,v,u])=>(
                <div key={l} style={{background:C.raised,borderRadius:10,padding:"9px 10px",border:`1px solid ${C.border}`}}>
                  <p style={{fontSize:9,color:C.muted,marginBottom:3}}>{l}</p>
                  <Num size={18}>{v}{u}</Num>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Recovery ring */}
      {has&&(
        <div style={{borderRadius:20,padding:20,marginBottom:14,
          background:`linear-gradient(135deg,${rCol}12,${rCol}04)`,
          border:`1px solid ${rCol}20`,display:"flex",alignItems:"center",gap:20,
          boxShadow:`0 4px 28px ${rCol}12`}}>
          <Ring val={whoop.recovery} max={100} size={106} sw={9} color={rCol} bg={`${rCol}18`}>
            <Num size={30} color="white">{whoop.recovery}</Num>
            <span style={{fontSize:10,color:C.muted}}>%</span>
          </Ring>
          <div>
            <p style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>Recovery Score</p>
            <p style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,color:rCol,letterSpacing:"0.06em",lineHeight:1,marginBottom:4}}>
              {whoop.recovery>=67?"GREEN 🟢":whoop.recovery>=34?"YELLOW 🟡":"RED 🔴"}
            </p>
            <p style={{fontSize:12,color:C.muted}}>{whoop.recovery>=67?"Push hard today":whoop.recovery>=34?"Moderate intensity":"Prioritise rest"}</p>
            {whoop.hrv>0&&<p style={{fontSize:11,color:C.muted,marginTop:4}}>HRV {whoop.hrv}ms · RHR {whoop.rhr}bpm</p>}
          </div>
        </div>
      )}

      <button onClick={()=>setShowMan(m=>!m)} style={{
        width:"100%",padding:"12px",borderRadius:12,background:"transparent",
        border:`1px solid ${C.border}`,color:C.muted,fontSize:12,cursor:"pointer",
        fontFamily:"inherit",marginBottom:showMan?12:14,fontWeight:600
      }}>{showMan?"▲  Hide manual sliders":"▼  Adjust manually"}</button>

      {showMan&&(
        <Card style={{marginBottom:14}}>
          <SL>Manual Adjust</SL>
          {[{k:"recovery",l:"Recovery",u:"%",max:100,e:"💚"},{k:"hrv",l:"HRV",u:"ms",max:200,e:"❤️"},
            {k:"rhr",l:"Resting HR",u:"bpm",max:100,e:"🫀"},{k:"sleep",l:"Sleep",u:"%",max:100,e:"😴"},
            {k:"strain",l:"Yesterday's Strain",u:"/21",max:21,e:"⚡"}].map(({k,l,u,max,e})=>(
            <div key={k} style={{marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <p style={{fontSize:13,fontWeight:600}}>{e} {l}</p>
                <Num size={18} color={C.lime}>{whoop[k]}{u}</Num>
              </div>
              <input type="range" min={0} max={max} value={whoop[k]}
                onChange={e=>setWhoop(w=>({...w,[k]:+e.target.value}))} style={{width:"100%",cursor:"pointer"}}/>
            </div>
          ))}
        </Card>
      )}

      <PrimaryBtn onClick={getAdvice} disabled={!has||advLoad} full style={{marginBottom:14}}>
        💡  {advLoad?"Getting advice...":"Get AI Recovery Advice"}
      </PrimaryBtn>

      {advLoad&&(
        <Card style={{textAlign:"center",padding:"32px 20px"}}>
          <div style={{fontSize:30,marginBottom:10}}>💡</div>
          <p style={{fontWeight:800}}>Analysing your recovery data...</p>
        </Card>
      )}

      {advice&&!advLoad&&(
        <Card style={{marginBottom:14}}>
          <SL>Today's Recommendation</SL>
          <p style={{fontSize:15,lineHeight:1.78,color:"rgba(255,255,255,0.88)",whiteSpace:"pre-wrap"}}>{advice}</p>
        </Card>
      )}

      <div style={{background:`${C.blue}0E`,border:`1px solid ${C.blue}20`,borderRadius:20,padding:20}}>
        <p style={{fontSize:10,color:C.blue,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:10}}>📲 Daily 30-second routine</p>
        {["Open Whoop app each morning","Screenshot your Recovery screen","Screenshot your Sleep screen","Upload both here → tap Extract Metrics","Tap Get AI Advice for today's plan"].map((s,i)=>(
          <div key={i} style={{display:"flex",gap:12,padding:"7px 0",borderBottom:i<4?`1px solid ${C.border}`:"none"}}>
            <Num size={14} color={C.blue}>{i+1}.</Num>
            <span style={{fontSize:12,color:C.muted}}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   ROOT APP
═══════════════════════════════════════ */
export default function App() {
  const [tab,setTab]=useState("home");
  const [water,setWater]=useState(0);
  const [whoop,setWhoop]=useState({recovery:0,hrv:0,rhr:0,sleep:0,strain:0});
  const addWater=ml=>setWater(w=>Math.min(w+ml,WATER_GOAL+1000));

  useEffect(()=>{
    const link=document.createElement("link");
    link.rel="stylesheet";
    link.href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap";
    document.head.appendChild(link);
    const style=document.createElement("style");
    style.textContent=`
      *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
      html,body{background:#080810;}
      input[type=range]{-webkit-appearance:none;appearance:none;height:4px;border-radius:2px;background:rgba(255,255,255,0.1);outline:none;width:100%;}
      input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#CAFF00;cursor:pointer;box-shadow:0 0 10px #CAFF0055;}
      ::-webkit-scrollbar{width:0;height:0;}
    `;
    document.head.appendChild(style);
  },[]);

  const NAV=[
    {id:"home",    icon:Ico.home,     label:"Home"},
    {id:"train",   icon:Ico.train,    label:"Train"},
    {id:"progress",icon:Ico.progress, label:"Progress"},
    {id:"supps",   icon:Ico.supps,    label:"Supps"},
    {id:"recovery",icon:Ico.recovery, label:"Recovery"},
  ];

  const SCREENS={
    home:     <Home     water={water} addWater={addWater} whoop={whoop}/>,
    train:    <Train    whoop={whoop}/>,
    progress: <Progress/>,
    supps:    <Supps/>,
    recovery: <Recovery whoop={whoop} setWhoop={setWhoop}/>,
  };

  const rCol=whoop.recovery>=67?C.lime:whoop.recovery>=34?C.orange:C.red;

  return (
    <div style={{background:C.bg,color:"white",minHeight:"100vh",maxWidth:430,margin:"0 auto",fontFamily:"'DM Sans',sans-serif"}}>

      {/* ── Header ── */}
      <div style={{
        position:"sticky",top:0,zIndex:50,padding:"40px 20px 14px",
        background:`linear-gradient(to bottom,${C.surface}FF,${C.surface}E0 65%,transparent 100%)`,
        backdropFilter:"blur(24px)"
      }}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <p style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:"0.14em",color:C.lime,lineHeight:1}}>FORGE</p>
            <p style={{fontSize:8,color:C.muted,letterSpacing:"0.22em",textTransform:"uppercase"}}>PERSONAL COACH</p>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <div style={{background:C.raised,border:`1px solid ${C.border}`,borderRadius:20,padding:"5px 12px"}}>
              <p style={{fontSize:11,color:C.muted}}>49 · 82kg</p>
            </div>
            {whoop.recovery>0&&(
              <div style={{background:`${rCol}14`,border:`1px solid ${rCol}30`,borderRadius:20,padding:"5px 12px"}}>
                <p style={{fontSize:11,color:rCol,fontWeight:700}}>💓 {whoop.recovery}%</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Screen ── */}
      <div>{SCREENS[tab]}</div>

      {/* ── Bottom Nav ── */}
      <div style={{
        position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",
        width:"100%",maxWidth:430,zIndex:50,
        background:C.surface,borderTop:`1px solid ${C.border}`,
        padding:"12px 0 24px",display:"flex",backdropFilter:"blur(24px)"
      }}>
        {NAV.map(({id,icon,label})=>{
          const active=tab===id;
          return (
            <button key={id} onClick={()=>setTab(id)} style={{
              flex:1,background:"none",border:"none",cursor:"pointer",
              display:"flex",flexDirection:"column",alignItems:"center",gap:4,
              color:active?C.lime:"rgba(255,255,255,0.25)",transition:"all 0.18s"
            }}>
              {icon}
              <span style={{fontSize:8,textTransform:"uppercase",letterSpacing:"0.12em",fontWeight:active?700:400}}>
                {label}
              </span>
              {active&&<div style={{width:24,height:2,borderRadius:1,background:C.lime,marginTop:1}}/>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

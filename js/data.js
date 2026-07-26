// ── ASHA EduShield 2.0 — Shared Data ──
const DATA = {
  roles: {
    student: {
      label:'Student', avatar:'S', color:'#3b82f6',
      nav:[
        {section:'Emergency'},
        {id:'sos',icon:'fa-exclamation-circle',label:'SOS Emergency'},
        {id:'women-safety',icon:'fa-venus',label:'Women Safety'},
        {id:'safe-travel',icon:'fa-route',label:'Safe Travel'},
        {section:'Report'},
        {id:'report',icon:'fa-flag',label:'Report Incident'},
        {section:'Wellness'},
        {id:'wellness',icon:'fa-heart',label:'Wellness Chat'},
        {section:'Campus'},
        {id:'map',icon:'fa-map-marker-alt',label:'Campus Map'},
        {id:'dashboard',icon:'fa-home',label:'My Dashboard'},
        {section:'Account'},
        {id:'profile',icon:'fa-id-card',label:'Profile & Contacts'},
      ]
    },
    faculty: {
      label:'Faculty', avatar:'F', color:'#10b981',
      nav:[
        {section:'Overview'},
        {id:'dashboard',icon:'fa-home',label:'Dashboard'},
        {section:'Classroom'},
        {id:'classroom',icon:'fa-shield-halved',label:'Classroom Guardian'},
        {id:'exam',icon:'fa-user-shield',label:'Exam Integrity'},
        {section:'Safety'},
        {id:'incidents',icon:'fa-list-alt',label:'Incidents'},
        {id:'map',icon:'fa-map-marker-alt',label:'Campus Map'},
      ]
    },
    security: {
      label:'Security', avatar:'G', color:'#f59e0b',
      nav:[
        {section:'Operations'},
        {id:'dashboard',icon:'fa-home',label:'Dashboard'},
        {id:'dispatch',icon:'fa-bolt',label:'Live Dispatch'},
        {section:'Records'},
        {id:'incidents',icon:'fa-list-alt',label:'All Incidents'},
        {id:'map',icon:'fa-map-marker-alt',label:'Campus Map'},
      ]
    },
    admin: {
      label:'Admin', avatar:'A', color:'#8b5cf6',
      nav:[
        {section:'Overview'},
        {id:'dashboard',icon:'fa-home',label:'Dashboard'},
        {section:'Intelligence'},
        {id:'agents',icon:'fa-robot',label:'AI Agents'},
        {id:'analytics',icon:'fa-chart-bar',label:'Analytics'},
        {section:'Safety'},
        {id:'women-safety',icon:'fa-venus',label:'Women Safety'},
        {section:'Records'},
        {id:'incidents',icon:'fa-list-alt',label:'All Incidents'},
        {id:'map',icon:'fa-map-marker-alt',label:'Campus Map'},
      ]
    }
  },

  incidents: [
    {id:'INC-4821',type:'SOS',loc:'Block B, Room 204',reporter:'Priya S.',time:'2 min ago',sev:'critical',status:'Active',lat:28.6145,lng:77.2095},
    {id:'INC-4820',type:'Ragging',loc:'Hostel 3 Corridor',reporter:'Anonymous',time:'14 min ago',sev:'high',status:'Investigating',lat:28.6132,lng:77.2085},
    {id:'INC-4819',type:'Mental Health',loc:'Library Zone',reporter:'Rahul M.',time:'31 min ago',sev:'medium',status:'Counselor Assigned',lat:28.6140,lng:77.2100},
    {id:'INC-4818',type:'Harassment',loc:'Parking Lot A',reporter:'Anonymous',time:'1 hr ago',sev:'high',status:'Investigating',lat:28.6150,lng:77.2078},
    {id:'INC-4817',type:'Bullying',loc:'Canteen',reporter:'Anonymous',time:'2 hr ago',sev:'medium',status:'Under Review',lat:28.6128,lng:77.2092},
    {id:'INC-4816',type:'SOS',loc:'Gate 2',reporter:'Anjali K.',time:'3 hr ago',sev:'critical',status:'Resolved',lat:28.6120,lng:77.2070},
    {id:'INC-4815',type:'Ragging',loc:'Hostel 1',reporter:'Anonymous',time:'5 hr ago',sev:'high',status:'Resolved',lat:28.6155,lng:77.2088},
    {id:'INC-4814',type:'Harassment',loc:'Lab Block',reporter:'Anonymous',time:'6 hr ago',sev:'medium',status:'Resolved',lat:28.6138,lng:77.2110},
    {id:'INC-4813',type:'Bullying',loc:'Sports Ground',reporter:'Vikram P.',time:'8 hr ago',sev:'low',status:'Resolved',lat:28.6125,lng:77.2065},
    {id:'INC-4812',type:'Mental Health',loc:'Hostel 2',reporter:'Anonymous',time:'10 hr ago',sev:'high',status:'Resolved',lat:28.6148,lng:77.2082},
  ],

  guards: [
    {id:'G1',name:'Amit S.',status:'Available',zone:'Block A-C',lat:28.6142,lng:77.2098},
    {id:'G2',name:'Pradeep R.',status:'On Patrol',zone:'Hostel Zone',lat:28.6135,lng:77.2080},
    {id:'G3',name:'Rajan K.',status:'Dispatched',zone:'Block B',lat:28.6144,lng:77.2094},
    {id:'G4',name:'Mohan L.',status:'Available',zone:'Gate 1-2',lat:28.6122,lng:77.2072},
    {id:'G5',name:'Sunil T.',status:'On Patrol',zone:'Parking',lat:28.6152,lng:77.2076},
    {id:'G6',name:'Deepak V.',status:'Break',zone:'—',lat:28.6130,lng:77.2105},
    {id:'G7',name:'Suresh M.',status:'Dispatched',zone:'Hostel 3',lat:28.6133,lng:77.2086},
    {id:'G8',name:'Ramesh P.',status:'Available',zone:'Admin Block',lat:28.6138,lng:77.2115},
  ],

  agents: [
    {name:'Guardian Agent',icon:'🛡',status:'active',tasks:47,desc:'Central threat evaluator — scores every signal and routes to specialist agents',color:'#ef4444',inputs:'SOS events, GPS, hostel check-ins, zone violations',outputs:'Threat score 0–100, routing decision, escalation'},
    {name:'SOS Agent',icon:'🆘',status:'active',tasks:12,desc:'Handles SOS lifecycle from trigger to resolution with live tracking',color:'#f59e0b',inputs:'GPS, user ID, audio/video, device sensors',outputs:'Incident ticket, live tracking session, responder assignments'},
    {name:'Women Safety Agent',icon:'👩',status:'active',tasks:8,desc:'Monitors travel, detects route deviations, manages escort requests',color:'#ec4899',inputs:'Live GPS stream, safe travel mode, route plan',outputs:'Deviation alerts, escort dispatch, emergency escalation'},
    {name:'Anti-Ragging Agent',icon:'🚫',status:'active',tasks:23,desc:'NLP severity analysis, repeat offender detection, hotspot mapping',color:'#8b5cf6',inputs:'Complaint text, audio, images, accused descriptions',outputs:'Severity score, offender profile, hotspot map'},
    {name:'Bullying Detection Agent',icon:'⚠️',status:'active',tasks:15,desc:'Pattern detection across complaints, risk scoring, escalation workflow',color:'#f97316',inputs:'Anonymous complaints, behavioral signals',outputs:'Risk score, pattern analysis, escalation recommendation'},
    {name:'Mental Wellness Agent',icon:'🧠',status:'active',tasks:89,desc:'Wellness chatbot, sentiment analysis, counselor referrals via Gemini Pro',color:'#10b981',inputs:'Chat messages, journal entries, voice notes',outputs:'Wellness score, distress flags, counselor referrals'},
    {name:'Suicide Prevention Agent',icon:'💙',status:'active',tasks:4,desc:'Ideation detection with IMMINENT escalation and crisis response',color:'#06b6d4',inputs:'Journal text, chat history, wellness scores',outputs:'Risk level IMMINENT/HIGH/MED/LOW, intervention plan'},
    {name:'Classroom Intelligence Agent',icon:'📚',status:'active',tasks:6,desc:'Engagement monitoring, attention tracking via Gemini Vision',color:'#3b82f6',inputs:'Camera feed, lecture topic, student roster',outputs:'Engagement score, attention heatmap, faculty recommendations'},
    {name:'Exam Integrity Agent',icon:'📋',status:'idle',tasks:0,desc:'AI proctoring, phone detection, malpractice evidence generation',color:'#64748b',inputs:'Camera feed, student seat map, exam schedule',outputs:'Malpractice alerts, evidence clips, confidence scores'},
    {name:'Investigation Agent',icon:'🔍',status:'active',tasks:11,desc:'Evidence synthesis and investigation reports via Gemini Pro',color:'#a855f7',inputs:'Incident ticket, evidence, witness statements',outputs:'Investigation summary, likely offenders, recommended actions'},
    {name:'Dispatch Agent',icon:'📡',status:'active',tasks:18,desc:'Assigns responders, calculates nearest guard, tracks SLA',color:'#22c55e',inputs:'Incident location, threat level, available responders',outputs:'Responder assignments, navigation, ETA estimates'},
    {name:'Risk Prediction Agent',icon:'📊',status:'active',tasks:5,desc:'Predicts future incidents using historical patterns and Actian Vector search',color:'#eab308',inputs:'Historical incidents, time, location, events calendar',outputs:'Risk heatmap, predicted hotspots, preventive recommendations'},
    {name:'Campus Analytics Agent',icon:'📈',status:'active',tasks:3,desc:'Aggregates all metrics for dashboards and compliance reports',color:'#14b8a6',inputs:'All incident data, engagement data, wellness data',outputs:'KPI dashboards, trend reports, compliance summaries'},
    {name:'Missing Student Agent',icon:'🔎',status:'idle',tasks:0,desc:'Face matching on CCTV, search coordination, authority alerts',color:'#64748b',inputs:'Missing report, last known location, student photo',outputs:'Search plan, CCTV match results, location predictions'},
    {name:'Compliance Agent',icon:'📜',status:'active',tasks:2,desc:'UGC/NAAC compliance reports, SLA monitoring, government dashboards',color:'#f43f5e',inputs:'All incident data, investigation outcomes, response times',outputs:'Compliance reports, SLA alerts, regulatory exports'},
    {name:'Voice Evidence Agent',icon:'🎙',status:'active',tasks:9,desc:'Captures distress audio, transcribes speech, analyzes threat, generates evidence via ElevenLabs + Gemini',color:'#f59e0b',inputs:'Microphone audio, speech transcript, GPS',outputs:'Transcript, threat analysis, AI incident summary, sealed audio evidence'},
    {name:'Learning Intelligence Agent',icon:'👁️',status:'active',tasks:6,desc:'Estimates attention, focus, confusion, fatigue and engagement from classroom frames via Gemini Vision',color:'#3b82f6',inputs:'Faculty classroom photo, lecture topic',outputs:'Engagement score, faculty insight, teaching recommendation, at-risk prediction'},
    {name:'Classroom Guardian AI',icon:'🛡️',status:'active',tasks:11,desc:'OpenCV + YOLO + Gemini Vision: weapon detection, aggression/ragging prediction, emergency gesture recognition, exam-integrity overlay, attention analytics and a fused classroom risk score — human-in-the-loop alerts',color:'#8b5cf6',inputs:'Classroom / exam / hostel camera frame',outputs:'Bounding-box overlay, weapon/aggression/gesture flags, attention score, risk 0-100, auto emergency alert'},
    {name:'Multimodal Investigation Agent',icon:'🧬',status:'active',tasks:7,desc:'Fuses audio, video, images, text reports and GPS into one complete incident report',color:'#a855f7',inputs:'Audio, video, images, text reports, GPS',outputs:'Unified incident report, timeline, confidence, recommended actions'},
  ],

  botResponses: {
    anxious:["I hear you. Let's try a quick breathing exercise — inhale for 4 counts, hold for 4, exhale for 4. How does that feel?","You're not alone in feeling this way. Many students experience anxiety. What's triggering it most right now?"],
    stress:["Exam stress is very real. What subject or deadline is weighing on you most?","It's okay to feel stressed. Have you been able to take any breaks today? Even 10 minutes helps."],
    lonely:["Feeling lonely on campus is more common than you think. I'm here with you right now. What's been going on?","Thank you for sharing that. Are there any clubs or spaces on campus you've thought about exploring?"],
    sad:["I'm sorry you're feeling this way. It takes courage to say it. Can you tell me more about what's been happening?","Your feelings matter. I'm here to listen without judgment. What's been on your mind lately?"],
    crisis:["I'm really concerned about what you just shared. You matter deeply. I'm connecting you with a counselor right now. 💙\n\niCall helpline: 9152987821 (free, confidential)"],
    default:["Thank you for sharing that with me. Can you tell me more about how long you've been feeling this way?","I'm here for you. Would talking it through, some coping strategies, or connecting with a counselor help most?","That sounds really difficult. You're doing the right thing by reaching out. How can I support you best today?","I want to make sure I understand — can you tell me a bit more about what's been happening?"]
  }
};

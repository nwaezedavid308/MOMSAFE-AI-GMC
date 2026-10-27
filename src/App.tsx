import React, { useEffect, useState } from "react";
import { Heart, Users, Hospital, BarChart3, MessageCircle, ArrowLeft, ArrowRight, ChevronRight, ShieldCheck, Volume2, LogIn, Home, Baby, ClipboardList, Activity } from "lucide-react";
import MotherPortal from "./components/MotherPortal";
import TBAPortal from "./components/TBAPortal";
import HospitalDashboard from "./components/HospitalDashboard";
import AnalyticsView from "./components/AnalyticsView";
import MaternalAssistant from "./components/MaternalAssistant";
import AuthOnboarding from "./components/AuthOnboarding";
import MOMSAFELogo from "./components/MOMSAFELogo";
import { Case } from "./types";
import { fetchAllCases, getLocalStoredCases, saveLocalStoredCases } from "./data/caseService";

type Portal = "landing" | "mother" | "tba" | "gmc" | "analytics" | "assistant" | "auth";
const portals = [
  {id:"mother", title:"For mothers", short:"Mother", subtitle:"Check how you feel and get help", description:"Check how you feel, follow your pregnancy, and find help.", icon:Heart, feature:"Voice guidance in Igbo, Pidgin and English", action:"Open mother's app", tone:"mother"},
  {id:"tba", title:"For birth attendants", short:"Birth attendant", subtitle:"Find a mother. Check her health. Refer if needed.", description:"Register a mother, check her health, and send a referral.", icon:Users, feature:"Step-by-step health checks and referrals", action:"Open birth attendant's app", tone:"tba"},
  {id:"gmc", title:"For the hospital", short:"Hospital", subtitle:"Review referrals and prepare care.", description:"See referrals, review risk signs, and coordinate care.", icon:Hospital, feature:"Referral queue and care team updates", action:"Open hospital board", tone:"hospital"},
] as const;
export default function App() {
  const [page, setPage] = useState<Portal>("landing");
  const [previous, setPrevious] = useState<Portal>("landing");
  const [user, setUser] = useState<{name:string;role:string;community?:string}|null>(null);
  const [cases, setCases] = useState<Case[]>(getLocalStoredCases);
  const [context, setContext] = useState<Case|null>(null);
  useEffect(()=>{let live=true;const refresh=()=>fetchAllCases().then(data=>{if(live)setCases(data);});refresh();const timer=setInterval(refresh,10000);return()=>{live=false;clearInterval(timer);};},[]);
  const navigate=(next:Portal)=>{setPage(next);window.scrollTo({top:0,behavior:"instant"});};
  const assistant=(activeCase:Case|null)=>{setContext(activeCase);setPrevious(page);navigate("assistant");};
  const submitted=(c:Case)=>{setContext(c);setCases(prev=>{const next=[c,...prev.filter(item=>item.id!==c.id)];saveLocalStoredCases(next);return next;});};
  const updated=(c:Case)=>{setCases(prev=>{const next=prev.map(item=>item.id===c.id?c:item);saveLocalStoredCases(next);return next;});if(context?.id===c.id)setContext(c);};
  const active=portals.find(p=>p.id===page);
  const title=active?.title || (page==="analytics"?"Care reports":page==="assistant"?"MOMSAFE guide":"Sign in or register");
  return <div className="portal-app">
    <a className="skip-link" href="#portal-main">Skip to content</a>
    <header className="portal-header"><button className="portal-brand" onClick={()=>navigate("landing")} aria-label="MOMSAFE home"><MOMSAFELogo size={42}/><span>MOMSAFE <b>Connect</b><small>Mother. Community. Care.</small></span></button><span className="hospital-identity"><ShieldCheck size={18}/>Googwill Medical Centre <span>Enugu</span></span><button className="account-link" onClick={()=>navigate("auth")}><LogIn size={18}/><span>{user?user.name:"Sign in"}</span></button></header>
    <main id="portal-main" className={"portal-main "+(page==="landing"?"portal-home":"")}>
      {page==="landing"?<>
        <section className="portal-intro"><span className="intro-symbol"><Heart size={28} strokeWidth={1.7}/></span><p className="intro-location">Maternal care, connected in Enugu</p><h1>Care for mothers.<br/>Help for care teams.</h1><p>MOMSAFE helps you check health and send referrals.<br className="desktop-break"/> Choose who you are to begin.</p><div className="language-note"><Volume2 size={18}/><span>Igbo, Pidgin & English voice support</span></div></section>
        <section className="portal-choices" aria-label="Choose your app">{portals.map(p=><button key={p.id} className={"portal-choice "+p.tone} onClick={()=>navigate(p.id)}><div className="choice-top"><span className="choice-icon"><p.icon size={28} strokeWidth={1.7}/></span><ArrowRight className="choice-arrow" size={22}/></div><h2>{p.title}</h2><p className="choice-subtitle">{p.subtitle}</p><p className="choice-description">{p.description}</p><div className="choice-feature">{p.id==="mother"?<Volume2 size={17}/>:p.id==="tba"?<ClipboardList size={17}/>:<Activity size={17}/>}<span>{p.feature}</span></div><span className="choice-action">{p.action}<ChevronRight size={18}/></span></button>)}</section>
        <section className="portal-support"><div><ShieldCheck size={23}/><span><strong>Connected care, from community to hospital</strong><small>Googwill Medical Centre, Umuchigbo, Enugu East</small></span></div><button onClick={()=>navigate("analytics")}><BarChart3 size={18}/>View care reports<ChevronRight size={16}/></button></section>
        <p className="presentation-note">Demonstration platform. Explore each app above. Profiles use demo sign-in.</p>
      </>:<>
        <div className="portal-page-heading"><button className="back-portals" onClick={()=>navigate(page==="assistant"?previous:"landing")}><ArrowLeft size={18}/>{page==="assistant"?"Back to app":"All apps"}</button><div><span className={"page-icon "+(active?.tone||"tba")}>{active?<active.icon size={23}/>:page==="assistant"?<MessageCircle size={23}/>:<ShieldCheck size={23}/>}</span><div><h1>{title}</h1><p>{active?.subtitle || (page==="assistant"?"Ask a question about maternal care":"MOMSAFE Connect")}</p></div></div>{page!=="assistant"&&page!=="auth"&&<button className="help-guide" onClick={()=>assistant(null)}><MessageCircle size={18}/>Ask for guidance</button>}</div>
        {page==="mother"&&<MotherPortal currentUser={user} onCaseSubmitted={submitted} onOpenAssistant={assistant}/>}
        {page==="tba"&&<div className="tba-content"><TBAPortal currentUser={user} onCaseSubmitted={submitted} onOpenAssistant={assistant}/></div>}
        {page==="gmc"&&<HospitalDashboard cases={cases} onCaseUpdated={updated} onOpenAssistant={assistant}/>}
        {page==="analytics"&&<AnalyticsView cases={cases}/>}
        {page==="assistant"&&<div className="assistant-content"><MaternalAssistant activeCase={context}/></div>}
        {page==="auth"&&<div className="auth-content"><AuthOnboarding onAuthSuccess={u=>{setUser(u);navigate(u.role==="admin"?"gmc":u.role==="patient"?"mother":"tba");}} onSkip={()=>navigate("landing")}/><p className="presentation-note">Demo profiles only. This sign-in does not provide secure access control.</p></div>}
      </>}
      <footer className="portal-footer"><span>MOMSAFE Connect</span><span>Supporting mothers and the people who care for them.</span></footer>
    </main>
    {page!=="landing"&&<nav className="portal-switcher" aria-label="Switch app"><button onClick={()=>navigate("landing")}><Home size={20}/><span>All apps</span></button>{portals.map(p=><button key={p.id} aria-current={page===p.id?"page":undefined} className={page===p.id?"selected":""} onClick={()=>navigate(p.id)}><p.icon size={20}/><span>{p.short}</span></button>)}</nav>}
  </div>;
}

"use client";

import {FormEvent,useEffect,useMemo,useState} from "react";
import {ArrowLeft,Check,ExternalLink,LogOut,Save,Trash2} from "lucide-react";
import Link from "next/link";
import {copy,type Locale} from "@/lib/i18n";
import {createClient} from "@/lib/supabase/client";
import {
  deleteProjectAction,
  deleteTimelineAction,
  getDashboardData,
  saveContentAction,
  saveProjectAction,
  saveTimelineAction,
  type DashboardContentRow as Row,
  type DashboardProject as Project,
  type DashboardTimeline as Timeline,
} from "./actions";

type Tab="projects"|"timeline"|"content"|"settings";

const emptyProject:Omit<Project,"id">={slug:"",title:"",category:"",description:"",stack:[],href:"",github_url:"",image_url:null,featured:false,published:false,sort_order:0};
const emptyTimeline:Omit<Timeline,"id">={locale:"en",chapter:"",period:"",title:"",body:"",tags:[],published:true,sort_order:0};

const contentFields=[
  ["hero","eyebrow","Eyebrow"],["hero","location","Location"],["hero","name_first","First name"],["hero","name_last","Last name"],["hero","title","Title"],["hero","intro","Introduction"],["hero","cta","CTA"],
  ["nav","journey","Journey link"],["nav","work","Work link"],["nav","about","About link"],["nav","contact","Contact link"],["nav","talk","Talk CTA"],
  ["timeline","label","Section label"],["timeline","title","Section title"],["timeline","intro","Section introduction"],
  ["work","label","Section label"],["work","title","Section title"],["work","intro","Section introduction"],
  ["about","label","Section label"],["about","title","Title"],["about","body","Body"],["about","experience","Experience"],
  ["contact","label","Section label"],["contact","title","Title"],["contact","body","Body"],["contact","cta","CTA"],["contact","email","Email"],
  ["seo","title","SEO title"],["seo","description","SEO description"],
] as const;

function fallback(locale:Locale,section:string,field:string){
  const t=copy[locale];
  if(section==="hero")return field==="eyebrow"?t.hero.eyebrow:field==="location"?t.hero.location:field==="title"?t.hero.title:field==="intro"?t.hero.intro:field==="cta"?t.hero.cta:field==="name_first"?"Felipe":"Seabra.";
  if(section==="nav"){const values:Record<string,string>={journey:t.nav.journey,work:t.nav.work,about:t.nav.about,contact:t.nav.contact,talk:t.nav.talk};return values[field]??"";}
  if(section==="timeline"){const values:Record<string,string>={label:t.timeline.label,title:t.timeline.title,intro:t.timeline.intro};return values[field]??"";}
  if(section==="work"){const values:Record<string,string>={label:t.work.label,title:t.work.title,intro:t.work.intro};return values[field]??"";}
  if(section==="about"){const values:Record<string,string>={label:t.about.label,title:t.about.title,body:t.about.body,experience:t.about.experience};return values[field]??"";}
  if(section==="contact"){const values:Record<string,string>={label:t.contact.label,title:t.contact.title,body:t.contact.body,cta:t.contact.cta,email:"hello@felipeseabra.com.br"};return values[field]??"";}
  if(section==="social"){const values:Record<string,string>={github:"https://github.com/felipe-seabra",linkedin:"https://www.linkedin.com/in/felipe-seabra/"};return values[field]??"";}
  if(section==="seo")return field==="title"?"Felipe Seabra — Front-End Developer":"Portfolio and career timeline of Felipe Seabra, a Front-End focused Full-Stack Developer based in Dublin, Ireland.";
  return "";
}

export default function DashboardPage(){
  const supabase=useMemo(()=>createClient(),[]);
  const[email,setEmail]=useState("");const[password,setPassword]=useState("");const[userEmail,setUserEmail]=useState<string|null>(null);
  const[isAdmin,setIsAdmin]=useState(false);
  const[tab,setTab]=useState<Tab>("projects");const[locale,setLocale]=useState<Locale>("en");
  const[projects,setProjects]=useState<Project[]>([]);const[timeline,setTimeline]=useState<Timeline[]>([]);const[rows,setRows]=useState<Row[]>([]);
  const[editingProject,setEditingProject]=useState<Project|null>(null);const[projectForm,setProjectForm]=useState(emptyProject);
  const[editingTimeline,setEditingTimeline]=useState<Timeline|null>(null);const[timelineForm,setTimelineForm]=useState(emptyTimeline);
  const[status,setStatus]=useState("");
  const[projectQuery,setProjectQuery]=useState("");
  const[projectFilter,setProjectFilter]=useState<"all"|"published"|"draft">("all");
  const[timelineQuery,setTimelineQuery]=useState("");
  const[statusType,setStatusType]=useState<"success"|"error"|"info">("info");
  const[loading,setLoading]=useState(()=>Boolean(supabase));
  const[busy,setBusy]=useState(false);
  const notify=(message:string,type:"success"|"error"|"info"="info")=>{setStatus(message);setStatusType(type)};
  const startNewProject=()=>{setEditingProject(null);setProjectForm(emptyProject);};
  const startNewTimeline=()=>{setEditingTimeline(null);setTimelineForm({...emptyTimeline,locale});};
  const cancelProjectEdit=()=>{setEditingProject(null);setProjectForm(emptyProject);};
  const cancelTimelineEdit=()=>{setEditingTimeline(null);setTimelineForm({...emptyTimeline,locale});};
  const filteredProjects=projects.filter(p=>{
    const query=projectQuery.trim().toLowerCase();
    const matchesQuery=!query||[p.title,p.category,p.slug,p.description,...p.stack].some(value=>value.toLowerCase().includes(query));
    const matchesFilter=projectFilter==="all"||(projectFilter==="published"?p.published:!p.published);
    return matchesQuery&&matchesFilter;
  });
  const filteredTimeline=timeline.filter(item=>{
    if(item.locale!==locale)return false;
    const query=timelineQuery.trim().toLowerCase();
    return !query||[item.title,item.chapter,item.period,item.body,...item.tags].some(value=>value.toLowerCase().includes(query));
  });

  useEffect(()=>{
    if(!status)return;
    const timer=window.setTimeout(()=>setStatus(""),3000);
    return()=>window.clearTimeout(timer);
  },[status]);

  useEffect(()=>{
    if(!supabase)return;
    let active=true;
    const load=async()=>{
      const{data:{user}}=await supabase.auth.getUser();
      if(!active)return;
      setUserEmail(user?.email??null);
      if(user){
        const res=await getDashboardData(locale);
        if(!active)return;
        if(!res.isAdmin){
          setIsAdmin(false);
          setStatus(res.error||"This account is not authorized to manage the CMS.");
          setLoading(false);
          return;
        }
        setIsAdmin(true);
        if(res.error)setStatus(res.error);
        setProjects(res.projects);
        setTimeline(res.timeline);
        setRows(res.content);
      }
      setLoading(false);
    };
    void load();
    return()=>{active=false};
  },[supabase,locale]);

  const signIn=async(e:FormEvent)=>{
    e.preventDefault();
    if(!supabase)return;
    notify("Signing in...");
    const{error}=await supabase.auth.signInWithPassword({email,password});
    if(error){notify(error.message,"error");return}
    setEmail("");setPassword("");
    window.location.reload();
  };

  const signOut=async()=>{
    if(!supabase)return;
    await supabase.auth.signOut();
    window.location.reload();
  };

  const saveProject=async(e:FormEvent)=>{
    e.preventDefault();
    setBusy(true);notify("Saving project...");
    const payload=editingProject?{...projectForm,id:editingProject.id}:{...projectForm};
    const res=await saveProjectAction(payload);
    if(!res.success||!res.data){
      notify(res.error||"Failed to save project.","error");setBusy(false);
      return;
    }
    const saved=res.data;
    setProjects(v=>(editingProject?v.map(p=>p.id===editingProject.id?saved:p):[...v,saved]).sort((a,b)=>a.sort_order-b.sort_order));
    setEditingProject(null);
    setProjectForm(emptyProject);
    notify("Project saved.","success");setBusy(false);
  };

  const deleteProject=async(id:string)=>{
    if(!window.confirm("Delete this project?"))return;
    setBusy(true);notify("Deleting project...");
    const res=await deleteProjectAction(id);
    if(!res.success){
      notify(res.error||"Failed to delete project.","error");setBusy(false);
      return;
    }
    setProjects(v=>v.filter(p=>p.id!==id));
    notify("Project deleted.","success");setBusy(false);
  };

  const saveTimeline=async(e:FormEvent)=>{
    e.preventDefault();
    setBusy(true);notify("Saving timeline...");
    const payload=editingTimeline?{...timelineForm,id:editingTimeline.id,locale}:{...timelineForm,locale};
    const res=await saveTimelineAction(payload);
    if(!res.success||!res.data){
      notify(res.error||"Failed to save timeline.","error");setBusy(false);
      return;
    }
    const saved=res.data;
    setTimeline(v=>(editingTimeline?v.map(item=>item.id===editingTimeline.id?saved:item):[...v,saved]).sort((a,b)=>a.sort_order-b.sort_order));
    setEditingTimeline(null);
    setTimelineForm({...emptyTimeline,locale});
    notify("Timeline saved.","success");setBusy(false);
  };

  const deleteTimeline=async(id:string)=>{
    setBusy(true);notify("Deleting timeline entry...");
    const res=await deleteTimelineAction(id);
    if(!res.success){
      notify(res.error||"Failed to delete timeline entry.","error");setBusy(false);
      return;
    }
    setTimeline(v=>v.filter(i=>i.id!==id));
    notify("Timeline entry deleted.","success");setBusy(false);
  };

  const value=(section:string,field:string)=>rows.find(r=>r.section===section&&r.field===field)?.value??fallback(locale,section,field);
  const setValue=(section:string,field:string,val:string)=>setRows(v=>{const existing=v.find(r=>r.section===section&&r.field===field);return existing?v.map(r=>r===existing?{...r,value:val}:r):[...v,{locale,section,field,value:val}]});

  const saveContent=async()=>{
    setBusy(true);notify("Saving content...");
    const payload=contentFields.map(([section,field])=>({locale,section,field,value:value(section,field)}));
    const res=await saveContentAction(payload);
    notify(res.success?"Content saved.":(res.error||"Failed to save content."),res.success?"success":"error");setBusy(false);
  };

  const saveSocial=async()=>{
    setBusy(true);notify("Saving social links...");
    const payload=(["github","linkedin"] as const).map(field=>({locale,section:"social",field,value:value("social",field)}));
    const res=await saveContentAction(payload);
    notify(res.success?"Social links saved.":(res.error||"Failed to save social links."),res.success?"success":"error");setBusy(false);
  };

  if(loading)return <main className="min-h-screen bg-[var(--bg)] p-8 text-[var(--fg)]"><p className="font-mono text-xs uppercase tracking-[.2em] text-[var(--muted)]">Loading dashboard...</p></main>;
  if(!supabase)return <main className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-5 text-[var(--fg)]"><div className="w-full max-w-lg rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-8"><h1 className="text-4xl">Supabase is not configured.</h1><p className="mt-5 leading-7 text-[var(--muted)]">Configure the environment variables and run the Supabase schema.</p><Link href="/" className="mt-8 inline-flex items-center gap-2 text-sm"><ArrowLeft size={15}/> Back</Link></div></main>;
  if(!userEmail)return <main className="relative flex min-h-screen flex-col overflow-hidden bg-[var(--bg)] text-[var(--fg)]">
    <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_50%_20%,rgba(94,227,139,0.08),transparent_32%),radial-gradient(circle_at_10%_90%,rgba(255,255,255,0.04),transparent_28%)]" />
    <div className="relative flex flex-1 items-center justify-center px-5 py-16">
      <form onSubmit={signIn} className="w-full max-w-md rounded-3xl border border-[var(--line)] bg-[var(--surface)]/90 p-7 shadow-[0_30px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-[var(--fg)]/20 hover:shadow-[0_36px_90px_rgba(0,0,0,0.34)] md:p-9">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.24em] text-[var(--faint)]">FS / Dashboard</p>
            <p className="mt-2 text-xs text-[var(--muted)]">Private content management</p>
          </div>
          <span className="h-2 w-2 rounded-full bg-[#5ee38b] shadow-[0_0_16px_rgba(94,227,139,0.65)]" aria-hidden="true" />
        </div>
        <div className="mt-10">
          <p className="font-mono text-[10px] uppercase tracking-[.2em] text-[var(--faint)]">Authentication</p>
          <h1 className="mt-3 text-4xl tracking-[-.05em] md:text-5xl">Sign in</h1>
          <p className="mt-4 text-sm leading-6 text-[var(--muted)]">Access the portfolio dashboard to manage your published content.</p>
        </div>
        <div className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-2 block text-xs text-[var(--muted)]">Email</span>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" autoComplete="email" required placeholder="you@example.com" className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3.5 text-sm transition-all duration-200 placeholder:text-[var(--faint)] hover:border-[var(--fg)]/20 focus:border-[var(--fg)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--fg)]/10"/>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs text-[var(--muted)]">Password</span>
            <input value={password} onChange={e=>setPassword(e.target.value)} type="password" autoComplete="current-password" required placeholder="••••••••" className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3.5 text-sm transition-all duration-200 placeholder:text-[var(--faint)] hover:border-[var(--fg)]/20 focus:border-[var(--fg)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--fg)]/10"/>
          </label>
        </div>
        {status&&<p className="mt-5 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm leading-5 text-red-200" role="alert">{status}</p>}
        <button type="submit" disabled={busy} className="mt-7 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--fg)] px-4 py-3 text-sm text-[var(--bg)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(255,255,255,0.1)] active:translate-y-0 active:scale-[.99] disabled:cursor-wait disabled:opacity-60">
          {busy?"Signing in...":"Sign in"} <Check size={15}/>
        </button>
        <Link href="/" className="mt-5 flex items-center justify-center rounded-xl border border-[var(--line)] px-4 py-3 text-xs text-[var(--muted)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--fg)]/30 hover:bg-[var(--surface-strong)] hover:text-[var(--fg)]">
          Back to portfolio
        </Link>
      </form>
    </div>
    <footer className="relative border-t border-[var(--line)] px-5 py-5">
      <div className="mx-auto flex max-w-md flex-col items-center justify-between gap-2 text-center text-[10px] text-[var(--faint)] sm:flex-row sm:text-left">
        <Link href="/" className="font-mono uppercase tracking-[.16em] transition-colors hover:text-[var(--fg)]">felipeseabra.com.br</Link>
        <span>© {new Date().getFullYear()} Felipe Seabra. All rights reserved.</span>
      </div>
    </footer>
  </main>;
  if(!isAdmin)return <main className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-5 text-[var(--fg)]"><div className="w-full max-w-lg rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-8"><h1 className="text-4xl">Access denied.</h1><p className="mt-5 leading-7 text-[var(--muted)]">{status||"This account is not authorized to manage the CMS."}</p><button onClick={signOut} className="mt-8 rounded-full border border-[var(--line)] px-4 py-2 text-xs">Sign out</button></div></main>;

  return <>
    {status&&<div className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-md ${statusType==="success"?"border-emerald-400/40 bg-emerald-400/10 text-emerald-200":statusType==="error"?"border-red-400/40 bg-red-400/10 text-red-200":"border-[var(--line)] bg-[var(--surface-strong)] text-[var(--fg)]"}`} role="status" aria-live="polite">{status}</div>}
  <main className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
    <header className="border-b border-[var(--line)] px-5 py-4 md:px-8"><div className="mx-auto flex max-w-[1500px] items-center justify-between"><div><p className="font-mono text-xs tracking-[.18em]">FS / DASHBOARD</p><p className="text-xs text-[var(--muted)]">{userEmail}</p></div><div className="flex items-center gap-3"><Link href="/" className="hidden items-center gap-2 text-xs text-[var(--muted)] transition-all duration-200 hover:-translate-y-0.5 hover:text-[var(--fg)] md:flex"><ExternalLink size={14}/> View site</Link><button onClick={signOut} className="flex cursor-pointer items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2 text-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--fg)] hover:bg-[var(--surface-strong)] active:translate-y-0 active:scale-[.98]"><LogOut size={14}/> Sign out</button></div></div></header>
    <div className="mx-auto grid max-w-[1500px] gap-8 px-5 py-8 md:grid-cols-[220px_1fr] md:px-8">
      <aside className="md:sticky md:top-8 md:h-fit"><nav className="flex gap-2 overflow-x-auto md:block md:space-y-2">{(["projects","timeline","content","settings"] as Tab[]).map(item=><button key={item} onClick={()=>setTab(item)} className={`flex w-full cursor-pointer rounded-xl px-4 py-3 text-left text-sm capitalize transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[var(--surface-strong)] active:translate-y-0 active:scale-[.99] ${tab===item?"bg-[var(--surface-strong)] shadow-[0_8px_24px_rgba(255,255,255,0.04)]":"text-[var(--muted)]"}`}>{item}</button>)}</nav></aside>
      <section><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-xs uppercase tracking-[.2em] text-[var(--faint)]">Content management</p><h1 className="mt-2 text-5xl tracking-[-.06em]">{tab}</h1></div><div className="flex items-center gap-3">{tab==="projects"&&<button type="button" onClick={startNewProject} className="rounded-full border border-[var(--line)] px-4 py-2 text-xs transition hover:-translate-y-0.5 hover:bg-[var(--surface-strong)]">+ New project</button>}{tab==="timeline"&&<button type="button" onClick={startNewTimeline} className="rounded-full border border-[var(--line)] px-4 py-2 text-xs transition hover:-translate-y-0.5 hover:bg-[var(--surface-strong)]">+ New entry</button>{tab!=="projects"&&<div className="flex rounded-full border border-[var(--line)] p-1"><button onClick={()=>{setLocale("en");setEditingTimeline(null);setTimelineForm({...emptyTimeline,locale:"en"})}} className={`cursor-pointer rounded-full px-3 py-1 text-xs transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ${locale==="en"?"bg-[var(--fg)] text-[var(--bg)] shadow-[0_6px_18px_rgba(255,255,255,0.08)]":"text-[var(--muted)] hover:bg-[var(--surface-strong)]"}`}>EN</button><button onClick={()=>{setLocale("pt");setEditingTimeline(null);setTimelineForm({...emptyTimeline,locale:"pt"})}} className={`cursor-pointer rounded-full px-3 py-1 text-xs transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ${locale==="pt"?"bg-[var(--fg)] text-[var(--bg)] shadow-[0_6px_18px_rgba(255,255,255,0.08)]":"text-[var(--muted)] hover:bg-[var(--surface-strong)]"}`}>PT</button></div>}{status&&<p className="text-xs text-[var(--muted)]">{status}</p>}</div></div>

      {tab==="projects"&&<div className="grid gap-6 xl:grid-cols-[1fr_400px]"><div className="space-y-4"><div className="flex flex-wrap gap-2"><input aria-label="Search projects" value={projectQuery} onChange={e=>setProjectQuery(e.target.value)} placeholder="Search projects..." className="min-w-56 flex-1 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--fg)]/40"/>{(["all","published","draft"] as const).map(filter=><button key={filter} type="button" onClick={()=>setProjectFilter(filter)} className={`rounded-xl border px-3 py-2 text-xs capitalize transition ${projectFilter===filter?"border-[var(--fg)]/30 bg-[var(--surface-strong)] text-[var(--fg)]":"border-[var(--line)] text-[var(--muted)] hover:bg-[var(--surface-strong)]"}`}>{filter}</button>)}</div>{filteredProjects.length===0?<div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface)] p-10 text-center"><p className="text-sm text-[var(--muted)]">{projects.length===0?"No projects yet.":"No projects match the current filters."}</p><button type="button" onClick={startNewProject} className="mt-4 rounded-xl border border-[var(--line)] px-4 py-2 text-xs hover:bg-[var(--surface-strong)]">Create project</button></div>:filteredProjects.map(p=><article key={p.id} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--fg)]/20 hover:shadow-[0_16px_40px_rgba(0,0,0,0.18)]"><div className="flex items-start justify-between gap-4"><div><div className="flex gap-2"><span className="rounded-full border border-[var(--line)] px-2 py-1 font-mono text-[9px] uppercase text-[var(--faint)]">{p.published?"Published":"Draft"}</span>{p.featured&&<span className="rounded-full border border-[var(--line)] px-2 py-1 font-mono text-[9px] uppercase text-[var(--faint)]">Featured</span>}</div><h2 className="mt-3 text-2xl">{p.title}</h2><p className="text-sm text-[var(--muted)]">{p.category}</p></div><div className="flex gap-2"><button type="button" onClick={()=>{setEditingProject(p);setProjectForm(p)}} className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs cursor-pointer transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--fg)] hover:bg-[var(--surface-strong)] active:translate-y-0 active:scale-[.98]">Edit</button><button type="button" onClick={()=>void deleteProject(p.id)} aria-label={`Delete ${p.title}`} className="rounded-lg border border-[var(--line)] p-2 cursor-pointer transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-red-400/60 hover:bg-red-400/10 hover:text-red-200 active:translate-y-0 active:scale-[.96]"><Trash2 size={14}/></button></div></div><p className="mt-4 text-sm leading-6 text-[var(--muted)]">{p.description}</p><div className="mt-4 flex flex-wrap gap-2">{p.stack.map(s=><span key={s} className="font-mono text-[9px] text-[var(--faint)]">{s}</span>)}</div></article>)}</div><form onSubmit={saveProject} className="h-fit rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5"><div className="flex items-center justify-between gap-3"><div><h2 className="text-xl">{editingProject?"Edit project":"New project"}</h2><p className="mt-1 text-xs text-[var(--muted)]">{editingProject?"Existing slug is preserved to avoid breaking links.":"Slug is generated automatically from the title."}</p></div>{editingProject&&<button type="button" onClick={cancelProjectEdit} className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs text-[var(--muted)] hover:bg-[var(--surface-strong)]">Cancel</button>}</div><div className="mt-5 space-y-4">{([["title","Title"],["category","Category"],["description","Description"],["href","Website URL"],["github_url","GitHub URL"],["image_url","Image URL"]] as const).map(([key,label])=><input key={key} placeholder={label} value={key==="title"?projectForm.title:key==="category"?projectForm.category:key==="description"?projectForm.description:key==="href"?projectForm.href:key==="github_url"?(projectForm.github_url??""):projectForm.image_url??""} onChange={e=>setProjectForm({...projectForm,[key]:e.target.value})} className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm transition-all duration-200 placeholder:text-[var(--faint)] focus:border-[var(--fg)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--fg)]/10"/>) }<div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3"><p className="text-[10px] uppercase tracking-[.15em] text-[var(--faint)]">Slug</p><p className="mt-1 font-mono text-xs text-[var(--muted)]">{projectForm.slug||"Generated when saved"}</p></div><input placeholder="Stack, comma separated" value={projectForm.stack.join(", ")} onChange={e=>setProjectForm({...projectForm,stack:e.target.value.split(",").map(v=>v.trim()).filter(Boolean)})} className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm transition-all duration-200 placeholder:text-[var(--faint)] focus:border-[var(--fg)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--fg)]/10"/><input type="number" placeholder="Order" value={projectForm.sort_order} onChange={e=>setProjectForm({...projectForm,sort_order:Number(e.target.value)})} className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm transition-all duration-200 placeholder:text-[var(--faint)] focus:border-[var(--fg)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--fg)]/10"/><div className="flex gap-5 text-xs text-[var(--muted)]"><label><input type="checkbox" checked={projectForm.featured} onChange={e=>setProjectForm({...projectForm,featured:e.target.checked})}/> Featured</label><label><input type="checkbox" checked={projectForm.published} onChange={e=>setProjectForm({...projectForm,published:e.target.checked})}/> Published</label></div></div><button type="submit" disabled={busy} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--fg)] px-4 py-3 text-sm text-[var(--bg)] cursor-pointer transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(255,255,255,0.08)] active:translate-y-0 active:scale-[.99] disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"><Save size={15}/> {busy?"Saving...":"Save project"}</button></form></div>}

      {tab==="timeline"&&<div className="grid gap-6 xl:grid-cols-[1fr_400px]"><div className="space-y-4"><input aria-label="Search timeline" value={timelineQuery} onChange={e=>setTimelineQuery(e.target.value)} placeholder="Search timeline..." className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--fg)]/40"/>{filteredTimeline.length===0?<div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface)] p-10 text-center"><p className="text-sm text-[var(--muted)]">No timeline entries found.</p><button type="button" onClick={startNewTimeline} className="mt-4 rounded-xl border border-[var(--line)] px-4 py-2 text-xs hover:bg-[var(--surface-strong)]">Create entry</button></div>:filteredTimeline.map(item=><article key={item.id} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--fg)]/20 hover:shadow-[0_16px_40px_rgba(0,0,0,0.18)]"><div className="flex justify-between gap-4"><div><span className="font-mono text-[9px] text-[var(--faint)]">{item.period}</span><h2 className="mt-2 text-2xl">{item.title}</h2></div><div className="flex gap-2"><button type="button" onClick={()=>{setEditingTimeline(item);setTimelineForm(item)}} className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs cursor-pointer transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--fg)] hover:bg-[var(--surface-strong)] active:translate-y-0 active:scale-[.98]">Edit</button><button type="button" onClick={()=>void deleteTimeline(item.id)} className="rounded-lg border border-[var(--line)] p-2 cursor-pointer transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-red-400/60 hover:bg-red-400/10 hover:text-red-200 active:translate-y-0 active:scale-[.96]"><Trash2 size={14}/></button></div></div><p className="mt-3 text-sm leading-6 text-[var(--muted)]">{item.body}</p></article>)}</div><form onSubmit={saveTimeline} className="h-fit rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5"><div className="flex items-center justify-between gap-3"><div><h2 className="text-xl">{editingTimeline?"Edit timeline":"New timeline entry"}</h2><p className="mt-1 text-xs text-[var(--muted)]">Manage the {locale.toUpperCase()} version of this entry.</p></div>{editingTimeline&&<button type="button" onClick={cancelTimelineEdit} className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs text-[var(--muted)] hover:bg-[var(--surface-strong)]">Cancel</button>}</div><div className="mt-5 space-y-4"><input placeholder="Chapter" value={timelineForm.chapter} onChange={e=>setTimelineForm({...timelineForm,chapter:e.target.value})} className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm transition-all duration-200 placeholder:text-[var(--faint)] focus:border-[var(--fg)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--fg)]/10"/><input placeholder="Period" value={timelineForm.period} onChange={e=>setTimelineForm({...timelineForm,period:e.target.value})} className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm transition-all duration-200 placeholder:text-[var(--faint)] focus:border-[var(--fg)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--fg)]/10"/><input placeholder="Title" value={timelineForm.title} onChange={e=>setTimelineForm({...timelineForm,title:e.target.value})} className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm transition-all duration-200 placeholder:text-[var(--faint)] focus:border-[var(--fg)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--fg)]/10"/><textarea placeholder="Body" rows={5} value={timelineForm.body} onChange={e=>setTimelineForm({...timelineForm,body:e.target.value})} className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm transition-all duration-200 placeholder:text-[var(--faint)] focus:border-[var(--fg)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--fg)]/10"/><input placeholder="Tags, comma separated" value={timelineForm.tags.join(", ")} onChange={e=>setTimelineForm({...timelineForm,tags:e.target.value.split(",").map(v=>v.trim()).filter(Boolean)})} className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm transition-all duration-200 placeholder:text-[var(--faint)] focus:border-[var(--fg)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--fg)]/10"/><input type="number" placeholder="Order" value={timelineForm.sort_order} onChange={e=>setTimelineForm({...timelineForm,sort_order:Number(e.target.value)})} className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm transition-all duration-200 placeholder:text-[var(--faint)] focus:border-[var(--fg)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--fg)]/10"/><label className="text-xs text-[var(--muted)]"><input type="checkbox" checked={timelineForm.published} onChange={e=>setTimelineForm({...timelineForm,published:e.target.checked})}/> Published</label></div><button type="submit" disabled={busy} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--fg)] px-4 py-3 text-sm text-[var(--bg)] cursor-pointer transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(255,255,255,0.08)] active:translate-y-0 active:scale-[.99] disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"><Save size={15}/> {busy?"Saving...":"Save timeline"}</button></form></div>}

      {tab==="content"&&<div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6"><div className="mb-6"><h2 className="text-2xl">Site content</h2><p className="mt-2 text-sm text-[var(--muted)]">Edit the main public copy without changing code.</p></div><div className="grid gap-5 md:grid-cols-2">{contentFields.map(([section,field,label])=><label key={`${section}.${field}`} className="block text-sm text-[var(--muted)]"><span className="font-mono text-[9px] uppercase tracking-[.15em] text-[var(--faint)]">{section}</span><span className="mt-1 block">{label}</span><textarea rows={field==="description"||field==="body"||field==="intro"||field==="title"?3:2} value={value(section,field)} onChange={e=>setValue(section,field,e.target.value)} className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)]"/></label>)}</div><button onClick={()=>void saveContent()} disabled={busy} className="mt-6 flex items-center gap-2 rounded-xl bg-[var(--fg)] px-4 py-3 text-sm text-[var(--bg)] cursor-pointer transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(255,255,255,0.08)] active:translate-y-0 active:scale-[.99] disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"><Save size={15}/> {busy?"Saving...":"Save content"}</button></div>}

      {tab==="settings"&&<div className="max-w-2xl rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6"><h2 className="text-2xl">Social links</h2><p className="mt-2 text-sm text-[var(--muted)]">These links are used by the public site and structured data.</p><div className="mt-6 space-y-5">{(["github","linkedin"] as const).map(field=><label key={field} className="block text-sm text-[var(--muted)]">{field==="github"?"GitHub URL":"LinkedIn URL"}<input value={value("social",field)} onChange={e=>setValue("social",field,e.target.value)} className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)]"/></label>)}</div><button onClick={()=>void saveSocial()} disabled={busy} className="mt-6 flex items-center gap-2 rounded-xl bg-[var(--fg)] px-4 py-3 text-sm text-[var(--bg)] cursor-pointer transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(255,255,255,0.08)] active:translate-y-0 active:scale-[.99] disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"><Save size={15}/> {busy?"Saving...":"Save settings"}</button></div>}
      </section>
    </div>
  </main></>;
}

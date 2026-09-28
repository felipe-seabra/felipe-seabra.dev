"use client";

import {FormEvent,useEffect,useMemo,useState} from "react";
import {ArrowLeft,Check,ExternalLink,LayoutDashboard,LogOut,Plus,Save,Trash2} from "lucide-react";
import Link from "next/link";
import {createClient} from "@/lib/supabase/client";

type Project={
  id:string;
  slug:string;
  title:string;
  category:string;
  description:string;
  stack:string[];
  href:string;
  image_url:string|null;
  featured:boolean;
  published:boolean;
  sort_order:number;
};

type Tab="projects"|"timeline"|"content";

const emptyProject:Omit<Project,"id">={
  slug:"",
  title:"",
  category:"",
  description:"",
  stack:[],
  href:"#contact",
  image_url:null,
  featured:false,
  published:false,
  sort_order:0,
};

export default function DashboardPage(){
  const supabase=useMemo(()=>createClient(),[]);
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [userEmail,setUserEmail]=useState<string|null>(null);
  const [tab,setTab]=useState<Tab>("projects");
  const [projects,setProjects]=useState<Project[]>([]);
  const [editing,setEditing]=useState<Project|null>(null);
  const [form,setForm]=useState(emptyProject);
  const [content,setContent]=useState({heroTitle:"",heroIntro:""});
  const [status,setStatus]=useState("");
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    if(!supabase){
      setLoading(false);
      return;
    }

    let active=true;

    const load=async()=>{
      const {data:{user}}=await supabase.auth.getUser();

      if(!active)return;

      setUserEmail(user?.email??null);

      if(user){
        const [{data:projectRows},{data:contentRows}]=await Promise.all([
          supabase.from("projects").select("*").order("sort_order",{ascending:true}),
          supabase.from("site_content").select("*").eq("locale","en").eq("section","hero"),
        ]);

        if(projectRows)setProjects(projectRows as Project[]);
        if(contentRows){
          const title=contentRows.find(row=>row.field==="title")?.value??"";
          const intro=contentRows.find(row=>row.field==="intro")?.value??"";
          setContent({heroTitle:title,heroIntro:intro});
        }
      }

      setLoading(false);
    };

    void load();

    return ()=>{active=false;};
  },[supabase]);

  const signIn=async(event:FormEvent)=>{
    event.preventDefault();
    if(!supabase)return;
    setStatus("Signing in...");

    const {error}=await supabase.auth.signInWithPassword({email,password});

    if(error){
      setStatus(error.message);
      return;
    }

    window.location.reload();
  };

  const signOut=async()=>{
    if(!supabase)return;
    await supabase.auth.signOut();
    window.location.reload();
  };

  const saveProject=async(event:FormEvent)=>{
    event.preventDefault();
    if(!supabase)return;

    const payload={
      ...form,
      stack:form.stack,
      image_url:form.image_url||null,
    };

    const query=editing
      ? supabase.from("projects").update(payload).eq("id",editing.id).select().single()
      : supabase.from("projects").insert(payload).select().single();

    const {data,error}=await query;

    if(error){
      setStatus(error.message);
      return;
    }

    if(data){
      setProjects(current=>{
        const next=editing
          ? current.map(project=>project.id===editing.id?data as Project:project)
          : [...current,data as Project];
        return next.sort((a,b)=>a.sort_order-b.sort_order);
      });
    }

    setEditing(null);
    setForm(emptyProject);
    setStatus("Project saved.");
  };

  const deleteProject=async(id:string)=>{
    if(!supabase||!window.confirm("Delete this project?"))return;

    const {error}=await supabase.from("projects").delete().eq("id",id);

    if(error){
      setStatus(error.message);
      return;
    }

    setProjects(current=>current.filter(project=>project.id!==id));
    setStatus("Project deleted.");
  };

  const saveContent=async()=>{
    if(!supabase)return;

    const rows=[
      {locale:"en",section:"hero",field:"title",value:content.heroTitle},
      {locale:"en",section:"hero",field:"intro",value:content.heroIntro},
    ];

    const {error}=await supabase.from("site_content").upsert(rows,{onConflict:"locale,section,field"});

    setStatus(error?error.message:"Content saved.");
  };

  if(loading){
    return <main className="min-h-screen bg-[var(--bg)] p-8 text-[var(--fg)]"><p className="font-mono text-xs uppercase tracking-[.2em] text-[var(--muted)]">Loading dashboard...</p></main>;
  }

  if(!supabase){
    return <main className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-5 text-[var(--fg)]"><div className="w-full max-w-lg rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-8"><p className="font-mono text-xs uppercase tracking-[.2em] text-[var(--faint)]">Dashboard setup</p><h1 className="mt-4 text-4xl tracking-[-.05em]">Supabase is not configured.</h1><p className="mt-5 leading-7 text-[var(--muted)]">Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local, then run the SQL in supabase/schema.sql.</p><Link href="/" className="mt-8 inline-flex items-center gap-2 text-sm"><ArrowLeft size={15}/> Back to portfolio</Link></div></main>;
  }

  if(!userEmail){
    return <main className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-5 text-[var(--fg)]"><form onSubmit={signIn} className="w-full max-w-md rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-8"><p className="font-mono text-xs uppercase tracking-[.2em] text-[var(--faint)]">FS / Dashboard</p><h1 className="mt-4 text-4xl tracking-[-.05em]">Sign in</h1><div className="mt-8 space-y-4"><label className="block text-sm text-[var(--muted)]">Email<input value={email} onChange={event=>setEmail(event.target.value)} type="email" autoComplete="email" required className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-[var(--fg)] outline-none focus:border-[var(--fg)]"/></label><label className="block text-sm text-[var(--muted)]">Password<input value={password} onChange={event=>setPassword(event.target.value)} type="password" autoComplete="current-password" required className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-[var(--fg)] outline-none focus:border-[var(--fg)]"/></label></div>{status&&<p className="mt-4 text-sm text-[var(--muted)]">{status}</p>}<button type="submit" className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--fg)] px-4 py-3 text-sm text-[var(--bg)]">Sign in <Check size={15}/></button><Link href="/" className="mt-5 flex items-center justify-center gap-2 text-xs text-[var(--muted)]"><ArrowLeft size={14}/> Back to portfolio</Link></form></main>;
  }

  return <main className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
    <header className="border-b border-[var(--line)] px-5 py-4 md:px-8"><div className="mx-auto flex max-w-[1500px] items-center justify-between"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--line)]"><LayoutDashboard size={16}/></div><div><p className="font-mono text-xs tracking-[.18em]">FS / DASHBOARD</p><p className="text-xs text-[var(--muted)]">{userEmail}</p></div></div><div className="flex items-center gap-3"><Link href="/" className="hidden items-center gap-2 text-xs text-[var(--muted)] md:flex"><ExternalLink size={14}/> View site</Link><button onClick={signOut} className="flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2 text-xs"><LogOut size={14}/> Sign out</button></div></div></header>
    <div className="mx-auto grid max-w-[1500px] gap-8 px-5 py-8 md:grid-cols-[220px_1fr] md:px-8">
      <aside className="md:sticky md:top-8 md:h-fit"><nav className="flex gap-2 overflow-x-auto md:block md:space-y-2">{(["projects","timeline","content"] as Tab[]).map(item=><button key={item} onClick={()=>setTab(item)} className={`flex w-full items-center rounded-xl px-4 py-3 text-left text-sm capitalize ${tab===item?"bg-[var(--surface-strong)]":"text-[var(--muted)] hover:bg-[var(--surface)]"}`}>{item}</button>)}</nav></aside>
      <section>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-xs uppercase tracking-[.2em] text-[var(--faint)]">Content management</p><h1 className="mt-2 text-5xl tracking-[-.06em]">{tab}</h1></div>{status&&<p className="text-xs text-[var(--muted)]">{status}</p>}</div>
        {tab==="projects"&&<div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="space-y-3">{projects.map(project=><article key={project.id} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5"><div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap gap-2"><span className="rounded-full border border-[var(--line)] px-2 py-1 font-mono text-[9px] uppercase text-[var(--faint)]">{project.published?"Published":"Draft"}</span>{project.featured&&<span className="rounded-full border border-[var(--line)] px-2 py-1 font-mono text-[9px] uppercase text-[var(--faint)]">Featured</span>}</div><h2 className="mt-3 text-2xl">{project.title}</h2><p className="mt-1 text-sm text-[var(--muted)]">{project.category}</p></div><div className="flex gap-2"><button onClick={()=>{setEditing(project);setForm(project);}} className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs">Edit</button><button onClick={()=>void deleteProject(project.id)} className="rounded-lg border border-[var(--line)] p-2 text-[var(--muted)] hover:text-red-400" aria-label={`Delete ${project.title}`}><Trash2 size={14}/></button></div></div><p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)]">{project.description}</p><div className="mt-4 flex flex-wrap gap-2">{project.stack.map(tag=><span key={tag} className="font-mono text-[9px] text-[var(--faint)]">{tag}</span>)}</div></article>)}</div>
          <form onSubmit={saveProject} className="h-fit rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5"><div className="flex items-center justify-between"><h2 className="text-xl">{editing?"Edit project":"New project"}</h2><button type="button" onClick={()=>{setEditing(null);setForm(emptyProject)}} className="text-xs text-[var(--muted)]"><Plus size={15}/></button></div><div className="mt-5 space-y-4"><input required placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm"/><input required placeholder="Slug" value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})} className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm"/><input placeholder="Category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm"/><textarea required placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={4} className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm"/><input placeholder="Stack, comma separated" value={form.stack.join(", ")} onChange={e=>setForm({...form,stack:e.target.value.split(",").map(item=>item.trim()).filter(Boolean)})} className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm"/><input placeholder="Project URL" value={form.href} onChange={e=>setForm({...form,href:e.target.value})} className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm"/><div className="flex gap-5 text-xs text-[var(--muted)]"><label className="flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={e=>setForm({...form,featured:e.target.checked})}/> Featured</label><label className="flex items-center gap-2"><input type="checkbox" checked={form.published} onChange={e=>setForm({...form,published:e.target.checked})}/> Published</label></div></div><button type="submit" className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--fg)] px-4 py-3 text-sm text-[var(--bg)]"><Save size={15}/> Save project</button></form>
        </div>}
        {tab==="timeline"&&<div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6"><h2 className="text-2xl">Timeline management</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">The database model is ready for timeline entries. The next CMS pass will expose full drag-and-drop ordering, bilingual editing and publish controls here.</p></div>}
        {tab==="content"&&<div className="max-w-3xl rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6"><h2 className="text-2xl">English hero content</h2><div className="mt-6 space-y-5"><label className="block text-sm text-[var(--muted)]">Hero title<textarea value={content.heroTitle} onChange={e=>setContent({...content,heroTitle:e.target.value})} rows={3} className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)]"/></label><label className="block text-sm text-[var(--muted)]">Hero introduction<textarea value={content.heroIntro} onChange={e=>setContent({...content,heroIntro:e.target.value})} rows={4} className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)]"/></label><button onClick={()=>void saveContent()} className="flex items-center gap-2 rounded-xl bg-[var(--fg)] px-4 py-3 text-sm text-[var(--bg)]"><Save size={15}/> Save content</button></div></div>}
      </section>
    </div>
  </main>;
}

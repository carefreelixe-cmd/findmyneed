import { useMemo, useState } from 'react'
import {
  ArrowRight, BadgeCheck, Bike, Car, ChevronDown, ChevronRight, Clock3,
  Drill, Hammer, Heart, Home, Menu, Paintbrush, Search, ShieldCheck,
  Sparkles, Star, Wrench, X, Zap, MapPin, PhoneCall, IndianRupee,
} from 'lucide-react'

const categories = [
  { name: 'Electrician', icon: Zap, color: 'bg-[#fff3bf]' },
  { name: 'Plumber', icon: Wrench, color: 'bg-[#dceffa]' },
  { name: 'Car repair', icon: Car, color: 'bg-[#f8ded6]' },
  { name: 'Bike service', icon: Bike, color: 'bg-[#e5e4fb]' },
  { name: 'Carpenter', icon: Hammer, color: 'bg-[#e4efd8]' },
  { name: 'Home cleaning', icon: Sparkles, color: 'bg-[#f6e1ee]' },
  { name: 'Appliance repair', icon: Drill, color: 'bg-[#dcece8]' },
  { name: 'Painter', icon: Paintbrush, color: 'bg-[#ffe5c4]' },
]

const pros = [
  { name: 'Ravi Electricals', service: 'Electrician', rating: '4.9', jobs: '310 jobs', rate: '₹299 onwards', area: '2.1 km away', initials: 'RE', tone: 'bg-[#ecf2c5]' },
  { name: 'Aman Auto Care', service: 'Car mechanic', rating: '4.8', jobs: '184 jobs', rate: '₹499 onwards', area: '3.4 km away', initials: 'AA', tone: 'bg-[#f6d8ce]' },
  { name: 'Neha Home Works', service: 'Home cleaning', rating: '4.9', jobs: '267 jobs', rate: '₹399 onwards', area: '1.8 km away', initials: 'NH', tone: 'bg-[#d8ece6]' },
]

const steps = [
  ['01', 'Tell us what you need', 'Search a service and share a few details. It takes less than a minute.'],
  ['02', 'Choose your expert', 'Compare transparent prices, ratings, availability and verified profiles.'],
  ['03', 'Get it sorted', 'Book a time that works. Pay safely after the job is done.'],
]

function App() {
  const [menu, setMenu] = useState(false)
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('Bengaluru')
  const [notice, setNotice] = useState('')
  const [interestOpen, setInterestOpen] = useState(false)
  const [lead, setLead] = useState({ name: '', phone: '', need: '' })
  const filtered = useMemo(() => categories.filter(c => c.name.toLowerCase().includes(query.toLowerCase())), [query])

  const search = () => {
    const service = query.trim() || 'local services'
    setNotice(`Showing trusted ${service.toLowerCase()} professionals near ${location}.`)
    document.getElementById('professionals')?.scrollIntoView({ behavior: 'smooth' })
  }

  const submitInterest = (event) => {
    event.preventDefault()
    const savedLeads = JSON.parse(localStorage.getItem('findmyneed_leads') || '[]')
    localStorage.setItem('findmyneed_leads', JSON.stringify([...savedLeads, { ...lead, city: location, createdAt: new Date().toISOString() }]))
    setInterestOpen(false)
    setLead({ name: '', phone: '', need: '' })
    setNotice('Thanks! Your interest has been saved. We’ll contact you when services launch in your city.')
  }

  return (
    <div className="min-h-screen overflow-hidden bg-cream noise">
      <nav className="relative z-50 border-b border-ink/10 bg-cream/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <a href="#" className="flex items-center gap-2.5" aria-label="FindMyNeed home">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-lime"><Home size={21} strokeWidth={2.5}/></span>
            <span className="text-xl font-extrabold tracking-[-.04em]">findmy<span className="text-leaf">need</span></span>
          </a>
          <div className="hidden items-center gap-8 text-sm font-semibold md:flex">
            <a href="#services" className="transition hover:text-leaf">Explore services</a>
            <a href="#how" className="transition hover:text-leaf">How it works</a>
            <a href="#professionals" className="transition hover:text-leaf">Top professionals</a>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <button onClick={() => setInterestOpen(true)} className="rounded-full px-4 py-2 text-sm font-bold hover:bg-ink/5">I’m interested</button>
            <button onClick={() => document.getElementById('join')?.scrollIntoView({ behavior: 'smooth' })} className="rounded-full bg-ink px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-leaf">List your service</button>
          </div>
          <button className="md:hidden" onClick={() => setMenu(!menu)} aria-label="Toggle menu">{menu ? <X/> : <Menu/>}</button>
        </div>
        {menu && <div className="border-t border-ink/10 px-5 py-5 md:hidden">
          <div className="flex flex-col gap-4 font-semibold">
            <a href="#services" onClick={() => setMenu(false)}>Explore services</a><a href="#how" onClick={() => setMenu(false)}>How it works</a><a href="#professionals" onClick={() => setMenu(false)}>Top professionals</a>
            <button onClick={() => {setMenu(false); setInterestOpen(true)}} className="text-left">I’m interested</button>
            <button onClick={() => {setMenu(false); document.getElementById('join')?.scrollIntoView()}} className="rounded-full bg-ink px-5 py-3 text-left text-white">List your service</button>
          </div>
        </div>}
      </nav>

      <main>
        <section className="relative">
          <div className="absolute right-[-10rem] top-10 h-96 w-96 rounded-full bg-lime/45 blur-3xl" />
          <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-14 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pb-28 lg:pt-20">
            <div className="relative z-10 flex flex-col justify-center">
              <div className="mb-7 flex w-fit items-center gap-2 rounded-full border border-ink/10 bg-white px-3 py-2 text-xs font-bold uppercase tracking-[.12em] shadow-sm">
                <span className="h-2 w-2 rounded-full bg-coral"/> 12,000+ local experts ready
              </div>
              <h1 className="max-w-3xl font-display text-[3.45rem] leading-[.96] tracking-[-.04em] sm:text-7xl lg:text-[5.35rem]">
                Whatever needs fixing, <span className="italic text-leaf">find the right hands.</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-ink/65 sm:text-lg">From a leaking tap to a stubborn car engine—discover trusted local professionals, compare clearly and book with confidence.</p>
              <div className="mt-9 rounded-[1.4rem] border border-ink/10 bg-white p-2 shadow-soft">
                <div className="flex flex-col sm:flex-row">
                  <label className="flex flex-1 items-center gap-3 px-4 py-3">
                    <Search size={20} className="shrink-0 text-leaf"/>
                    <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&search()} className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-ink/35" placeholder="What service do you need?" aria-label="Service"/>
                  </label>
                  <div className="hidden w-px bg-ink/10 sm:block"/>
                  <label className="flex items-center gap-2 px-4 py-3 text-sm font-semibold">
                    <MapPin size={19} className="text-coral"/>
                    <select value={location} onChange={e=>setLocation(e.target.value)} className="bg-transparent outline-none" aria-label="Location"><option>Bengaluru</option><option>Delhi</option><option>Mumbai</option><option>Hyderabad</option><option>Pune</option></select>
                  </label>
                  <button onClick={search} className="rounded-2xl bg-coral px-7 py-4 text-sm font-extrabold text-white transition hover:bg-[#ea634c]">Find experts</button>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-ink/50"><span>Popular:</span><button onClick={()=>setQuery('Electrician')} className="underline decoration-ink/20 underline-offset-4">Electrician</button><button onClick={()=>setQuery('Car repair')} className="underline decoration-ink/20 underline-offset-4">Car repair</button><button onClick={()=>setQuery('Home cleaning')} className="underline decoration-ink/20 underline-offset-4">Home cleaning</button></div>
            </div>

            <div className="relative mx-auto min-h-[480px] w-full max-w-[560px] lg:min-h-[610px]">
              <div className="absolute inset-x-4 top-4 h-[88%] rotate-3 rounded-[3rem] bg-leaf"/>
              <div className="absolute inset-x-4 top-4 h-[88%] overflow-hidden rounded-[3rem] bg-[#e8eddb]">
                <img src="/images/trusted-professional.png" alt="A trusted local service professional arriving with his tools" className="h-full w-full object-cover object-[62%_center]" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" />
                <div className="absolute bottom-7 left-7 rounded-2xl bg-white/95 p-4 shadow-soft backdrop-blur"><Wrench className="text-leaf"/><p className="mt-2 text-xs font-extrabold">Ready to help</p></div>
              </div>
              <div className="absolute right-[-.5rem] top-10 rounded-2xl bg-white p-4 shadow-soft sm:right-[-1rem]">
                <div className="flex gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-lime"><ShieldCheck size={20}/></span><div><p className="text-xs text-ink/45">Every expert</p><p className="text-sm font-extrabold">ID verified</p></div></div>
              </div>
              <div className="absolute bottom-4 left-[-.5rem] rounded-2xl bg-white p-4 shadow-soft sm:left-[-1rem]">
                <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#f6ded5] text-sm font-black">4.9</span><div><div className="flex text-[#f6a43a]"><Star size={13} fill="currentColor"/><Star size={13} fill="currentColor"/><Star size={13} fill="currentColor"/><Star size={13} fill="currentColor"/><Star size={13} fill="currentColor"/></div><p className="mt-1 text-xs font-bold">Loved by customers</p></div></div>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="border-y border-ink/10 bg-white py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-leaf">Everything, one place</p><h2 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">What do you need help with?</h2></div><button className="flex items-center gap-1 text-sm font-extrabold text-leaf">View all services <ArrowRight size={17}/></button></div>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
              {(query ? filtered : categories).map(({name, icon: Icon, color}) => <button key={name} onClick={()=>{setQuery(name); window.scrollTo({top:0,behavior:'smooth'})}} className="group rounded-[1.4rem] border border-ink/10 p-3 text-left transition hover:-translate-y-1 hover:shadow-soft">
                <span className={`grid aspect-square w-full place-items-center rounded-2xl ${color}`}><Icon size={29} strokeWidth={1.8} className="transition group-hover:scale-110"/></span><span className="mt-4 block text-sm font-extrabold leading-tight">{name}</span><span className="mt-2 flex items-center text-[11px] font-semibold text-ink/40">Explore <ChevronRight size={13}/></span>
              </button>)}
            </div>
          </div>
        </section>

        <section id="how" className="py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
              <div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-coral">Simple by design</p><h2 className="mt-4 max-w-md font-display text-5xl leading-[1.02]">Good help shouldn’t be hard to find.</h2><p className="mt-6 max-w-md leading-7 text-ink/60">No endless calls. No vague pricing. Just skilled people, real reviews and a booking that works around you.</p></div>
              <div className="divide-y divide-ink/10 border-y border-ink/10">{steps.map(([num,title,desc])=><div key={num} className="grid gap-4 py-7 sm:grid-cols-[70px_1fr] sm:py-9"><span className="font-display text-3xl italic text-coral">{num}</span><div><h3 className="text-xl font-extrabold">{title}</h3><p className="mt-2 max-w-lg text-sm leading-6 text-ink/55">{desc}</p></div></div>)}</div>
            </div>
          </div>
        </section>

        <section id="professionals" className="bg-ink py-24 text-white">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-lime">Trusted near you</p><h2 className="mt-3 font-display text-4xl sm:text-5xl">Professionals people love</h2></div><p className="max-w-md text-sm leading-6 text-white/55">{notice || 'Illustrative provider profiles for the frontend preview. Live availability will connect to the backend later.'}</p></div>
            <div className="mt-11 grid gap-5 lg:grid-cols-3">{pros.map((pro)=><article key={pro.name} className="rounded-[1.75rem] bg-white p-5 text-ink transition hover:-translate-y-1">
              <div className="flex items-start justify-between"><div className={`grid h-16 w-16 place-items-center rounded-2xl ${pro.tone} font-display text-xl`}>{pro.initials}</div><button aria-label="Save professional" className="rounded-full border border-ink/10 p-2.5 hover:bg-ink/5"><Heart size={18}/></button></div>
              <div className="mt-6 flex items-center gap-2"><h3 className="text-lg font-extrabold">{pro.name}</h3><BadgeCheck size={17} className="text-leaf" fill="#dff26a"/></div><p className="mt-1 text-sm text-ink/50">{pro.service}</p>
              <div className="mt-5 flex items-center gap-3 border-y border-ink/10 py-4 text-xs font-bold"><span className="flex items-center gap-1"><Star size={14} fill="#f6a43a" className="text-[#f6a43a]"/> {pro.rating}</span><span className="text-ink/30">•</span><span>{pro.jobs}</span><span className="text-ink/30">•</span><span>{pro.area}</span></div>
              <div className="mt-5 flex items-center justify-between"><span className="text-sm font-extrabold">{pro.rate}</span><button onClick={()=>setNotice(`Great choice! ${pro.name} has been selected for your request.`)} className="rounded-full bg-ink px-4 py-2.5 text-xs font-extrabold text-white hover:bg-leaf">View profile</button></div>
            </article>)}</div>
          </div>
        </section>

        <section className="overflow-hidden border-b border-ink/10 bg-lime py-5"><div className="marquee flex w-max gap-10 whitespace-nowrap text-sm font-extrabold uppercase tracking-[.14em]">{[...Array(2)].flatMap((_,i)=>['Verified experts','Upfront pricing','Local professionals','Secure bookings','Real reviews'].map(t=><span className="flex items-center gap-10" key={`${i}-${t}`}>{t}<Sparkles size={16}/></span>))}</div></section>

        <section id="join" className="py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="relative overflow-hidden rounded-[2.5rem] bg-coral px-6 py-14 text-white sm:px-12 lg:px-20 lg:py-20">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border-[45px] border-white/10"/><div className="absolute bottom-[-7rem] right-[18%] h-64 w-64 rounded-full bg-lime/20"/>
            <div className="relative grid items-end gap-10 lg:grid-cols-[1fr_auto]"><div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-white/70">For skilled professionals</p><h2 className="mt-4 max-w-2xl font-display text-5xl leading-none sm:text-6xl">Your next customer is already looking.</h2><p className="mt-6 max-w-xl leading-7 text-white/75">Create your profile, showcase your work and grow your business—without the chase.</p></div><button onClick={()=>setNotice('Provider registration will open when the backend is connected.')} className="flex items-center justify-center gap-3 rounded-full bg-white px-7 py-4 text-sm font-extrabold text-ink transition hover:-translate-y-1">List your service <ArrowRight size={18}/></button></div>
          </div></div>
        </section>
      </main>

      <footer className="border-t border-ink/10 bg-white"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8"><div><div className="flex items-center gap-2 text-lg font-extrabold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-lime"><Home size={18}/></span>findmyneed</div><p className="mt-4 max-w-xs text-sm leading-6 text-ink/50">India’s neighbourhood marketplace for trusted services—at home, on the road and everywhere between.</p></div><FooterCol title="Discover" links={['Home services','Vehicle care','Repairs','Cleaning']}/><FooterCol title="For professionals" links={['Join as a pro','How it works','Partner support','Success guide']}/><FooterCol title="Company" links={['About','Safety','Help centre','Contact']}/></div><div className="border-t border-ink/10"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-xs text-ink/45 sm:flex-row sm:justify-between lg:px-8"><span>© 2026 FindMyNeed. Built for every neighbourhood.</span><span>Privacy · Terms · Accessibility</span></div></div></footer>

      {interestOpen && <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/60 p-4 backdrop-blur-sm" onMouseDown={e=>e.target===e.currentTarget&&setInterestOpen(false)}>
        <div className="w-full max-w-lg rounded-[2rem] bg-cream p-6 shadow-2xl sm:p-8">
          <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-[.18em] text-coral">Early access</p><h2 className="mt-2 font-display text-4xl">I’m interested</h2><p className="mt-3 text-sm leading-6 text-ink/55">Tell us what you need. We’ll save your interest on this device and contact you after the backend goes live.</p></div><button onClick={()=>setInterestOpen(false)} className="rounded-full border border-ink/10 p-2" aria-label="Close"><X size={19}/></button></div>
          <form onSubmit={submitInterest} className="mt-7 space-y-4">
            <label className="block text-sm font-bold">Your name<input required value={lead.name} onChange={e=>setLead({...lead,name:e.target.value})} className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 font-medium outline-none focus:border-leaf" placeholder="Enter your name"/></label>
            <label className="block text-sm font-bold">Mobile number<input required pattern="[0-9+ -]{10,15}" value={lead.phone} onChange={e=>setLead({...lead,phone:e.target.value})} className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 font-medium outline-none focus:border-leaf" placeholder="+91 98765 43210"/></label>
            <label className="block text-sm font-bold">What do you need?<select required value={lead.need} onChange={e=>setLead({...lead,need:e.target.value})} className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 font-medium outline-none focus:border-leaf"><option value="">Choose a service</option>{categories.map(c=><option key={c.name}>{c.name}</option>)}</select></label>
            <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-5 py-4 text-sm font-extrabold text-white hover:bg-leaf">Save my interest <ArrowRight size={17}/></button>
          </form>
        </div>
      </div>}
      {notice && <div className="fixed bottom-5 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-between gap-3 rounded-2xl bg-white px-5 py-4 text-sm font-bold shadow-soft ring-1 ring-ink/10"><span>{notice}</span><button onClick={()=>setNotice('')} aria-label="Close"><X size={18}/></button></div>}
    </div>
  )
}

function FooterCol({title, links}) { return <div><h3 className="text-sm font-extrabold">{title}</h3><div className="mt-4 flex flex-col gap-3 text-sm text-ink/50">{links.map(l=><a href="#" key={l} className="hover:text-leaf">{l}</a>)}</div></div> }

export default App

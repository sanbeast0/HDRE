'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronDown, Droplets, Menu, Play, ShieldCheck, Waves, X } from 'lucide-react'
import { HdreMapScene } from '@/components/hdre-map-scene'

const stats = [
  { value: '5–20', label: 'yr treaty simulation' },
  { value: '30–90', label: 'day deficit warning' },
  { value: '25–40%', label: 'emergency shortfall reduction' },
  { value: '55–70', label: 'LPCD protected baseline' },
]

const stages = [
  { number: '01', title: 'Data Fabric', text: 'A living picture of river flows, reservoirs, rainfall, wards and critical services.', icon: Waves },
  { number: '02', title: 'Macro Diplomacy Engine', text: 'Stress-test treaty ratios across 20 years of uncertainty and competing needs.', icon: ShieldCheck },
  { number: '03', title: 'Micro Resilience Engine', text: 'Translate basin decisions into ward-level supply, risk and rationing plans.', icon: Droplets },
  { number: '04', title: 'Presentation Portal', text: 'Make every decision traceable for tribunals, engineers and the public.', icon: ArrowRight },
]

export function HdreLanding() {
  const [scrollY, setScrollY] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [demoOpen, setDemoOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const sceneStyle = useMemo(() => ({ transform: `scale(${1 + Math.min(scrollY / 2600, 0.12)}) translate3d(0, ${scrollY * 0.055}px, 0)` }), [scrollY])

  return (
    <main className="hdre-shell">
      <section className="hero" id="top">
        <div className="satellite-scene" style={sceneStyle} aria-hidden="true"><HdreMapScene progress={Math.min(scrollY / 1800, 1)} /></div>
        <div className="hero-vignette" />
        <header className="topbar">
          <Link href="#top" className="brand" aria-label="HDRE home"><span className="brand-mark"><Droplets size={17} /></span><span>HDRE</span></Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            <a href="#platform">Platform</a><a href="#pipeline">Methodology</a><a href="#trust">Trust & provenance</a>
          </nav>
          <div className="top-actions"><span className="status-pill"><span className="status-dot" /> System operational</span><Link className="header-cta" href="/simulator">Launch simulator <ArrowRight size={15} /></Link></div>
          <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </header>
        {menuOpen && <div className="mobile-menu"><a href="#platform" onClick={() => setMenuOpen(false)}>Platform</a><a href="#pipeline" onClick={() => setMenuOpen(false)}>Methodology</a><Link href="/simulator">Launch simulator</Link></div>}

        <div className="hero-content">
          <div className="eyebrow"><span className="eyebrow-line" /> CAUVERY BASIN · DECISION SUPPORT</div>
          <h1>From river diplomacy<br /><em>to reliable city water.</em></h1>
          <p className="hero-copy">HDRE connects the decisions made at the basin scale to the water delivered at the ward scale — so every compromise can be understood, tested and trusted.</p>
          <div className="hero-buttons"><Link className="primary-button" href="/simulator">Launch simulator <ArrowRight size={17} /></Link><button className="secondary-button" onClick={() => setDemoOpen(true)}><span className="play-icon"><Play size={12} fill="currentColor" /></span> Watch 60-second demo</button></div>
          <div className="hero-meta"><span><span className="meta-pulse" /> LIVE DIGITAL TWIN</span><span>Last updated 14 min ago</span><span>Model v0.9.4</span></div>
        </div>
        <div className="scroll-cue"><span>Scroll to explore</span><ChevronDown size={16} /></div>
        <div className="coordinates"><span>12°25&apos;N</span><span>76°39&apos;E</span></div>
      </section>

      <section className="stats-strip" aria-label="HDRE capabilities">{stats.map((stat) => <div className="stat" key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</section>

      <section className="story-section" id="platform">
        <div className="section-kicker">THE WATER GOVERNANCE GAP <span>01 / 03</span></div>
        <div className="story-grid"><div><h2>The river does not stop<br />at the city <em>boundary.</em></h2></div><div className="story-body"><p>Today, treaty negotiations and municipal operations live in separate rooms. A basin-wide decision can take weeks to translate into a ward-level action — after the consequences are already visible at the tap.</p><p>HDRE creates a shared operating picture, linking hydrology, diplomacy and the lived reality of a city under pressure.</p><a href="#pipeline" className="text-link">See how it works <ArrowRight size={15} /></a></div></div>
      </section>

      <section className="pipeline-section" id="pipeline"><div className="section-kicker">ONE CONTINUOUS DECISION LOOP <span>02 / 03</span></div><div className="pipeline-heading"><h2>One basin.<br /><em>Four connected layers.</em></h2><p>Built for the people who decide, deliver and depend on water.</p></div><div className="stage-grid">{stages.map((stage) => { const Icon = stage.icon; return <article className="stage-card" key={stage.number}><div className="stage-top"><span>{stage.number}</span><Icon size={20} strokeWidth={1.5} /></div><h3>{stage.title}</h3><p>{stage.text}</p><span className="stage-arrow"><ArrowRight size={16} /></span></article> })}</div></section>

      <section className="trust-section" id="trust"><div className="trust-card"><div className="section-kicker">DESIGNED FOR ACCOUNTABILITY <span>03 / 03</span></div><h2>Decisions you can<br /><em>stand behind.</em></h2><p>Every layer carries its source, assumptions and last-updated time. Every change is logged. Every recommendation can be explained to a tribunal, an engineer or a citizen.</p><div className="trust-points"><span><ShieldCheck size={17} /> Provenance on every metric</span><span><ShieldCheck size={17} /> Exportable audit trail</span><span><ShieldCheck size={17} /> Advisory decision-support only</span></div><Link className="primary-button" href="/simulator">Explore the digital twin <ArrowRight size={17} /></Link></div></section>

      <footer className="footer"><div className="brand"><span className="brand-mark"><Droplets size={17} /></span><span>HDRE</span></div><span>HydroDiplomacy & Resilience Engine</span><span className="footer-right">Cauvery basin · Advisory decision-support only</span></footer>

      {demoOpen && <div className="demo-modal" role="dialog" aria-modal="true" aria-label="HDRE guided demo"><button className="modal-close" onClick={() => setDemoOpen(false)} aria-label="Close demo"><X size={18} /></button><div className="demo-play"><Play size={24} fill="currentColor" /></div><p className="eyebrow">GUIDED DEMO · 60 SECONDS</p><h2>See a treaty decision<br /><em>reach the tap.</em></h2><p>Follow a rainfall shock from the KRS reservoir through the optimal treaty ratio to ward-level action in Bengaluru.</p><button className="primary-button" onClick={() => setDemoOpen(false)}>Start walkthrough <ArrowRight size={17} /></button></div>}
    </main>
  )
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import ScrollSequence from '@/components/ScrollSequence';
import { Mail, ExternalLink, Code, Layers, Shield, Palette, MapPin } from 'lucide-react';
import { GitHubIcon, LinkedInIcon } from '@/components/icons';

// Reusable fade-up animation helpers
const hidden = { opacity: 0, y: 40 };
const visible = (delay = 0) => ({
  opacity: 1,
  y: 0,
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const, delay },
});

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={hidden}
      whileInView={visible(delay)}
      viewport={{ once: true, amount: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  return (
    <main className="bg-black text-white selection:bg-cyan-500/30 font-sans">

      {/* ══════════════════════════════════════════════════════
          CINEMATIC INTRO — 3D Scroll Sequence + Text Overlays
          + Pinned frame 120 hold + Glow + SCROLL DOWN CTA
      ══════════════════════════════════════════════════════ */}
      <ScrollSequence />

      {/* ══════════════════════════════════════════════════════
          DEEP DIVE — Revealed after full animation
      ══════════════════════════════════════════════════════ */}
      <div className="relative z-10 bg-black">
        {/* Gradient bleed from the sequence */}
        <div className="h-24 bg-gradient-to-b from-black to-transparent -mt-24 relative z-10" />

        <div className="tech-grid">
          <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-24 pt-24 pb-64 space-y-64">

            {/* ── IDENTITY ────────────────────────────────────── */}
            <section className="border-b border-white/5 pb-24">
              <Reveal>
                <span className="text-[10px] font-black tracking-[0.5em] uppercase text-cyan-400">Developer Profile</span>
              </Reveal>
              <Reveal delay={0.1} className="mt-6">
                <h1 className="text-5xl md:text-8xl xl:text-9xl font-black tracking-tighter uppercase leading-none">
                  GANGUL <br /><span className="text-white/20">MISSAKA</span>
                </h1>
              </Reveal>
              <Reveal delay={0.2} className="mt-10">
                <p className="max-w-2xl text-xl md:text-2xl text-white/40 font-medium leading-snug border-l-4 border-cyan-500/30 pl-8">
                  Computer Science (Software Engineering) student at{' '}
                  <span className="text-white font-black">Edith Cowan University</span>,
                  building a strong foundation in programming, data structures, systems analysis,
                  databases, networking, and cybersecurity through coursework and hands-on practice.
                </p>
              </Reveal>
            </section>

            {/* ── METHODOLOGY ─────────────────────────────────── */}
            <section className="space-y-20">
              <Reveal>
                <span className="text-[10px] font-black tracking-[0.5em] uppercase text-cyan-400">Approach</span>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-none">
                  HOW I <br /><span className="text-white/20">BUILD</span>
                </h2>
              </Reveal>
              <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-start">
                <Reveal delay={0.15}>
                  <p className="text-2xl text-white/40 font-medium leading-snug border-l-4 border-white/10 pl-8">
                    Every project starts with deep analysis, followed by disciplined architecture,
                    purposeful implementation, and relentless{' '}
                    <span className="text-white font-black">optimization</span>.
                  </p>
                </Reveal>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { step: '01', title: 'Analyze',   desc: 'Requirements & Constraints' },
                    { step: '02', title: 'Design',    desc: 'System Architecture' },
                    { step: '03', title: 'Implement', desc: 'Performant Development' },
                    { step: '04', title: 'Optimize',  desc: 'Refinement & Scaling' },
                  ].map((item, i) => (
                    <Reveal key={item.step} delay={0.1 * i}>
                      <div className="p-8 h-full rounded-3xl border border-white/5 bg-white/[0.02] hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all group space-y-3">
                        <span className="font-mono text-xl font-black text-cyan-500/20 group-hover:text-cyan-400 transition-colors">{item.step}</span>
                        <h4 className="font-black uppercase text-sm tracking-widest">{item.title}</h4>
                        <p className="text-xs text-white/30">{item.desc}</p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>

            {/* ── SKILLS ──────────────────────────────────────── */}
            <section className="space-y-20" id="skills">
              <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-8 border-b border-white/5">
                <Reveal>
                  <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-none">
                    Technical <br /><span className="text-cyan-400 neon-glow">Arsenal</span>
                  </h2>
                </Reveal>
                <Reveal delay={0.1}>
                  <p className="max-w-sm text-sm text-white/30 md:pb-3">
                    Core skills spanning Software Engineering, Databases, Cybersecurity, and Professional Practice.
                  </p>
                </Reveal>
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  {
                    icon: <Code    className="w-7 h-7 text-cyan-400" />,
                    title: 'SOFTWARE ENGINEERING',
                    items: ['Programming', 'OOP', 'Object Oriented Design', 'Data Structures', 'Algorithms', 'Systems Analysis'],
                  },
                  {
                    icon: <Layers  className="w-7 h-7 text-purple-400" />,
                    title: 'DATABASES & DATA',
                    items: ['SQL & Databases', 'Database Design', 'Data Structures', 'Systems Analysis', 'Class Diagrams', 'MS Visio'],
                  },
                  {
                    icon: <Shield  className="w-7 h-7 text-emerald-400" />,
                    title: 'CYBERSECURITY & IT',
                    items: ['Cybersecurity', 'Information Security', 'Networking', 'Operating Systems', 'Technical Support', 'Troubleshooting'],
                  },
                  {
                    icon: <Palette className="w-7 h-7 text-pink-400" />,
                    title: 'PROFESSIONAL SKILLS',
                    items: ['Project Management', 'Project Planning', 'Microsoft Office', 'Team Leadership', 'Teamwork', 'Problem Solving'],
                  },
                ].map((cat, i) => (
                  <Reveal key={cat.title} delay={0.08 * i}>
                    <div className="flex flex-col p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-cyan-500/20 transition-all group h-full">
                      <div className="mb-10 p-4 w-fit rounded-2xl bg-white/5 group-hover:bg-cyan-500/10 transition-colors">
                        {cat.icon}
                      </div>
                      <h3 className="text-sm font-black uppercase tracking-widest mb-8 group-hover:text-cyan-400 transition-colors">{cat.title}</h3>
                      <ul className="space-y-4 flex-grow">
                        {cat.items.map(item => (
                          <li key={item} className="flex items-center gap-3 text-sm text-white/40 group-hover:text-white/70 transition-colors">
                            <span className="h-px w-5 bg-white/10 group-hover:bg-cyan-400 transition-colors flex-none" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Reveal>
                ))}
              </div>
            </section>

            {/* ── EDUCATION & CONTACT ─────────────────────────── */}
            <section className="grid lg:grid-cols-2 gap-24 lg:gap-32" id="contact">

              {/* Education */}
              <div className="space-y-16">
                <Reveal>
                  <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
                    Academic <br /><span className="text-white/20">Legacy</span>
                  </h2>
                </Reveal>
                <div className="space-y-12">
                  {[
                    { school: 'Edith Cowan University',  degree: 'BSc Computer Science (Software Engineering)', tag: 'Current',   highlight: true },
                    { school: 'Royal College Colombo 7', degree: 'Secondary Education',                         tag: 'Alumni' },
                  ].map((edu, i) => (
                    <Reveal key={edu.school} delay={0.1 * i}>
                      <div className="group cursor-default space-y-1 border-l-2 border-white/5 pl-6 hover:border-cyan-500/40 transition-colors">
                        <span className={`text-[10px] font-black uppercase tracking-[0.5em] transition-colors ${edu.highlight ? 'text-cyan-400' : 'text-white/20 group-hover:text-white/50'}`}>
                          {edu.tag}
                        </span>
                        <h4 className="text-xl md:text-2xl font-black uppercase">{edu.school}</h4>
                        <p className="text-sm text-white/30">{edu.degree}</p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-16">
                <Reveal>
                  <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
                    Secure <br /><span className="text-cyan-400 neon-glow">Channel</span>
                  </h2>
                </Reveal>
                <Reveal delay={0.1} className="space-y-4">
                  <a
                    href="mailto:missakabro@gmail.com"
                    className="flex items-center justify-between p-10 rounded-[2.5rem] bg-cyan-500/5 border border-cyan-500/20 hover:bg-cyan-500/10 transition-all group"
                  >
                    <div className="space-y-2">
                      <span className="text-[10px] font-black tracking-widest uppercase text-cyan-400">Direct Email</span>
                      <p className="text-xl md:text-2xl font-black">missakabro@gmail.com</p>
                    </div>
                    <ExternalLink className="w-7 h-7 text-cyan-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform flex-none" />
                  </a>

                  <div className="grid grid-cols-2 gap-4">
                    <a
                      href="https://github.com/gangulmissaka"
                      target="_blank"
                      className="flex flex-col justify-between gap-8 p-10 h-48 rounded-[2.5rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all group"
                    >
                      <GitHubIcon className="w-10 h-10 text-white/20 group-hover:text-white transition-colors" />
                      <span className="text-sm font-black uppercase tracking-widest">GitHub</span>
                    </a>
                    <a
                      href="https://www.linkedin.com/in/missaka-hinguralaarachchi-4b12a1396/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col justify-between gap-8 p-10 h-48 rounded-[2.5rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all group"
                    >
                      <LinkedInIcon className="w-10 h-10 text-white/20 group-hover:text-blue-400 transition-colors" />
                      <span className="text-sm font-black uppercase tracking-widest">LinkedIn</span>
                    </a>
                  </div>

                  <div className="flex items-center gap-3 pt-4 text-white/20">
                    <MapPin className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.5em]">Colombo, Sri Lanka</span>
                  </div>
                </Reveal>
              </div>
            </section>
          </div>

          {/* Footer */}
          <footer className="border-t border-white/5 py-20 text-center">
            <Reveal>
              <p className="text-[10px] font-black uppercase tracking-[1em] text-white/10">
                Gangul Missaka Hinguralaarachchi © 2026
              </p>
            </Reveal>
          </footer>
        </div>
      </div>
    </main>
  );
}

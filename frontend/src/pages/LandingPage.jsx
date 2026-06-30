import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  RiArrowRightLine, RiCheckLine, RiTeamLine, RiCalendarLine,
  RiTaskLine, RiMessage2Line, RiBarChartLine, RiShieldLine,
  RiMenuLine, RiCloseLine, RiArrowDownSLine, RiPlayLine,
  RiBuildingLine, RiUserLine, RiUserStarLine, RiGlobalLine,
} from 'react-icons/ri'

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }
const stagger = { show: { transition: { staggerChildren: 0.1 } } }
const currentUser = JSON.parse(
  localStorage.getItem("user")
);
function NavBar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F7F8FA]">
      <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">        
       <div className="flex items-center gap-3">
          <img
            src="/shnoor-logo.png"
            alt="SHNOOR Logo"
            className="w-12 h-12 object-contain rounded-lg"
          />

          <div>
            <h3 className="font-bold text-[#163F68] text-lg">
              SHNOOR WorkSpace
            </h3>

            <p className="text-xs text-slate-600">
              Enterprise Platform
            </p>
          </div>
        </div> 
        <div className="hidden md:flex items-center bg-[#163F68] rounded-full px-8 py-4 gap-10">
          <a href="#ho" className="text-white text-sm hover:text-[#C99232] transition">
            Home
          </a>
          <a href="#features" className="text-white text-sm hover:text-[#C99232] transition">
            Features
          </a>
          <a href="#ro" className="text-white text-sm hover:text-[#C99232] transition">
            Roles
          </a>
          <a href="#fa" className="text-white text-sm hover:text-[#C99232] transition">
            FAQ'S
          </a>
          <a href="#contact" className="text-white text-sm hover:text-[#C99232] transition">
            Contact
          </a>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/login"
            className="text-[#163F68] font-medium"
          >
            Log In
          </Link>
          <Link
            to="/register-company"
            className="px-6 py-3 rounded-lg bg-[#163F68] text-white font-semibold hover:bg-[#102D49] transition hover:text-[#C99232] transition"
          >
            Get Started
          </Link>
        </div>
        <button
          className="md:hidden text-[#163F68]"
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <RiCloseLine size={24} />
          ) : (
            <RiMenuLine size={24} />
          )}
        </button>
      </div>
    </nav>
  )
}
function HeroSection() {
  return (
    <section id="ho" className="pt-32 pb-20 px-4 bg-gradient-to-b from-blue-50/60 to-white relative overflow-hidden">
      
      <div className="max-w-4xl mx-auto text-center relative">         
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
          className="text-5xl sm:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight"
        >
          One workspace for<br />
          <span className="text-gradient">every team, every role</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-6 text-lg text-muted max-w-2xl mx-auto leading-relaxed"
        >
          WorkSpace brings your people, projects, and conversations into one intelligent platform. Built for enterprise teams that move fast and manage complexity.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link to="/" className="btn-primary text-base px-7 py-3 shadow-lg shadow-blue-200 hover:text-[#C99232] transition">
            Start free trial <RiArrowRightLine size={16} />
          </Link>
          <button className="btn-outline text-base px-7 py-3 gap-2">
            <RiPlayLine size={16} className="text-blue-900" /> Watch demo
          </button>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="mt-5 text-xs text-muted"
        >
          No credit card required · 14-day free trial · Cancel anytime
        </motion.p>
      </div>
    </section>
  )
}

function StatsSection() {
  const items = [
    { value: '142+', label: 'Enterprise companies' },
    { value: '8,400+', label: 'Active users' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '18.4%', label: 'Avg. monthly growth' },
  ]
  return (
    <section className="py-14 border-y border-slate-100 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {items.map((item, i) => (
            <motion.div
              key={i} className="text-center"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            >
              <p className="text-3xl font-extrabold text-gradient">{item.value}</p>
              <p className="text-sm text-muted mt-1">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  const features = [
    { icon: RiTeamLine, title: 'User Management', desc: 'Manage roles, permissions, and teams across your entire organization with precision.' },
    { icon: RiCalendarLine, title: 'Smart Scheduling', desc: 'AI-powered meeting scheduling that respects everyones time and avoids conflicts.' },
    { icon: RiTaskLine, title: 'Task Tracking', desc: 'Assign, track, and complete work with rich priority labels, deadlines, and status flows.' },
    { icon: RiMessage2Line, title: 'Team Chat', desc: 'Channels, groups, threads, and emoji reactions — communication built for modern teams.' },
    { icon: RiBarChartLine, title: 'Revenue Analytics', desc: 'Real-time dashboards for revenue, growth, and usage across all your tenants.' },
    { icon: RiShieldLine, title: 'Enterprise Security', desc: 'SSO, SCIM provisioning, audit logs, and SOC 2 compliance out of the box.' },
  ]
  return (
    <section id="features" className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-bold text-blue-900 uppercase tracking-widest mb-3">Platform Features</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Built for how teams actually work</h2>
          <p className="mt-4 text-muted text-base max-w-xl mx-auto">Everything you need to run a modern workforce — no stitching together twelve tools.</p>
        </div>
        <motion.div
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((f, i) => (
            <motion.div
              key={i} variants={fadeUp}
              className="group card card-hover p-6 cursor-default"
            >
              <div className="w-11 h-11 bg-[rgb(250,250,250)] group-hover:bg-secondary rounded-xl flex items-center justify-center mb-4 transition-colors duration-200">
                <f.icon size={20} className="text-blue-900 group-hover:text-white transition-colors duration-200" />
              </div>
              <h3 className="font-bold text-slate-800 mb-2">{f.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function RolesSection() {
  const roles = [
    {
      icon: RiUserStarLine,
      title: 'Software Owner',
      subtitle: 'Super Admin',
      desc: 'Full visibility across all tenants, companies, and revenue streams.',
      perks: ['Company management', 'Revenue analytics', 'Global user overview', 'Platform settings'],
      color: 'bg-purple-50 text-purple-600',
    },
    {
      icon: RiBuildingLine,
      title: 'Company Manager',
      subtitle: 'Org Admin',
      desc: 'Manage your team, schedule work, and keep projects on track.',
      perks: ['Bulk user upload', 'Meeting scheduling', 'Task assignment', 'Team management'],
      color: 'bg-blue-50 text-blue-900',
      highlight: true,
    },
    {
      icon: RiUserLine,
      title: 'Employee',
      subtitle: 'Team Member',
      desc: 'Focus on what matters: your tasks, meetings, and team chat.',
      perks: ['Team chat & groups', 'Task tracking', 'Meeting access', 'Personal calendar'],
      color: 'bg-emerald-50 text-emerald-600',
    },
  ]
  return (
    <section id="ro" className="py-20 px-4 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-3">Role-Based Access</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">The right view for every role</h2>
          <p className="mt-4 text-muted max-w-xl mx-auto">WorkSpace adapts to who's using it — owners, managers, and employees each see what matters to them.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              className={`card p-7 ${r.highlight ? 'border-secondary/30 shadow-card-hover ring-1 ring-secondary/20' : ''}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${r.color}`}>
                <r.icon size={24} />
              </div>
              <p className="text-xs font-bold text-muted uppercase tracking-wider">{r.subtitle}</p>
              <h3 className="text-lg font-bold text-slate-800 mt-1 mb-2">{r.title}</h3>
              <p className="text-sm text-muted mb-5">{r.desc}</p>
              <ul className="space-y-2">
                {r.perks.map((p, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-slate-700">
                    <RiCheckLine size={15} className="text-emerald-500 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FAQSection() {
  const [open, setOpen] = useState(null)
  const faqs = [
    { q: 'How does multi-tenancy work?', a: 'Each company gets its own isolated workspace with separate data, users, and settings. The Software Owner manages all tenants from a unified admin dashboard.' },
    { q: 'Can I migrate existing users in bulk?', a: 'Yes. Company Managers can upload users via CSV with role assignments. The system validates each row and reports any errors before import.' },
    { q: 'What authentication options do you support?', a: 'WorkSpace supports email/password, Google SSO, Microsoft SSO, and SAML 2.0 for enterprise customers. SCIM provisioning is also available.' },
    { q: 'Is there a free trial?', a: 'Yes — all plans include a 14-day free trial with no credit card required. Teams up to 10 people can stay free indefinitely on the Starter plan.' },
    { q: 'How is billing handled for growing teams?', a: 'Billing scales per seat, per month. You can upgrade, downgrade, or cancel any time. Enterprise plans are invoiced annually with custom terms.' },
  ]
  return (
    <section id="fa" className="py-20 px-4 bg-white">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Frequently asked questions</h2>
          <p className="mt-3 text-muted">Can't find the answer? <a href="#" className="text-secondary font-medium hover:underline">Talk to us →</a></p>
        </div>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="card overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="font-semibold text-slate-800 text-sm">{faq.q}</span>
                <RiArrowDownSLine size={18} className={`text-slate-400 transition-transform shrink-0 ml-3 ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  className="px-5 pb-4"
                >
                  <p className="text-sm text-muted leading-relaxed">{faq.a}</p>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer id="contact" className="bg-slate-900 text-slate-400 py-14 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-gradient-primary rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xs">W</span>
              </div>
              <span className="font-bold text-white text-sm">WorkSpace</span>
            </div>
            <p className="text-xs leading-relaxed">Enterprise collaboration, simplified. Built for teams that scale.</p>
          </div>
          {[
            { title: 'Product', links: ['Features', 'Roles', 'FAQ', 'Contact'] },
            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
            { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Cookies'] },
          ].map(col => (
            <div key={col.title}>
              <p className="text-white font-semibold text-sm mb-3">{col.title}</p>
              {col.links.map(link => (
                <a key={link} href="#" className="block text-xs text-slate-400 hover:text-white transition-colors mb-2">{link}</a>
              ))}
            </div>
          ))}
        </div>
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs">© 2026 WorkSpace, Inc. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <RiGlobalLine size={13} />
            <span className="text-xs">English (US)</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
  <div className="min-h-screen">

    <NavBar />

    <main>

      <HeroSection />

      <StatsSection />

      <FeaturesSection />

      <RolesSection />

      <FAQSection />

    </main>

    <Footer />

  </div>
)
}
import Link from "next/link";
import Modern3dBible from "@/components/Modern3dBible";
import {
  BookOpen,
  Search,
  Monitor,
  Lightbulb,
  Globe,
  Smartphone,
  Mic,
  Layout,
  Database,
  Twitter,
  Github,
  Instagram,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
              <BookOpen size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Smart Preach
            </h1>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
            <Link href="#" className="hover:text-indigo-600 transition-colors">Home</Link>
            <Link href="#" className="hover:text-indigo-600 transition-colors">Scripture</Link>
            <Link href="#" className="hover:text-indigo-600 transition-colors">Teachings</Link>
            <Link href="#" className="hover:text-indigo-600 transition-colors">Community</Link>
            <Link href="#" className="hover:text-indigo-600 transition-colors">About</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-slate-700 hover:text-indigo-600 px-4 py-2 text-sm font-medium transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-slate-900/10 transition-all hover:scale-105 active:scale-95"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 z-0 opacity-40 [mask-image:linear-gradient(to_bottom,white,transparent,transparent)]">
          <div 
            className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
          ></div>
        </div>
        
        {/* Gradient Blooms */}
        <div className="absolute top-0 right-0 -z-10 w-[800px] h-[800px] bg-indigo-100/50 rounded-full blur-3xl opacity-60 mix-blend-multiply filter"></div>

        <div className="container mx-auto px-6 py-24 lg:py-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          {/* Text */}
          <div>
            
            <h2 className="text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-8 text-slate-900">
              Bringing the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Word</span> to Life
            </h2>
            <p className="text-lg text-slate-600 max-w-xl mb-10 leading-relaxed">
              A modern preaching companion that brings Scripture, clarity, and
              divine focus into every service — simple, powerful, and faithful.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/login"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-2 group"
              >
                Get Started <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="bg-white border border-slate-200 hover:border-indigo-200 hover:bg-slate-50 text-slate-700 px-8 py-3.5 rounded-xl font-medium transition-all hover:-translate-y-1 active:scale-95"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* 3D Bible Container - Rendered Once */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] flex items-center justify-center transform hover:scale-[1.02] transition-transform duration-500">
              <div className="absolute inset-0  from-transparent via-transparent rounded-[2.5rem] pointer-events-none"></div>
              {/* Bible Component */}
              <Modern3dBible />
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="container mx-auto px-6 py-24">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h3 className="text-4xl font-bold tracking-tight mb-4 text-slate-900">
            Designed for Modern Ministry
          </h3>
          <p className="text-slate-500 text-lg">
            Powerful tools engineered for clarity and focus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Live Verse Search",
              desc: "Instantly find Bible verses by keyword or reference.",
              icon: Search
            },
            {
              title: "Verse Display Screen",
              desc: "Large, elegant verse presentation for services.",
              icon: Monitor
            },
            {
              title: "Suggestion Panel",
              desc: "Quick access to recent, favorite, and suggested verses.",
              icon: Lightbulb
            },
            {
              title: "Bible API Integration",
              desc: "Powered by reliable KJV scripture sources.",
              icon: Globe
            },
            {
              title: "Responsive Design",
              desc: "Perfect on desktop, tablet, and mobile.",
              icon: Smartphone
            },
            {
              title: "Voice Recognition",
              desc: "Hands-free verse searching during preaching.",
              icon: Mic
            },
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-100 transition-all duration-300 hover:-translate-y-1 flex flex-col items-start"
              >
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                  <Icon size={24} />
                </div>
                <h4 className="text-xl font-bold mb-3 text-slate-900">
                  {feature.title}
                </h4>
                <p className="text-slate-500 leading-relaxed flex-grow">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= TECH STACK ================= */}
      <section className="bg-slate-900 py-20 relative overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="container mx-auto px-6 relative z-10">
          <h3 className="text-4xl font-bold text-center mb-16 text-white">
            Built on a Strong Foundation
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
              <h4 className="text-xl font-bold mb-6 text-indigo-400 flex items-center gap-3">
                <Layout size={24} /> Frontend
              </h4>
              <ul className="space-y-4 text-slate-300">
                <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-indigo-500"/> Next.js (App Router)</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-indigo-500"/> Tailwind CSS</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-indigo-500"/> TypeScript</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-indigo-500"/> lucide-react</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-indigo-500"/> Web Speech API</li>
              </ul>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
              <h4 className="text-xl font-bold mb-6 text-violet-400 flex items-center gap-3">
                <Database size={24} /> Backend
              </h4>
              <ul className="space-y-4 text-slate-300">
                <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-violet-500"/> Turso (SQLite + libSQL)</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-violet-500"/> Server Actions</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="container mx-auto px-6 py-24 text-center">
        <div className="bg-white rounded-3xl p-12 lg:p-20 border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
          <h3 className="text-4xl font-bold mb-6 text-slate-900 tracking-tight">
            Begin Your Ministry Journey
          </h3>
          <p className="text-slate-500 mb-10 max-w-xl mx-auto text-lg">
            Empower your preaching with clarity, faith, and modern technology.
          </p>
          <div className="flex justify-center gap-6 flex-wrap">
            <Link
              href="/login"
              className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-4 rounded-xl font-semibold shadow-lg shadow-slate-900/10 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-2"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-white border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 text-slate-900 px-10 py-4 rounded-xl font-semibold shadow-sm transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-2"
            >
              Register
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col items-center gap-8">
            <div className="flex items-center gap-2 text-slate-900">
              <BookOpen size={20} className="text-indigo-600" />
              <span className="font-bold text-lg">Smart Preach</span>
            </div>
            
            <p className="text-slate-600 font-medium text-lg max-w-md text-center">
              “Your word is a lamp to my feet and a light to my path.” — Psalm 119:105
            </p>
            
            <div className="flex gap-6">
              <Link href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">
                <Twitter size={20} />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">
                <Github size={20} />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">
                <Instagram size={20} />
              </Link>
            </div>
            
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} Smart Preach. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

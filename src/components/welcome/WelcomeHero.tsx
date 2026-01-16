import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Modern3dBible from "@/components/Modern3dBible";

export default function WelcomeHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 z-0 opacity-40 [mask-image:linear-gradient(to_bottom,white,transparent,transparent)]">
        <div 
          className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
        ></div>
      </div>
      
      {/* Gradient Blooms */}
      <div className="absolute top-0 right-0 -z-10 w-[800px] h-[800px] bg-indigo-100/50 rounded-full blur-3xl opacity-60 mix-blend-multiply filter"></div>

      <div className="container mx-auto px-6 py-1 lg:py-7 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
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
  );
}
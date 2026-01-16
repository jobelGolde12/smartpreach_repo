import { Layout, Database, CheckCircle2 } from "lucide-react";

export default function WelcomeTechStack() {
  return (
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
  );
}
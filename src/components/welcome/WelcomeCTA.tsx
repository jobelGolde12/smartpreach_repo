import Link from "next/link";

export default function WelcomeCTA() {
  return (
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
  );
}
import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function WelcomeHeader() {
  return (
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
          <Link href="/about" className="hover:text-indigo-600 transition-colors">About</Link>
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
  );
}
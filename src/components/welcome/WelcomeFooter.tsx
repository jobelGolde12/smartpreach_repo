import Link from "next/link";
import { BookOpen, Twitter, Github, Instagram } from "lucide-react";

export default function WelcomeFooter() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200">
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col items-center gap-8">
          <div className="flex items-center gap-2 text-slate-900">
            <BookOpen size={20} className="text-indigo-600" />
            <span className="font-bold text-lg">Smart Preach</span>
          </div>
          
          <p className="text-slate-600 font-medium text-lg max-w-md text-center">
            "Your word is a lamp to my feet and a light to my path." — Psalm 119:105
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
  );
}
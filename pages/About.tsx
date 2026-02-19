
import React from 'react';

interface AboutProps {
  onBack: () => void;
}

const About: React.FC<AboutProps> = ({ onBack }) => {
  return (
    <div className="h-full flex flex-col bg-white dark:bg-background-dark animate-in slide-in-from-right duration-300 overflow-y-auto">
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-4 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
        <button onClick={onBack} className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-semibold tracking-tight">About</h1>
        <div className="size-10"></div>
      </header>

      <main className="flex-1 px-6 pt-8 pb-12">
        <section className="flex flex-col items-center mb-10">
          <div className="size-24 mb-6 rounded-3xl bg-primary/10 flex items-center justify-center p-4">
            <span className="material-symbols-outlined text-primary text-6xl fill-1">memory</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">ThinkBack</h2>
          <span className="mt-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">v2.4.0</span>
          <p className="text-primary font-bold text-[10px] uppercase tracking-[0.2em] mt-2">AI Memory Assistant</p>
        </section>

        <section className="mb-10 text-center">
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">
            ThinkBack is your personal AI memory companion, designed to help you capture, organize, and recall every important thought effortlessly.
          </p>
        </section>

        <section className="space-y-2">
          <a href="#" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all group">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">language</span>
              <span className="font-medium">Website</span>
            </div>
            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">chevron_right</span>
          </a>
          <a href="#" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all group">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">support_agent</span>
              <span className="font-medium">Support</span>
            </div>
            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">chevron_right</span>
          </a>
          <a href="#" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all group">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">brand_awareness</span>
              <span className="font-medium">Follow us on X</span>
            </div>
            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">chevron_right</span>
          </a>
          <a href="#" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all group">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">star</span>
              <span className="font-medium">Rate the app</span>
            </div>
            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">chevron_right</span>
          </a>
        </section>
      </main>

      <footer className="p-8 text-center border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50">
        <p className="font-medium mb-1">Made with care for your memory.</p>
        <p className="text-slate-500 text-xs tracking-wide">© 2024 ThinkBack AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default About;

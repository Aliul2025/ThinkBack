
import React, { useState } from 'react';
import { Settings, Note } from '../types';

interface PrivacyProps {
  onBack: () => void;
  settings: Settings;
  notes: Note[];
  onUpdate: (s: Settings) => void;
  onReset: () => void;
}

const Privacy: React.FC<PrivacyProps> = ({ onBack, settings, notes, onUpdate, onReset }) => {
  const [exporting, setExporting] = useState(false);

  const handleExportData = () => {
    setExporting(true);
    setTimeout(() => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notes, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `thinkback_memories_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      setExporting(false);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-background-dark animate-in slide-in-from-right duration-300 overflow-y-auto">
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-4 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10">
        <button onClick={onBack} className="flex items-center justify-center size-10 rounded-full hover:bg-primary/10 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold tracking-tight">Privacy</h1>
        <div className="size-10"></div>
      </header>

      <main className="flex-1 px-6 py-8 space-y-10">
        <section className="space-y-4">
          <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-3xl border border-primary/10">
            <h2 className="text-xl font-bold mb-3">Data Privacy Overview</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
              At ThinkBack, your memories are yours alone. We build with a privacy-first mindset to ensure your data stays secure, private, and under your absolute control.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80 px-1">Key Protections</h3>
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-2">
              <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">lock</span>
              </div>
              <div>
                <p className="font-bold text-base">Notes are encrypted</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Only you hold the keys to unlock your memories.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-2">
              <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">memory</span>
              </div>
              <div>
                <p className="font-bold text-base">AI processing is local-first</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Intelligence happens on your device, not the cloud.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-2">
              <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">verified_user</span>
              </div>
              <div>
                <p className="font-bold text-base">We never sell your data</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Your privacy is not a commodity. We don't share with third parties.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80 px-1">Management</h3>
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
            <button 
              onClick={handleExportData}
              disabled={exporting}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800 disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-slate-400 ${exporting ? 'animate-spin' : ''}`}>
                  {exporting ? 'sync' : 'download'}
                </span>
                <span className="font-bold text-sm">{exporting ? 'Exporting...' : 'Export My Data'}</span>
              </div>
              {!exporting && <span className="material-symbols-outlined text-slate-300">chevron_right</span>}
            </button>
            <button 
              onClick={onReset}
              className="w-full flex items-center justify-between p-5 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-red-500">delete_forever</span>
                <span className="font-bold text-sm text-red-600">Delete all local data</span>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </button>
          </div>
        </section>

        <section className="pt-8 pb-12 flex flex-col items-center gap-4">
          <button className="text-sm font-bold text-primary hover:underline">Full Privacy Policy</button>
          <div className="size-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
          <button className="text-sm font-bold text-primary hover:underline">Terms of Service</button>
          <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">ThinkBack v2.4.0</p>
        </section>
      </main>
    </div>
  );
};

export default Privacy;

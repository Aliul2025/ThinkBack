
import React, { useState, useEffect } from 'react';
import { Settings } from '../types';
import { isQuietHoursActive } from '../geminiService';

interface QuietHoursProps {
  settings: Settings;
  onUpdate: (s: Settings) => void;
  onBack: () => void;
}

const QuietHours: React.FC<QuietHoursProps> = ({ settings, onUpdate, onBack }) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const checkStatus = () => setIsActive(isQuietHoursActive(settings));
    checkStatus();
    const interval = setInterval(checkStatus, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [settings]);

  const toggle = (key: keyof Settings) => {
    onUpdate({ ...settings, [key]: !settings[key] });
  };

  const handleTimeChange = (key: 'quietHoursStart' | 'quietHoursEnd', val: string) => {
    onUpdate({ ...settings, [key]: val });
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-background-dark animate-in slide-in-from-right duration-300">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 h-16 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold tracking-tight">Quiet Hours</h1>
        <div className="size-10"></div>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto px-6 py-8 overflow-y-auto pb-32">
        <section className="mb-8">
          <div className={`p-6 rounded-[32px] border-2 transition-all duration-500 ${isActive ? 'bg-accent-blue/10 border-accent-blue shadow-lg shadow-accent-blue/5' : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isActive ? 'text-accent-blue' : 'text-slate-400'}`}>Current Status</span>
              {isActive && <div className="size-2 rounded-full bg-accent-blue animate-ping" />}
            </div>
            <div className="flex items-center gap-4">
              <div className={`size-12 rounded-2xl flex items-center justify-center transition-colors ${isActive ? 'bg-accent-blue text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                <span className="material-symbols-outlined text-2xl fill-1">{isActive ? 'dark_mode' : 'wb_sunny'}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">{isActive ? 'Quiet Mode Active' : 'Normal Mode Active'}</h2>
                <p className="text-xs text-slate-500 italic">
                  {isActive 
                    ? `Silence is active until ${settings.quietHoursEnd}` 
                    : settings.quietHoursEnabled 
                      ? `Quiet starts at ${settings.quietHoursStart}` 
                      : 'Scheduled silence is off'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-between mb-8 px-2">
          <div className="flex flex-col">
            <span className="text-base font-bold">Enabled Scheduled Silence</span>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Automate Quiet Mode</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={settings.quietHoursEnabled} onChange={() => toggle('quietHoursEnabled')} className="sr-only peer" />
            <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-accent-blue"></div>
          </label>
        </section>

        <section className="bg-slate-50 dark:bg-slate-900 rounded-[32px] shadow-inner border border-slate-100 dark:border-slate-800 overflow-hidden mb-8 transition-opacity duration-300" style={{ opacity: settings.quietHoursEnabled ? 1 : 0.5 }}>
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 group">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start time</span>
              <input 
                type="time" 
                disabled={!settings.quietHoursEnabled}
                value={settings.quietHoursStart} 
                onChange={(e) => handleTimeChange('quietHoursStart', e.target.value)}
                className="bg-transparent border-none p-0 text-2xl font-bold focus:ring-0 mt-1 cursor-pointer"
              />
            </div>
            <div className={`size-12 rounded-2xl flex items-center justify-center transition-colors ${settings.quietHoursEnabled ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-300'}`}>
              <span className="material-symbols-outlined">bedtime</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-6 group">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End time</span>
              <input 
                type="time" 
                disabled={!settings.quietHoursEnabled}
                value={settings.quietHoursEnd} 
                onChange={(e) => handleTimeChange('quietHoursEnd', e.target.value)}
                className="bg-transparent border-none p-0 text-2xl font-bold focus:ring-0 mt-1 cursor-pointer"
              />
            </div>
            <div className={`size-12 rounded-2xl flex items-center justify-center transition-colors ${settings.quietHoursEnabled ? 'bg-accent-blue/10 text-accent-blue' : 'bg-slate-200 text-slate-300'}`}>
              <span className="material-symbols-outlined">wb_twilight</span>
            </div>
          </div>
        </section>

        <div className="flex items-start gap-4 p-5 rounded-3xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <span className="material-symbols-outlined text-slate-400 text-xl mt-0.5">notifications_off</span>
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Quiet Promise</p>
            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 italic">
              When active, {settings.assistantName} will suppress all voice interactions and audio alerts unless manually overridden. Note: This does not affect system alarms.
            </p>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 z-50">
        <button onClick={onBack} className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 active:scale-[0.98] transition-all">
          Done
        </button>
      </footer>
    </div>
  );
};

export default QuietHours;

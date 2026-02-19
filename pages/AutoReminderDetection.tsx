
import React, { useState } from 'react';
import { Settings } from '../types';
import { detectReminders } from '../geminiService';

interface AutoReminderDetectionProps {
  settings: Settings;
  onUpdate: (s: Settings) => void;
  onBack: () => void;
}

const AutoReminderDetection: React.FC<AutoReminderDetectionProps> = ({ settings, onUpdate, onBack }) => {
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<{ hasReminder?: boolean; suggestedTime?: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const toggle = (key: keyof Settings) => {
    onUpdate({ ...settings, [key]: !settings[key] });
  };

  const handleTestDetection = async () => {
    if (!testInput.trim()) return;
    setIsTesting(true);
    setTestResult(null);
    const result = await detectReminders(testInput);
    setTestResult(result);
    setIsTesting(false);
  };

  const sensitivities: Settings['reminderSensitivity'][] = ['Basic', 'Smart', 'Deep'];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-background-dark animate-in slide-in-from-right duration-300">
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 h-16 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <button onClick={onBack} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold tracking-tight">AI Reminder Detection</h1>
        <div className="size-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-8 space-y-10 pb-32">
        <section className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex flex-col">
              <span className="font-bold text-base">Live Detection</span>
              <p className="text-xs text-slate-400 italic">Extract tasks from your sentences.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.autoDetectReminders} onChange={() => toggle('autoDetectReminders')} className="sr-only peer" />
              <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">tune</span> Intelligence Level
          </h3>
          <div className="space-y-3">
            {sensitivities.map(s => (
              <label 
                key={s} 
                className={`flex items-center justify-between p-5 border-2 rounded-2xl cursor-pointer transition-all ${
                  settings.reminderSensitivity === s ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`font-bold text-sm ${settings.reminderSensitivity === s ? 'text-primary' : ''}`}>{s} Engine</span>
                  {s === 'Smart' && <span className="bg-primary/10 text-primary text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">Recommended</span>}
                </div>
                <input 
                  type="radio" 
                  name="sensitivity"
                  checked={settings.reminderSensitivity === s} 
                  onChange={() => onUpdate({ ...settings, reminderSensitivity: s })}
                  className="w-5 h-5 appearance-none rounded-full border-2 border-slate-200 checked:bg-primary checked:border-primary transition-all" 
                />
              </label>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-1">Live Sandbox</h3>
          <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="relative">
              <input 
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Try: 'Call me tomorrow at 5pm'"
                className="w-full h-14 pl-5 pr-14 bg-white dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/40 text-sm"
              />
              <button 
                onClick={handleTestDetection}
                disabled={isTesting || !testInput.trim()}
                className="absolute right-2 top-2 size-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                <span className={`material-symbols-outlined text-xl ${isTesting ? 'animate-spin' : ''}`}>
                  {isTesting ? 'sync' : 'auto_awesome'}
                </span>
              </button>
            </div>

            {testResult && (
              <div className="animate-in fade-in slide-in-from-top-2 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`size-8 rounded-lg flex items-center justify-center ${testResult.hasReminder ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                    <span className="material-symbols-outlined text-sm">{testResult.hasReminder ? 'notifications_active' : 'notifications_off'}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Result</span>
                </div>
                {testResult.hasReminder ? (
                  <p className="text-sm">Found reminder for: <span className="font-bold text-primary">{testResult.suggestedTime}</span></p>
                ) : (
                  <p className="text-sm text-slate-400 italic">No time-based reminder detected.</p>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-800">
        <button onClick={onBack} className="w-full h-16 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/30 active:scale-[0.98] transition-all">
          Save Behavior Settings
        </button>
      </footer>
    </div>
  );
};

export default AutoReminderDetection;

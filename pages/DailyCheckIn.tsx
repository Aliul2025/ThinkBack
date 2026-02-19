
import React, { useState, useEffect } from 'react';
import { Settings } from '../types';
import { testVoiceOutput, getVoiceName, generateLocalizedPhrase } from '../geminiService';

interface DailyCheckInProps {
  settings: Settings;
  onUpdate: (s: Settings) => void;
  onBack: () => void;
}

const DailyCheckIn: React.FC<DailyCheckInProps> = ({ settings, onUpdate, onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLocalizing, setIsLocalizing] = useState(false);

  const langKey = settings.language.split(' — ')[0];
  const greetingKey = `greeting_${langKey}`;
  const currentGreeting = settings.voiceStylePresets[greetingKey] || `Hello, it is time for your daily review. Ready?`;

  useEffect(() => {
    const warmup = async () => {
      if (!settings.voiceStylePresets[greetingKey]) {
        setIsLocalizing(true);
        const localized = await generateLocalizedPhrase(`Hello, it is time for your daily review. Ready?`, settings.language);
        onUpdate({
          ...settings,
          voiceStylePresets: { ...settings.voiceStylePresets, [greetingKey]: localized }
        });
        setIsLocalizing(false);
      }
    };
    warmup();
  }, [settings.language]);

  const toggle = (key: keyof Settings) => {
    onUpdate({ ...settings, [key]: !settings[key] });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...settings, dailyCheckInTime: e.target.value });
  };

  const handlePreviewVoice = async () => {
    setIsPlaying(true);
    const voiceName = getVoiceName(settings);
    await testVoiceOutput(currentGreeting, voiceName, settings.voiceVolume, settings.voiceSpeed);
    setIsPlaying(false);
  };

  const handleGreetingEdit = (text: string) => {
    onUpdate({
      ...settings,
      voiceStylePresets: { ...settings.voiceStylePresets, [greetingKey]: text }
    });
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-background-dark animate-in slide-in-from-right duration-300">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 h-16 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold tracking-tight">Daily Check-in</h1>
        <div className="size-10 flex items-center justify-center">
          {isLocalizing && <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-6 pb-32">
        <section className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-base font-bold">Automatic Review</span>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Summary of your day</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.dailyCheckIn} onChange={() => toggle('dailyCheckIn')} className="sr-only peer" />
              <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800 w-full"></div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">Scheduled Time</span>
            <div className="flex items-center gap-2">
              <input type="time" value={settings.dailyCheckInTime} onChange={handleTimeChange} className="bg-transparent border-none p-0 text-primary font-bold focus:ring-0 text-right text-lg" />
              <span className="material-symbols-outlined text-slate-300 text-lg">schedule</span>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assistant Greeting</h3>
            <button onClick={handlePreviewVoice} disabled={isPlaying} className="text-primary text-[10px] font-bold uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">{isPlaying ? 'graphic_eq' : 'play_circle'}</span> Listen
            </button>
          </div>
          <div className="relative p-6 rounded-[32px] bg-primary/5 border border-primary/10 overflow-hidden group">
            <textarea 
              value={currentGreeting}
              onChange={(e) => handleGreetingEdit(e.target.value)}
              className="w-full bg-transparent border-none p-0 focus:ring-0 text-lg leading-relaxed italic text-slate-700 dark:text-slate-200 font-medium resize-none"
              rows={3}
              placeholder="Localized greeting..."
            />
            <div className="absolute bottom-4 right-6 opacity-20">
              <span className="material-symbols-outlined text-xl">edit_square</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md">
        <button onClick={onBack} className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all">
          Apply Preferences
        </button>
      </footer>
    </div>
  );
};

export default DailyCheckIn;

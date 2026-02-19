
import React, { useState, useEffect } from 'react';
import { Settings } from '../types';
import { testVoiceOutput, getVoiceName, generateLocalizedPhrase } from '../geminiService';

interface IdeaRevivalProps {
  settings: Settings;
  onUpdate: (s: Settings) => void;
  onBack: () => void;
}

const IdeaRevival: React.FC<IdeaRevivalProps> = ({ settings, onUpdate, onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLocalizing, setIsLocalizing] = useState(false);

  const langKey = settings.language.split(' — ')[0];
  const nudgeKey = `nudge_${langKey}`;
  const currentNudge = settings.voiceStylePresets[nudgeKey] || `Boss, you noted "Project Alpha" a while ago... give it 5 minutes?`;

  useEffect(() => {
    const warmup = async () => {
      if (!settings.voiceStylePresets[nudgeKey]) {
        setIsLocalizing(true);
        const localized = await generateLocalizedPhrase(`Boss, you noted "Project Alpha" a while ago... give it 5 minutes?`, settings.language);
        onUpdate({
          ...settings,
          voiceStylePresets: { ...settings.voiceStylePresets, [nudgeKey]: localized }
        });
        setIsLocalizing(false);
      }
    };
    warmup();
  }, [settings.language]);

  const toggle = (key: keyof Settings) => {
    onUpdate({ ...settings, [key]: !settings[key] });
  };

  const frequencies: Settings['ideaRevivalFrequency'][] = ['Weekly', 'Twice a week', 'Monthly'];

  const handleTest = async () => {
    setIsPlaying(true);
    const voiceName = getVoiceName(settings);
    await testVoiceOutput(currentNudge, voiceName, settings.voiceVolume, settings.voiceSpeed);
    setIsPlaying(false);
  };

  const handleNudgeEdit = (text: string) => {
    onUpdate({
      ...settings,
      voiceStylePresets: { ...settings.voiceStylePresets, [nudgeKey]: text }
    });
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-background-dark animate-in slide-in-from-right duration-300">
      <header className="sticky top-0 z-10 flex items-center h-16 px-4 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 justify-between">
        <button onClick={onBack} className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold tracking-tight">Idea Revival</h1>
        <div className="size-10 flex items-center justify-center">
          {isLocalizing && <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-10 pb-32">
        <section className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-base font-bold">Intelligent Nudges</span>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Revive old memories</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={settings.ideaRevival} onChange={() => toggle('ideaRevival')} className="sr-only peer" />
            <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Revival Nudge</h3>
            <button onClick={handleTest} disabled={isPlaying} className="text-primary text-[10px] font-bold uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">{isPlaying ? 'graphic_eq' : 'play_circle'}</span> Listen
            </button>
          </div>
          <div className="relative p-6 bg-primary/5 rounded-[32px] border border-primary/10 overflow-hidden">
            <textarea 
              value={currentNudge}
              onChange={(e) => handleNudgeEdit(e.target.value)}
              className="w-full bg-transparent border-none p-0 focus:ring-0 text-lg leading-relaxed italic text-slate-700 dark:text-slate-200 font-medium resize-none"
              rows={3}
              placeholder="Localized nudge..."
            />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-1">Frequency</h3>
          <div className="flex flex-col gap-3">
            {frequencies.map(f => (
              <label key={f} className={`flex items-center justify-between p-5 border-2 rounded-2xl cursor-pointer transition-all ${settings.ideaRevivalFrequency === f ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-800'}`}>
                <span className={`text-sm font-bold ${settings.ideaRevivalFrequency === f ? 'text-primary' : ''}`}>{f}</span>
                <input type="radio" name="revival-freq" checked={settings.ideaRevivalFrequency === f} onChange={() => onUpdate({ ...settings, ideaRevivalFrequency: f })} className="w-5 h-5 border-2 border-slate-200 text-primary focus:ring-0 bg-transparent appearance-none rounded-full checked:bg-primary checked:border-primary" />
              </label>
            ))}
          </div>
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md">
        <button onClick={onBack} className="w-full max-w-md py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all">
          Save Revival Rules
        </button>
      </footer>
    </div>
  );
};

export default IdeaRevival;

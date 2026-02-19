
import React, { useState, useEffect } from 'react';
import { Settings } from '../types';
import { testVoiceOutput, getVoiceName, generateLocalizedPhrase } from '../geminiService';

interface VoiceRemindersProps {
  settings: Settings;
  onUpdate: (s: Settings) => void;
  onBack: () => void;
}

const VoiceReminders: React.FC<VoiceRemindersProps> = ({ settings, onUpdate, onBack }) => {
  const [isTesting, setIsTesting] = useState(false);
  const [isLocalizing, setIsLocalizing] = useState(false);

  const langKey = settings.language.split(' — ')[0];
  const reminderKey = `reminder_${langKey}`;
  const currentReminderPrefix = settings.voiceStylePresets[reminderKey] || `Boss, it is 9:00 AM... I have a task for you.`;

  useEffect(() => {
    const warmup = async () => {
      if (!settings.voiceStylePresets[reminderKey]) {
        setIsLocalizing(true);
        const localized = await generateLocalizedPhrase(`Boss, it is 9:00 AM... I have a task for you.`, settings.language);
        onUpdate({
          ...settings,
          voiceStylePresets: { ...settings.voiceStylePresets, [reminderKey]: localized }
        });
        setIsLocalizing(false);
      }
    };
    warmup();
  }, [settings.language]);

  const toggle = (key: keyof Settings) => {
    onUpdate({ ...settings, [key]: !settings[key] });
  };

  const frequencies: Settings['voiceFrequency'][] = ['Minimal', 'Normal', 'Frequent'];
  const volumeStyles: { label: string; value: Settings['voiceVolumeStyle'] }[] = [
    { label: 'Match system volume', value: 'system' },
    { label: 'Soft voice', value: 'soft' },
    { label: 'Louder voice', value: 'loud' },
    { label: 'Volume Boost', value: 'boost' },
  ];

  const handleTest = async () => {
    setIsTesting(true);
    const voiceName = getVoiceName(settings);
    await testVoiceOutput(currentReminderPrefix, voiceName, settings.voiceVolume, settings.voiceSpeed);
    setIsTesting(false);
  };

  const handlePrefixEdit = (text: string) => {
    onUpdate({
      ...settings,
      voiceStylePresets: { ...settings.voiceStylePresets, [reminderKey]: text }
    });
  };

  const handleUpdateFrequency = (f: Settings['voiceFrequency']) => {
    onUpdate({ ...settings, voiceFrequency: f });
    handleTest(); // Auto-play to confirm
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-background-dark animate-in slide-in-from-right duration-300">
      <header className="sticky top-0 z-10 flex items-center bg-white/80 dark:bg-background-dark/80 backdrop-blur-md p-4 justify-between border-b border-slate-200 dark:border-slate-800">
        <button onClick={onBack} className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold tracking-tight">Voice Reminders</h1>
        <div className="size-10 flex items-center justify-center">
          {isLocalizing && <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
        <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-base font-bold">Audio Notifications</span>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Reminders spoken aloud</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.voiceReminders} onChange={() => toggle('voiceReminders')} className="sr-only peer" />
              <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Reminder Prefix</h3>
            <button onClick={handleTest} className="text-primary text-[10px] font-bold uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">{isTesting ? 'graphic_eq' : 'play_circle'}</span> Test
            </button>
          </div>
          <div className="relative p-6 rounded-[32px] bg-primary/5 border border-primary/10">
            <textarea 
              value={currentReminderPrefix}
              onChange={(e) => handlePrefixEdit(e.target.value)}
              className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm italic font-medium leading-relaxed resize-none text-slate-800 dark:text-slate-200"
              rows={3}
              placeholder="Localized prefix..."
            />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-1">Voice Frequency</h3>
          <div className="flex flex-col gap-3">
            {frequencies.map(f => (
              <label key={f} className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer ${settings.voiceFrequency === f ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-800'}`}>
                <div className="flex flex-col">
                  <span className={`text-sm font-bold ${settings.voiceFrequency === f ? 'text-primary' : ''}`}>{f}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{f === 'Minimal' ? 'Critical only' : f === 'Normal' ? 'Balanced' : 'High attention'}</span>
                </div>
                <input type="radio" name="freq" checked={settings.voiceFrequency === f} onChange={() => handleUpdateFrequency(f)} className="w-5 h-5 appearance-none rounded-full border-2 border-slate-200 checked:bg-primary checked:border-primary transition-all" />
              </label>
            ))}
          </div>
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md">
        <button onClick={onBack} className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all">
          Apply Settings
        </button>
      </footer>
    </div>
  );
};

export default VoiceReminders;

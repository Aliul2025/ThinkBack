
import React, { useState, useEffect } from 'react';
import { Settings } from '../types';
import { testVoiceOutput, getVoiceName, generateLocalizedPhrase } from '../geminiService';

interface AssistantNameProps {
  settings: Settings;
  onUpdate: (s: Settings) => void;
  onBack: () => void;
}

const AssistantName: React.FC<AssistantNameProps> = ({ settings, onUpdate, onBack }) => {
  const [name, setName] = useState(settings.assistantName);
  const [isTesting, setIsTesting] = useState(false);
  const [isLocalizing, setIsLocalizing] = useState(false);
  const suggestions = ['Maya', 'Nova', 'Luna', 'Ava', 'Buddy', 'Iris'];

  const langKey = settings.language.split(' — ')[0];
  const introKey = `intro_${langKey}`;
  const currentIntro = settings.voiceStylePresets[introKey] || `Hello, I am ${name}. I am ready to help.`;

  useEffect(() => {
    const warmup = async () => {
      if (!settings.voiceStylePresets[introKey]) {
        setIsLocalizing(true);
        const localized = await generateLocalizedPhrase(`Hello, I am ${name}. I am ready to help.`, settings.language);
        onUpdate({
          ...settings,
          voiceStylePresets: { ...settings.voiceStylePresets, [introKey]: localized }
        });
        setIsLocalizing(false);
      }
    };
    warmup();
  }, [settings.language]);

  const handleSave = () => {
    if (name.trim()) {
      onUpdate({ ...settings, assistantName: name.trim() });
      onBack();
    }
  };

  const handleTest = async (phraseOverride?: string) => {
    setIsTesting(true);
    const voiceName = getVoiceName(settings);
    const textToSay = phraseOverride || currentIntro;
    await testVoiceOutput(textToSay, voiceName, settings.voiceVolume, settings.voiceSpeed);
    setIsTesting(false);
  };

  const handleNameChange = (newName: string) => {
    setName(newName);
    // When name changes, we just update the local state. 
    // We don't auto-play on every keystroke to avoid spam.
  };

  const handleSelectName = (newName: string) => {
    setName(newName);
    // On explicit selection, we can auto-play the intro
    onUpdate({ ...settings, assistantName: newName });
    handleTest(currentIntro.replace(settings.assistantName, newName));
  };

  const handleIntroEdit = (text: string) => {
    onUpdate({
      ...settings,
      voiceStylePresets: { ...settings.voiceStylePresets, [introKey]: text }
    });
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-background-dark animate-in slide-in-from-right duration-300">
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-4 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
        <button onClick={onBack} className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold tracking-tight">Assistant Identity</h2>
        <div className="size-10 flex items-center justify-center">
          {isLocalizing && <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
        </div>
      </header>

      <main className="flex-1 flex flex-col px-6 py-8 overflow-y-auto">
        <div className="text-center mb-8">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3 block">Display Name</span>
          <h1 className="text-5xl font-bold tracking-tighter">{name}</h1>
          <p className="text-[10px] text-accent-blue font-bold uppercase tracking-widest mt-2">Active in {langKey}</p>
        </div>

        <div className="space-y-8 pb-32">
          {/* Editable Intro Preset */}
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Introduction Phrase</span>
              <button onClick={() => handleTest()} className="text-primary text-[10px] font-bold uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">play_circle</span> Test
              </button>
            </div>
            <div className="relative p-5 bg-primary/5 rounded-[32px] border border-primary/10 overflow-hidden">
              <textarea 
                value={currentIntro}
                onChange={(e) => handleIntroEdit(e.target.value)}
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm italic font-medium leading-relaxed resize-none text-slate-700 dark:text-slate-200"
                rows={3}
                placeholder="Localized introduction..."
              />
              <div className="absolute bottom-3 right-5 opacity-20 pointer-events-none">
                <span className="material-symbols-outlined text-2xl">auto_awesome</span>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <input 
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                maxLength={16}
                className="w-full h-16 px-6 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl focus:ring-4 focus:ring-primary/20 text-xl font-bold text-center outline-none transition-all"
                placeholder="Enter name..."
              />
              <button 
                onClick={() => handleTest()}
                disabled={isTesting}
                className={`size-16 rounded-3xl flex items-center justify-center transition-all ${isTesting ? 'bg-primary text-white shadow-lg animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
              >
                <span className="material-symbols-outlined text-2xl">{isTesting ? 'graphic_eq' : 'volume_up'}</span>
              </button>
            </div>
          </section>

          <section className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-1">Quick Picks</span>
            <div className="flex flex-wrap gap-3">
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => handleSelectName(s)}
                  className={`px-5 py-3 rounded-2xl border-2 font-bold text-sm transition-all ${name === s ? 'border-primary bg-primary text-white shadow-lg scale-105' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-400'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-8 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md">
        <button 
          onClick={handleSave}
          className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all"
        >
          Save Changes
        </button>
      </footer>
    </div>
  );
};

export default AssistantName;

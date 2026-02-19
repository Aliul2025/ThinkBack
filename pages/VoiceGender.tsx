
import React, { useState } from 'react';
import { Settings } from '../types';
import { testVoiceOutput, getVoiceName, generateLocalizedPhrase } from '../geminiService';

interface VoiceGenderProps {
  settings: Settings;
  onUpdate: (s: Settings) => void;
  onBack: () => void;
}

const VoiceGenderPage: React.FC<VoiceGenderProps> = ({ settings, onUpdate, onBack }) => {
  const [isTesting, setIsTesting] = useState(false);

  const handleTest = async () => {
    setIsTesting(true);
    const voiceName = getVoiceName(settings);
    const baseText = `This is how I sound with my current voice settings as ${settings.assistantName}.`;
    const localizedText = await generateLocalizedPhrase(baseText, settings.language);
    await testVoiceOutput(localizedText, voiceName);
    setIsTesting(false);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-background-dark animate-in slide-in-from-right duration-300">
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 h-16 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
        <button onClick={onBack} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">arrow_back</span>
        </button>
        <h2 className="text-lg font-semibold tracking-tight">Voice Gender</h2>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full px-6 py-8">
        <div className="text-center mb-12">
          <div className="size-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-primary text-5xl fill-1">
              {settings.voiceGender === 'Female' ? 'face_6' : 'face_2'}
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{settings.voiceGender} Voice</h1>
          <p className="text-[10px] text-accent-blue font-bold uppercase tracking-widest mt-2">{settings.language.split(' — ')[0]} localized</p>
        </div>

        <div className="w-full max-w-xs space-y-12">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl">
            <button 
              onClick={() => onUpdate({ ...settings, voiceGender: 'Female' })}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${settings.voiceGender === 'Female' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary ring-1 ring-black/5' : 'text-slate-400'}`}
            >
              Female
            </button>
            <button 
              onClick={() => onUpdate({ ...settings, voiceGender: 'Male' })}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${settings.voiceGender === 'Male' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary ring-1 ring-black/5' : 'text-slate-400'}`}
            >
              Male
            </button>
          </div>

          <div className="flex flex-col items-center gap-6">
            <button 
              onClick={handleTest}
              disabled={isTesting}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all ${isTesting ? 'animate-pulse opacity-70' : ''}`}
            >
              <span className="material-symbols-outlined text-xl">{isTesting ? 'graphic_eq' : 'volume_up'}</span>
              <span>Test localized voice</span>
            </button>
          </div>
        </div>
      </main>

      <footer className="p-8 space-y-4">
        <button 
          onClick={onBack}
          className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all"
        >
          Confirm Gender
        </button>
      </footer>
    </div>
  );
};

export default VoiceGenderPage;

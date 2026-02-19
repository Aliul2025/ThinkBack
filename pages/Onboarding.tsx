
import React, { useState } from 'react';
import { testVoiceOutput } from '../geminiService';
import { Settings } from '../types';

interface OnboardingProps {
  onComplete: (name: string, gender: Settings['voiceGender'], language: string) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('Maya');
  const [gender, setGender] = useState<Settings['voiceGender']>('Female');
  const [language, setLanguage] = useState('English — United States');
  const [isTesting, setIsTesting] = useState(false);
  
  const suggestions = ['Maya', 'Nova', 'Luna', 'Ava', 'Buddy'];
  
  const languages = [
    { label: 'English', region: 'United States', icon: 'language_us' },
    { label: 'English', region: 'United Kingdom', icon: 'language_gb' },
    { label: 'Español', region: 'Spain', icon: 'language_es' },
    { label: 'Français', region: 'France', icon: 'language_fr' },
    { label: 'हिन्दी (Hindi)', region: 'India', icon: 'language_in' },
    { label: 'বাংলা (Bengali)', region: 'Bangladesh', icon: 'language_bn' },
    { label: '日本語', region: 'Japan', icon: 'language_jp' },
  ];

  // Helper for voice mapping during test
  const getTestVoice = (g: string) => g === 'Female' ? 'Zephyr' : 'Charon';

  const handleTestVoice = async () => {
    setIsTesting(true);
    const text = `Hello, I am ${name}. I will be your calm and premium memory assistant in ${language.split(' — ')[0]}. Ready to remember?`;
    await testVoiceOutput(text, getTestVoice(gender));
    setIsTesting(false);
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else {
      onComplete(name || 'Maya', gender, language);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-background-dark relative overflow-hidden">
      {/* Progress Header */}
      <header className="px-8 pt-12 pb-6 flex flex-col items-center shrink-0">
        <div className="flex items-center gap-1 mb-6">
          <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 1 ? 'w-8 bg-primary' : 'w-4 bg-primary/20'}`} />
          <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 2 ? 'w-8 bg-primary' : 'w-4 bg-primary/20'}`} />
        </div>
        <div className="bg-primary/10 p-3 rounded-2xl mb-3 shadow-inner">
          <span className="material-symbols-outlined text-primary text-3xl fill-1">neurology</span>
        </div>
        <span className="text-xl font-bold tracking-tight">ThinkBack</span>
      </header>

      <main className="flex-1 flex flex-col px-8 overflow-y-auto hide-scrollbar pb-32">
        {step === 1 ? (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col h-full">
            <h1 className="text-3xl font-bold leading-tight text-center mb-3">
              Choose your AI Assistant language
            </h1>
            <p className="text-base text-slate-500 text-center mb-8 px-4 leading-relaxed font-medium">
              This helps me understand your voice and local culture better.
            </p>

            <div className="grid grid-cols-1 gap-3">
              {languages.map((l) => {
                const value = `${l.label} — ${l.region}`;
                const isActive = language === value;
                return (
                  <button
                    key={value}
                    onClick={() => setLanguage(value)}
                    className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all active:scale-[0.98] ${
                      isActive 
                        ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' 
                        : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400'
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span className={`text-base font-bold ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{l.label}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{l.region}</span>
                    </div>
                    <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-all ${isActive ? 'bg-primary border-primary' : 'border-slate-200 dark:border-slate-700'}`}>
                      {isActive && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <h1 className="text-3xl font-bold leading-tight text-center mb-3">
              Set your assistant identity
            </h1>
            <p className="text-base text-slate-500 text-center mb-10 px-4 leading-relaxed font-medium">
              Customize the name and voice for your personalized companion.
            </p>

            <div className="space-y-10">
              <div className="relative">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Display Name</label>
                <input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-16 px-6 rounded-3xl border-none bg-slate-100 dark:bg-slate-800 focus:ring-4 focus:ring-primary/20 text-lg font-bold transition-all placeholder:text-slate-300"
                  placeholder="e.g., Maya, Nova, Luna"
                  maxLength={16}
                />
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                {suggestions.map(s => (
                  <button
                    key={s}
                    onClick={() => setName(s)}
                    className={`px-6 py-3 rounded-2xl border-2 font-bold text-sm transition-all ${
                      name === s 
                      ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20 scale-105' 
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center block">Vocal Personality</label>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[28px]">
                  <button 
                    onClick={() => setGender('Female')}
                    className={`flex-1 py-4 rounded-[22px] text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      gender === 'Female' ? 'bg-white dark:bg-slate-700 shadow-xl text-primary' : 'text-slate-400'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">woman</span>
                    Female
                  </button>
                  <button 
                    onClick={() => setGender('Male')}
                    className={`flex-1 py-4 rounded-[22px] text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      gender === 'Male' ? 'bg-white dark:bg-slate-700 shadow-xl text-primary' : 'text-slate-400'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">man</span>
                    Male
                  </button>
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <button 
                  onClick={handleTestVoice}
                  disabled={isTesting}
                  className={`flex items-center gap-3 px-8 py-5 rounded-3xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 transition-all ${isTesting ? 'animate-pulse opacity-70' : 'active:scale-95 shadow-sm'}`}
                >
                  <span className={`material-symbols-outlined text-2xl ${isTesting ? 'animate-spin' : ''}`}>
                    {isTesting ? 'autorenew' : 'volume_up'}
                  </span>
                  {isTesting ? 'Synthesizing...' : 'Test Localized Voice'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Persistent Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-8 pt-4 bg-gradient-to-t from-white dark:from-background-dark via-white/95 dark:via-background-dark/95 to-transparent space-y-4 z-20">
        <button 
          onClick={handleNext}
          className="w-full h-16 bg-primary text-white rounded-3xl font-bold text-lg shadow-2xl shadow-primary/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {step === 1 ? 'Next Step' : 'Finish Setup'}
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
        {step === 2 && (
          <button 
            onClick={() => setStep(1)}
            className="w-full h-10 text-slate-400 font-bold text-xs uppercase tracking-[0.2em] hover:text-slate-600 transition-colors"
          >
            Go Back
          </button>
        )}
      </footer>
    </div>
  );
};

export default Onboarding;

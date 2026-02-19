
import React, { useState } from 'react';
import { Settings } from '../types';
import { testVoiceOutput, getVoiceName, generateLocalizedPhrase, isQuietHoursActive } from '../geminiService';

interface VoiceControlProps {
  settings: Settings;
  onUpdate: (s: Settings) => void;
  onBack: () => void;
}

const VoiceControl: React.FC<VoiceControlProps> = ({ settings, onUpdate, onBack }) => {
  const [isTesting, setIsTesting] = useState(false);
  const [showQuietToast, setShowQuietToast] = useState(false);

  const handleTest = async () => {
    const isQuiet = isQuietHoursActive(settings);
    
    if (isQuiet) {
      setShowQuietToast(true);
      setTimeout(() => setShowQuietToast(false), 3000);
      // We don't return here because testing voice control is a manual user action 
      // where they usually WANT to hear the changes, but we warn them.
    }

    setIsTesting(true);
    const voiceName = getVoiceName(settings);
    const baseText = `Hello, I am ${settings.assistantName}. I am speaking at ${settings.voiceSpeed} times speed with ${settings.voiceVolume} percent volume. How does this sound?`;
    const localizedText = await generateLocalizedPhrase(baseText, settings.language);
    await testVoiceOutput(localizedText, voiceName, settings.voiceVolume, settings.voiceSpeed);
    setIsTesting(false);
  };

  const updateSetting = (key: keyof Settings, value: any) => {
    onUpdate({ ...settings, [key]: value });
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-background-dark animate-in slide-in-from-right duration-300">
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-4 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <button onClick={onBack} className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold tracking-tight">Voice Control</h2>
        <div className="size-10"></div>
      </header>

      <main className="flex-1 px-6 py-8 overflow-y-auto pb-32 space-y-10">
        {showQuietToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-accent-blue text-white px-6 py-3 rounded-full shadow-2xl animate-in slide-in-from-top duration-300 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">dark_mode</span>
            <span className="text-xs font-bold uppercase tracking-widest">Quiet Hours Active</span>
          </div>
        )}

        <section className="text-center">
          <div className="size-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <span className="material-symbols-outlined text-primary text-4xl fill-1">tune</span>
          </div>
          <h1 className="text-2xl font-bold">Audio Tuning</h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Fine-tune vocal delivery</p>
        </section>

        {/* Speed Control */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Voice Speed</h3>
            <span className="text-sm font-bold text-primary">{settings.voiceSpeed.toFixed(1)}x</span>
          </div>
          <div className="relative pt-1">
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={settings.voiceSpeed}
              onChange={(e) => updateSetting('voiceSpeed', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between mt-3 px-1">
              <span className="text-[9px] font-bold text-slate-300">SLOW</span>
              <span className="text-[9px] font-bold text-slate-300">NORMAL</span>
              <span className="text-[9px] font-bold text-slate-300">FAST</span>
            </div>
          </div>
        </section>

        {/* Volume Control */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Assistant Volume</h3>
            <span className="text-sm font-bold text-primary">{settings.voiceVolume}%</span>
          </div>
          <div className="relative pt-1">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={settings.voiceVolume}
              onChange={(e) => updateSetting('voiceVolume', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between mt-3 px-1">
              <span className="material-symbols-outlined text-xs text-slate-300">volume_mute</span>
              <span className="material-symbols-outlined text-xs text-slate-300">volume_up</span>
            </div>
          </div>
        </section>

        {/* Volume Style (Boosts) */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-1">Vocal Clarity Style</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'system', label: 'Balanced', icon: 'balance' },
              { id: 'soft', label: 'Soft Whisper', icon: 'volume_down' },
              { id: 'loud', label: 'Clarity', icon: 'record_voice_over' },
              { id: 'boost', label: 'Max Boost', icon: 'campaign' }
            ].map((style) => (
              <button
                key={style.id}
                onClick={() => updateSetting('voiceVolumeStyle', style.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-3xl border-2 transition-all ${
                  settings.voiceVolumeStyle === style.id 
                  ? 'bg-primary/5 border-primary text-primary' 
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400'
                }`}
              >
                <span className="material-symbols-outlined text-xl">{style.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">{style.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Test Section */}
        <section className="pt-4">
          <button 
            onClick={handleTest}
            disabled={isTesting}
            className={`w-full py-5 rounded-[28px] flex items-center justify-center gap-3 transition-all ${
              isTesting 
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' 
              : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl'
            }`}
          >
            <span className={`material-symbols-outlined ${isTesting ? 'animate-spin' : ''}`}>
              {isTesting ? 'autorenew' : 'volume_up'}
            </span>
            <span className="font-bold text-sm uppercase tracking-widest">
              {isTesting ? 'Synthesizing...' : 'Apply & Test Voice'}
            </span>
          </button>
          <p className="text-[9px] text-center text-slate-400 mt-4 font-medium italic">
            Speed and volume settings apply to all assistant feedback and reminders.
          </p>
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-white dark:bg-background-dark border-t border-slate-100 dark:border-slate-800 flex justify-center z-10">
        <button 
          onClick={onBack}
          className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
        >
          Confirm Settings
        </button>
      </footer>
    </div>
  );
};

export default VoiceControl;

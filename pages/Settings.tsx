
import React from 'react';
import { Settings, AppView } from '../types';
import { isQuietHoursActive } from '../geminiService';

interface SettingsProps {
  settings: Settings;
  onUpdate: (settings: Settings) => void;
  onBack: () => void;
  onChangeView: (view: AppView) => void;
}

const SettingsPage: React.FC<SettingsProps> = ({ settings, onUpdate, onBack, onChangeView }) => {
  const isQuiet = isQuietHoursActive(settings);

  const formatThemeName = (theme: string) => {
    return theme.charAt(0).toUpperCase() + theme.slice(1);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-background-dark">
      <header className="flex items-center justify-between px-4 py-4 sticky top-0 bg-white dark:bg-background-dark border-b border-slate-100 dark:border-slate-800 z-10">
        <button onClick={onBack} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold tracking-tight">Settings</h1>
        <div className="size-10" />
      </header>

      <main className="flex-1 overflow-y-auto pb-32">
        {/* APPEARANCE SECTION */}
        <section>
          <h2 className="px-6 pt-6 pb-2 text-[11px] font-bold tracking-widest text-slate-400 uppercase">Appearance</h2>
          <div className="bg-white dark:bg-background-dark">
            <button 
              onClick={() => onChangeView('theme-picker')}
              className="w-full flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <span className="text-base">Theme</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400 text-base">{formatThemeName(settings.theme)}</span>
                <span className="material-symbols-outlined text-slate-300 text-sm">chevron_right</span>
              </div>
            </button>
          </div>
        </section>

        {/* ASSISTANT SECTION */}
        <section>
          <h2 className="px-6 pt-6 pb-2 text-[11px] font-bold tracking-widest text-slate-400 uppercase">Assistant</h2>
          <div className="bg-white dark:bg-background-dark">
            <button 
              onClick={() => onChangeView('assistant-name')}
              className="w-full flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <span className="text-base">Assistant Name</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400 text-base">{settings.assistantName}</span>
                <span className="material-symbols-outlined text-slate-300 text-sm">chevron_right</span>
              </div>
            </button>
            <button 
              onClick={() => onChangeView('voice-gender')}
              className="w-full flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <span className="text-base">Voice Gender</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400 text-base">{settings.voiceGender}</span>
                <span className="material-symbols-outlined text-slate-300 text-sm">chevron_right</span>
              </div>
            </button>
            <button 
              onClick={() => onChangeView('voice-style')}
              className="w-full flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <span className="text-base">Voice Style</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400 text-base">{settings.voiceStyle}</span>
                <span className="material-symbols-outlined text-slate-300 text-sm">chevron_right</span>
              </div>
            </button>
            <button 
              onClick={() => onChangeView('voice-control')}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <span className="text-base">Voice Control</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400 text-base">{settings.voiceSpeed}x • {settings.voiceVolume}%</span>
                <span className="material-symbols-outlined text-slate-300 text-sm">chevron_right</span>
              </div>
            </button>
          </div>
        </section>

        {/* LANGUAGE & REGION */}
        <section>
          <h2 className="px-6 pt-6 pb-2 text-[11px] font-bold tracking-widest text-slate-400 uppercase">Language & Region</h2>
          <div className="bg-white dark:bg-background-dark">
            <button 
              onClick={() => onChangeView('language-picker')}
              className="w-full flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <span className="text-base">Language</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400 text-base">{settings.language.split(' — ')[0]}</span>
                <span className="material-symbols-outlined text-slate-300 text-sm">chevron_right</span>
              </div>
            </button>
            <button 
              onClick={() => onChangeView('speech-language-picker')}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <span className="text-base">Speech Recognition Language</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400 text-base">
                  {settings.speechLanguageMode === 'auto' ? 'Auto' : 
                   settings.speechLanguageMode === 'app' ? 'App' : settings.speechLanguage}
                </span>
                <span className="material-symbols-outlined text-slate-300 text-sm">chevron_right</span>
              </div>
            </button>
          </div>
        </section>

        {/* REMINDERS */}
        <section>
          <h2 className="px-6 pt-6 pb-2 text-[11px] font-bold tracking-widest text-slate-400 uppercase">Reminders</h2>
          <div className="bg-white dark:bg-background-dark">
            <button 
              onClick={() => onChangeView('quiet-hours')}
              className={`w-full flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 transition-colors ${isQuiet ? 'bg-accent-blue/5 dark:bg-accent-blue/10 shadow-inner' : 'hover:bg-slate-50 dark:hover:bg-slate-900'}`}
            >
              <div className="flex flex-col">
                <span className={`text-base ${isQuiet ? 'text-accent-blue font-bold' : ''}`}>Quiet Hours</span>
                {isQuiet && <span className="text-[10px] font-black text-accent-blue uppercase tracking-tighter">Active Now</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400 text-base">
                  {settings.quietHoursEnabled ? `${settings.quietHoursStart} – ${settings.quietHoursEnd}` : 'Off'}
                </span>
                <span className={`material-symbols-outlined ${isQuiet ? 'text-accent-blue' : 'text-slate-300'} text-sm`}>chevron_right</span>
              </div>
            </button>
            <button 
              onClick={() => onChangeView('daily-checkin')}
              className="w-full flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <span className="text-base">Daily Check-in</span>
              <div className="flex items-center gap-4">
                <span className="text-slate-500 dark:text-slate-400 text-base">{settings.dailyCheckIn ? 'On' : 'Off'}</span>
                <span className="material-symbols-outlined text-slate-300 text-sm">chevron_right</span>
              </div>
            </button>
            <button 
              onClick={() => onChangeView('idea-revival')}
              className="w-full flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <span className="text-base">Idea Revival</span>
              <div className="flex items-center gap-4">
                <span className="text-slate-500 dark:text-slate-400 text-base">{settings.ideaRevival ? 'On' : 'Off'}</span>
                <span className="material-symbols-outlined text-slate-300 text-sm">chevron_right</span>
              </div>
            </button>
          </div>
        </section>

        {/* AI BEHAVIOR */}
        <section>
          <h2 className="px-6 pt-6 pb-2 text-[11px] font-bold tracking-widest text-slate-400 uppercase">AI Behavior</h2>
          <div className="bg-white dark:bg-background-dark">
            <button 
              onClick={() => onChangeView('auto-reminder-detection')}
              className="w-full flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <span className="text-base">Auto-detect Reminders</span>
              <div className="flex items-center gap-4">
                <span className="text-slate-500 dark:text-slate-400 text-base">{settings.autoDetectReminders ? 'On' : 'Off'}</span>
                <span className="material-symbols-outlined text-slate-300 text-sm">chevron_right</span>
              </div>
            </button>
            <button 
              onClick={() => onChangeView('voice-reminders')}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-left"
            >
              <div className="flex flex-col">
                <span className="text-base">Voice Reminders</span>
                <span className="text-xs text-slate-400">Frequency & Volume Control</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-slate-500 dark:text-slate-400 text-base">{settings.voiceReminders ? 'On' : 'Off'}</span>
                <span className="material-symbols-outlined text-slate-300 text-sm">chevron_right</span>
              </div>
            </button>
          </div>
        </section>

        {/* DATA & PRIVACY */}
        <section>
          <h2 className="px-6 pt-6 pb-2 text-[11px] font-bold tracking-widest text-slate-400 uppercase">Data & Privacy</h2>
          <div className="bg-white dark:bg-background-dark">
            <button 
              onClick={() => onChangeView('backup-sync')}
              className="w-full flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <span className="text-base">Backup & Sync</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400 text-base">{settings.cloudBackupEnabled ? 'On' : 'Off'}</span>
                <span className="material-symbols-outlined text-slate-300 text-sm">chevron_right</span>
              </div>
            </button>
            <button 
              onClick={() => onChangeView('privacy')}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <span className="text-base">Privacy</span>
              <span className="material-symbols-outlined text-slate-300 text-sm">chevron_right</span>
            </button>
          </div>
        </section>

        {/* ABOUT */}
        <section>
          <h2 className="px-6 pt-6 pb-2 text-[11px] font-bold tracking-widest text-slate-400 uppercase">About</h2>
          <div className="bg-white dark:bg-background-dark">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-base">Version</span>
              <span className="text-slate-500 dark:text-slate-400 text-base">2.4.0</span>
            </div>
            <button 
              onClick={() => onChangeView('about')}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <span className="text-base">About ThinkBack</span>
              <span className="material-symbols-outlined text-slate-300 text-sm">chevron_right</span>
            </button>
          </div>
        </section>

        <div className="mt-20 px-6 text-center pb-12">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">ThinkBack Engine v2.4.0</p>
          <p className="mt-2 text-xs text-slate-400 italic">"Your mind, remembered."</p>
        </div>
      </main>

      <nav className="fixed bottom-0 w-full max-w-md bg-white/95 dark:bg-background-dark/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 px-8 py-4 pb-8 flex justify-around items-center z-10">
        <button onClick={() => onChangeView('home')} className="flex flex-col items-center gap-1 text-slate-300">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
        </button>
        <button onClick={() => onChangeView('library')} className="flex flex-col items-center gap-1 text-slate-300">
          <span className="material-symbols-outlined">library_books</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Library</span>
        </button>
        <button onClick={() => onChangeView('profile')} className="flex flex-col items-center gap-1 text-primary">
          <span className="material-symbols-outlined fill-1">person</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default SettingsPage;

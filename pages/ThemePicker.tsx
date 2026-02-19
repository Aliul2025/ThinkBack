
import React from 'react';
import { Settings } from '../types';

interface ThemePickerProps {
  settings: Settings;
  onUpdate: (s: Settings) => void;
  onBack: () => void;
}

const ThemePicker: React.FC<ThemePickerProps> = ({ settings, onUpdate, onBack }) => {
  const themes: { id: Settings['theme']; label: string; icon: string; desc: string }[] = [
    { 
      id: 'system', 
      label: 'System Default', 
      icon: 'settings_brightness', 
      desc: 'Follow your device’s current theme setting.' 
    },
    { 
      id: 'light', 
      label: 'Light Mode', 
      icon: 'light_mode', 
      desc: 'A bright and clean experience for day use.' 
    },
    { 
      id: 'dark', 
      label: 'Dark Mode', 
      icon: 'dark_mode', 
      desc: 'Elegant and easy on the eyes in low light.' 
    }
  ];

  const handleSelect = (theme: Settings['theme']) => {
    onUpdate({ ...settings, theme });
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-background-dark animate-in slide-in-from-right duration-300">
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 h-16 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <button onClick={onBack} className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold tracking-tight">Theme</h2>
        <div className="size-10"></div>
      </header>

      <main className="flex-1 px-6 py-8 overflow-y-auto space-y-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Select Appearance</p>
        
        <div className="grid grid-cols-1 gap-4">
          {themes.map((theme) => {
            const isActive = settings.theme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => handleSelect(theme.id)}
                className={`flex items-center gap-5 p-5 rounded-[32px] border-2 text-left transition-all group ${
                  isActive 
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5' 
                  : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                <div className={`size-14 rounded-2xl flex items-center justify-center transition-all ${
                  isActive 
                  ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-primary'
                }`}>
                  <span className="material-symbols-outlined text-2xl">{theme.icon}</span>
                </div>
                
                <div className="flex-1">
                  <h3 className={`font-bold text-base transition-colors ${isActive ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                    {theme.label}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-0.5">
                    {theme.desc}
                  </p>
                </div>

                <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  isActive ? 'bg-primary border-primary' : 'border-slate-200 dark:border-slate-700'
                }`}>
                  {isActive && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
                </div>
              </button>
            );
          })}
        </div>
      </main>

      <footer className="p-8">
        <button 
          onClick={onBack}
          className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all"
        >
          Done
        </button>
      </footer>
    </div>
  );
};

export default ThemePicker;

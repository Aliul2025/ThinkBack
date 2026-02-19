
import React, { useState } from 'react';
import { Settings } from '../types';

interface SpeechLanguagePickerProps {
  settings: Settings;
  onUpdate: (settings: Settings) => void;
  onBack: () => void;
}

const SpeechLanguagePicker: React.FC<SpeechLanguagePickerProps> = ({ settings, onUpdate, onBack }) => {
  const [mode, setMode] = useState<Settings['speechLanguageMode']>(settings.speechLanguageMode);
  const [selectedLang, setSelectedLang] = useState(settings.speechLanguage);

  const topLanguages = ['Bengali', 'English', 'Hindi', 'Arabic', 'Spanish', 'French', 'German'];

  const handleSave = () => {
    onUpdate({ 
      ...settings, 
      speechLanguageMode: mode,
      speechLanguage: selectedLang
    });
  };

  return (
    <div className="h-full flex flex-col bg-background-light dark:bg-background-dark animate-in slide-in-from-right duration-300">
      <header className="sticky top-0 z-50 bg-white dark:bg-background-dark border-b border-slate-100 dark:border-slate-800 px-4 h-16 flex items-center justify-between">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-start hover:opacity-70">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-base font-semibold tracking-tight">Speech Language</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
        <section className="bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
          {/* Auto Mode */}
          <label className="flex items-center gap-4 p-5 cursor-pointer active:bg-slate-200 dark:active:bg-slate-800 transition-colors">
            <div className="flex-1">
              <p className="text-[15px] font-medium">Auto (Recommended)</p>
              <p className="text-sm text-slate-500 mt-0.5">Detect language automatically.</p>
            </div>
            <input 
              type="radio" 
              name="speech-mode" 
              checked={mode === 'auto'}
              onChange={() => setMode('auto')}
              className="w-5 h-5 border-2 border-slate-300 text-accent-blue focus:ring-accent-blue/20 bg-transparent transition-all" 
            />
          </label>
          <div className="h-[1px] bg-slate-100 dark:bg-slate-800 mx-5"></div>
          
          {/* App Language Mode */}
          <label className="flex items-center gap-4 p-5 cursor-pointer active:bg-slate-200 dark:active:bg-slate-800 transition-colors">
            <div className="flex-1">
              <p className="text-[15px] font-medium">Use App Language</p>
              <p className="text-sm text-slate-500 mt-0.5">Match the app’s current language.</p>
            </div>
            <input 
              type="radio" 
              name="speech-mode" 
              checked={mode === 'app'}
              onChange={() => setMode('app')}
              className="w-5 h-5 border-2 border-slate-300 text-accent-blue focus:ring-accent-blue/20 bg-transparent transition-all" 
            />
          </label>
          <div className="h-[1px] bg-slate-100 dark:bg-slate-800 mx-5"></div>
          
          {/* Manual Mode */}
          <label className="flex items-center gap-4 p-5 cursor-pointer active:bg-slate-200 dark:active:bg-slate-800 transition-colors">
            <div className="flex-1">
              <p className="text-[15px] font-medium">Choose Manually</p>
            </div>
            <input 
              type="radio" 
              name="speech-mode" 
              checked={mode === 'manual'}
              onChange={() => setMode('manual')}
              className="w-5 h-5 border-2 border-slate-300 text-accent-blue focus:ring-accent-blue/20 bg-transparent transition-all" 
            />
          </label>
        </section>

        {mode === 'manual' && (
          <section className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <h3 className="px-1 text-[11px] font-bold tracking-[0.1em] text-slate-400 uppercase">Top Languages</h3>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
              {topLanguages.map((lang, idx) => (
                <React.Fragment key={lang}>
                  <label className="flex items-center gap-4 p-4 px-5 cursor-pointer active:bg-slate-200 dark:active:bg-slate-800 transition-colors">
                    <p className="flex-1 text-[15px] font-medium">{lang}</p>
                    <input 
                      type="radio" 
                      name="manual-lang"
                      checked={selectedLang === lang}
                      onChange={() => setSelectedLang(lang)}
                      className="w-5 h-5 border-2 border-slate-300 text-accent-blue focus:ring-accent-blue/20 bg-transparent transition-all" 
                    />
                  </label>
                  {idx < topLanguages.length - 1 && <div className="h-[1px] bg-slate-100 dark:bg-slate-800 mx-5"></div>}
                </React.Fragment>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="p-4 pb-8 max-w-2xl mx-auto w-full mt-auto">
        <button 
          onClick={handleSave}
          className="w-full bg-accent-blue hover:bg-accent-blue/90 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-accent-blue/20 active:scale-[0.98]"
        >
          Save
        </button>
      </footer>
    </div>
  );
};

export default SpeechLanguagePicker;


import React, { useState } from 'react';

interface LanguagePickerProps {
  currentLanguage: string;
  onSelect: (language: string) => void;
  onBack: () => void;
}

const LanguagePicker: React.FC<LanguagePickerProps> = ({ currentLanguage, onSelect, onBack }) => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(currentLanguage);

  const languages = [
    { label: 'বাংলা (Bengali)', region: 'Bangladesh' },
    { label: 'English', region: 'United States' },
    { label: 'English', region: 'United Kingdom' },
    { label: 'हिन्दी (Hindi)', region: 'India' },
    { label: 'العربية (Arabic)', region: 'Saudi Arabia', rtl: true },
    { label: 'Español (Spanish)', region: 'Spain' },
    { label: 'Français (French)', region: 'France' },
    { label: 'Deutsch (German)', region: 'Germany' },
    { label: '日本語 (Japanese)', region: 'Japan' },
    { label: 'Português (Portuguese)', region: 'Brazil' },
  ];

  const filtered = languages.filter(l => 
    l.label.toLowerCase().includes(search.toLowerCase()) || 
    l.region.toLowerCase().includes(search.toLowerCase())
  );

  const handleApply = () => {
    onSelect(selected);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-background-dark animate-in slide-in-from-right duration-300">
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <button onClick={onBack} className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-semibold tracking-tight">Language</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-32">
        <div className="mt-4 mb-2">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-slate-50 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-accent-blue/50 placeholder:text-slate-400 transition-all" 
              placeholder="Search language" 
              type="text"
            />
          </div>
        </div>

        <div className="px-1 py-3">
          <p className="text-[12px] font-medium text-slate-400 uppercase tracking-wider">
            Detected: <span className="text-accent-blue font-bold">English (United States)</span>
          </p>
        </div>

        <div className="space-y-1 mt-2">
          {filtered.map((l) => {
            const value = `${l.label} — ${l.region}`;
            return (
              <label 
                key={value}
                className="group flex items-center justify-between p-4 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors border border-transparent active:scale-[0.99]"
              >
                <div className="flex flex-col">
                  <span className="text-[16px] font-medium">{value}</span>
                  {l.rtl && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[14px] text-slate-400">format_textdirection_r_to_l</span>
                      <span className="text-[11px] text-slate-400 font-medium uppercase tracking-tighter">RTL supported</span>
                    </div>
                  )}
                </div>
                <input 
                  type="radio"
                  name="language"
                  checked={selected === value}
                  onChange={() => setSelected(value)}
                  className="h-5 w-5 rounded-full border-2 border-slate-200 dark:border-slate-700 bg-transparent text-accent-blue focus:ring-0 focus:ring-offset-0"
                />
              </label>
            );
          })}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white dark:from-background-dark via-white/95 dark:via-background-dark/95 to-transparent flex justify-center">
        <button 
          onClick={handleApply}
          className="w-full max-w-md bg-accent-blue text-white h-14 rounded-xl font-bold text-[16px] shadow-lg shadow-accent-blue/20 hover:bg-accent-blue/90 active:scale-[0.98] transition-all flex items-center justify-center"
        >
          Apply
        </button>
      </footer>
    </div>
  );
};

export default LanguagePicker;

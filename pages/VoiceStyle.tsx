
import React, { useState, useEffect } from 'react';
import { Settings } from '../types';
import { testVoiceOutput, getVoiceName, generateLocalizedPhrase } from '../geminiService';

interface VoiceStyleProps {
  settings: Settings;
  onUpdate: (s: Settings) => void;
  onBack: () => void;
}

const VoiceStylePage: React.FC<VoiceStyleProps> = ({ settings, onUpdate, onBack }) => {
  const [isTesting, setIsTesting] = useState(false);
  const [isLocalizing, setIsLocalizing] = useState(false);
  const [editingId, setEditingId] = useState<Settings['voiceStyle'] | null>(null);
  
  const styles: { id: Settings['voiceStyle']; title: string; desc: string; icon: string; defaultPreview: string }[] = [
    { id: 'Boss', title: 'Boss', desc: 'Short, direct, motivating.', icon: 'record_voice_over', defaultPreview: 'I am here. What should I record?' },
    { id: 'Friendly', title: 'Friendly', desc: 'Warm and supportive.', icon: 'sentiment_satisfied', defaultPreview: 'Hey there! Tell me, what would you like to remember?' },
    { id: 'Calm', title: 'Calm', desc: 'Soft and minimal.', icon: 'spa', defaultPreview: 'I am keeping track of things for you. Ready?' },
    { id: 'Energetic', title: 'Energetic', desc: 'Upbeat and fast-paced.', icon: 'bolt', defaultPreview: 'Let\'s get started! Time to note down something great.' }
  ];

  useEffect(() => {
    const localizePresets = async () => {
      const currentLanguage = settings.language.split(' — ')[0];
      const newPresets = { ...settings.voiceStylePresets };
      let changed = false;

      setIsLocalizing(true);
      for (const style of styles) {
        const key = `${style.id}_${currentLanguage}`;
        if (!newPresets[key]) {
          const localized = await generateLocalizedPhrase(
            style.defaultPreview, 
            settings.language + ` in a ${style.id} style with local culture`
          );
          newPresets[key] = localized;
          changed = true;
        }
      }
      if (changed) onUpdate({ ...settings, voiceStylePresets: newPresets });
      setIsLocalizing(false);
    };
    localizePresets();
  }, [settings.language]);

  const getCurrentPreview = (styleId: Settings['voiceStyle']) => {
    const currentLanguage = settings.language.split(' — ')[0];
    const key = `${styleId}_${currentLanguage}`;
    return settings.voiceStylePresets[key] || styles.find(s => s.id === styleId)?.defaultPreview || "";
  };

  const handleUpdateStyle = async (style: Settings['voiceStyle']) => {
    onUpdate({ ...settings, voiceStyle: style });
    // Auto-play the preset for this style
    handleTest(style);
  };

  const handlePresetEdit = (styleId: Settings['voiceStyle'], newText: string) => {
    const currentLanguage = settings.language.split(' — ')[0];
    const key = `${styleId}_${currentLanguage}`;
    onUpdate({
      ...settings,
      voiceStylePresets: { ...settings.voiceStylePresets, [key]: newText }
    });
  };

  const handleTest = async (styleId?: Settings['voiceStyle']) => {
    setIsTesting(true);
    const targetStyle = styleId || settings.voiceStyle;
    const voiceName = getVoiceName({ ...settings, voiceStyle: targetStyle });
    const textToSay = getCurrentPreview(targetStyle);
    await testVoiceOutput(textToSay, voiceName, settings.voiceVolume, settings.voiceSpeed);
    setIsTesting(false);
  };

  return (
    <div className="h-full flex flex-col bg-background-light dark:bg-background-dark animate-in slide-in-from-right duration-300">
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-4 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <button onClick={onBack} className="flex items-center justify-center size-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold">Voice Style</h1>
        <div className="size-10 flex items-center justify-center">
          {isLocalizing && <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
        </div>
      </header>

      <main className="flex-1 px-4 py-6 flex flex-col gap-5 overflow-y-auto pb-32">
        <section className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Personality ({settings.language.split(' — ')[0]})</p>
          {styles.map((style) => {
            const isActive = settings.voiceStyle === style.id;
            const currentText = getCurrentPreview(style.id);

            return (
              <div
                key={style.id}
                className={`flex flex-col p-5 rounded-[32px] border-2 transition-all duration-300 relative group overflow-hidden ${
                  isActive ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between relative z-10 mb-4">
                  <button onClick={() => handleUpdateStyle(style.id)} className="flex items-center gap-4 flex-1 text-left">
                    <div className={`size-12 rounded-2xl flex items-center justify-center transition-colors ${isActive ? 'bg-primary text-white shadow-lg' : 'bg-primary/10 text-primary'}`}>
                      <span className="material-symbols-outlined text-2xl">{style.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-base">{style.title}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">{style.desc}</p>
                    </div>
                  </button>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleTest(style.id)} disabled={isTesting} className={`size-10 rounded-xl flex items-center justify-center transition-all ${isActive ? 'text-primary bg-primary/10' : 'text-slate-300 hover:text-slate-500 bg-slate-50 dark:bg-slate-800'}`}>
                      <span className="material-symbols-outlined text-xl">{isTesting && isActive ? 'graphic_eq' : 'play_circle'}</span>
                    </button>
                    <div className={`size-6 flex items-center justify-center rounded-full transition-all ${isActive ? 'bg-primary text-white' : 'border-2 border-slate-200 dark:border-slate-700'}`}>
                      {isActive && <span className="material-symbols-outlined text-[14px] font-bold">check</span>}
                    </div>
                  </div>
                </div>
                
                <div className={`relative rounded-2xl border-l-4 transition-all overflow-hidden p-4 ${isActive ? 'bg-white dark:bg-slate-800 border-primary shadow-sm' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
                  <textarea
                    value={currentText}
                    onChange={(e) => handlePresetEdit(style.id, e.target.value)}
                    className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm italic font-medium leading-relaxed resize-none text-slate-800 dark:text-slate-200"
                    rows={2}
                    placeholder="Enter style preview..."
                  />
                  <div className="absolute top-2 right-3 opacity-20">
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md shadow-2xl">
        <button onClick={onBack} className="w-full h-14 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all">
          Confirm Style
        </button>
      </footer>
    </div>
  );
};

export default VoiceStylePage;

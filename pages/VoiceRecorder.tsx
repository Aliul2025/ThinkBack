
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { Settings } from '../types';
import { getVoiceName } from '../geminiService';

// Manual implementation of encode/decode as per guidelines
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

interface VoiceRecorderProps {
  onComplete: (transcription: string) => void;
  onCancel: () => void;
  settings: Settings;
  systemInstruction?: string;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  onComplete, 
  onCancel,
  settings,
  systemInstruction = `You are ${settings.assistantName}, a professional scribe. Transcribe the user's speech into clear, well-formatted text notes. Respond briefly if the user addresses you directly, otherwise stay in dictation mode.`
}) => {
  const [seconds, setSeconds] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [isConnecting, setIsConnecting] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Could not connect to the Gemini Live service.");
  
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
    startSession();
    
    return () => {
      clearInterval(timer);
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close().catch(() => {});
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close().catch(() => {});
    }
    sourcesRef.current.forEach(s => {
      try { s.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
  };

  const createBlob = (data: Float32Array): Blob => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  const startSession = async () => {
    try {
      // 1. Initialize Gemini
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // 2. Setup Audio Contexts
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      // Explicitly resume contexts for browser security
      if (inputCtx.state === 'suspended') await inputCtx.resume();
      if (outputCtx.state === 'suspended') await outputCtx.resume();
      
      inputAudioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      // 3. Get User Microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 4. Connect Live API
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            
            // Setup audio input processing only after session is open
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              
              // CRITICAL: Solely rely on sessionPromise resolves
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Transcription
            if (message.serverContent?.inputTranscription) {
              setTranscription(prev => prev + message.serverContent?.inputTranscription?.text);
            }
            if (message.serverContent?.outputTranscription) {
               // We could also show model output transcription if desired
            }

            // Handle Audio Output
            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64EncodedAudioString) {
              const outCtx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              
              const audioBuffer = await decodeAudioData(
                decode(base64EncodedAudioString),
                outCtx,
                24000,
                1
              );
              
              const sourceNode = outCtx.createBufferSource();
              sourceNode.buffer = audioBuffer;
              sourceNode.connect(outCtx.destination);
              
              sourceNode.addEventListener('ended', () => {
                sourcesRef.current.delete(sourceNode);
              });

              sourceNode.start(nextStartTimeRef.current);
              nextStartTimeRef.current = nextStartTimeRef.current + audioBuffer.duration;
              sourcesRef.current.add(sourceNode);
            }

            // Handle Interruptions
            if (message.serverContent?.interrupted) {
              for (const source of sourcesRef.current.values()) {
                try { source.stop(); } catch(e) {}
              }
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error("Gemini Live Error:", e);
            setIsError(true);
            setErrorMessage("Connection failed. Please check your network or try a different browser.");
          },
          onclose: (e) => {
            console.log("Gemini Live closed:", e);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: getVoiceName(settings) } },
          },
          systemInstruction,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        }
      });
      
      sessionPromiseRef.current = sessionPromise;

    } catch (err: any) {
      console.error("VoiceRecorder Init Error:", err);
      setIsError(true);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage("Microphone access was denied. Please check your browser permissions.");
      } else {
        setErrorMessage("Network error: Could not connect to Gemini service.");
      }
    }
  };

  const handleStop = async () => {
    if (sessionPromiseRef.current) {
      const session = await sessionPromiseRef.current;
      session.close();
    }
    cleanup();
    onComplete(transcription || "Voice transcription completed.");
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60).toString().padStart(2, '0');
    const secs = (s % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  if (isError) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center gap-6 bg-background-light dark:bg-background-dark">
        <span className="material-symbols-outlined text-red-500 text-6xl">error</span>
        <h2 className="text-xl font-bold">Network Connection Failed</h2>
        <p className="text-slate-500 text-sm max-w-xs">{errorMessage}</p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button 
            onClick={() => { setIsError(false); setIsConnecting(true); startSession(); }} 
            className="w-full h-14 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20"
          >
            Retry Connection
          </button>
          <button 
            onClick={onCancel} 
            className="w-full h-14 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold rounded-2xl"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center bg-background-light dark:bg-background-dark p-8 animate-in fade-in duration-500">
      <header className="w-full py-4 flex justify-between items-center">
        <button onClick={onCancel} className="size-12 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>
        <div className="px-3 py-1 bg-primary/10 rounded-full border border-primary/20 flex items-center gap-2">
           <div className={`size-2 rounded-full bg-primary ${isConnecting ? 'animate-pulse' : 'animate-ping'}`} />
           <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
             {isConnecting ? 'Connecting...' : `Live Scribe (${settings.assistantName})`}
           </span>
        </div>
        <div className="size-12" />
      </header>

      <main className="flex-1 w-full flex flex-col items-center justify-center gap-10">
        <div className="relative flex items-center justify-center">
          <div className={`absolute size-48 rounded-full bg-accent-blue/10 ${!isConnecting ? 'animate-ping' : ''} duration-[2000ms]`} />
          <div className="absolute size-40 rounded-full bg-accent-blue/20" />
          <div className="relative size-32 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-2xl border border-slate-100 dark:border-slate-700">
            <span className="material-symbols-outlined text-5xl text-accent-blue fill-1">mic</span>
          </div>
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-5xl font-light tabular-nums tracking-tight text-slate-900 dark:text-white">{formatTime(seconds)}</h1>
        </div>

        <div className="w-full flex-1 max-h-48 overflow-y-auto bg-white/50 dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-inner">
          {transcription ? (
            <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed transition-all">
              {transcription}
              <span className="inline-block w-1.5 h-5 bg-primary ml-1 animate-pulse" />
            </p>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-30 gap-2 text-center">
              <span className="material-symbols-outlined">hearing</span>
              <p className="text-sm italic">
                {isConnecting ? 'Establishing secure link...' : 'Listening for your thoughts...'}
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="w-full space-y-6 pb-8 pt-4">
        <button 
          disabled={isConnecting}
          onClick={handleStop}
          className="w-full h-16 bg-primary text-white font-bold rounded-full shadow-xl shadow-primary/30 flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
        >
          <span className="material-symbols-outlined text-2xl fill-1">check_circle</span>
          Save Transcription
        </button>
        <p className="text-[10px] text-center font-bold uppercase tracking-widest text-slate-400">
          Powered by Gemini Live API
        </p>
      </footer>
    </div>
  );
};

export default VoiceRecorder;

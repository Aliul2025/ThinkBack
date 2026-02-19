
import React, { useState, useEffect, useRef } from 'react';
import { extractTextFromImage } from '../geminiService';

interface ScannerProps {
  onCapture: (content: string) => void;
  onCancel: () => void;
}

type ScanMode = 'photo' | 'scan' | 'card';

const Scanner: React.FC<ScannerProps> = ({ onCapture, onCancel }) => {
  const [mode, setMode] = useState<ScanMode>('scan');
  const [capturing, setCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [flashOn, setFlashOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function setupCamera() {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        setError("Camera access denied. Please enable permissions.");
      }
    }

    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const processImage = async (base64: string) => {
    setCapturing(true);
    try {
      const result = await extractTextFromImage(base64, mode);
      onCapture(result);
    } catch (err) {
      setError("Failed to analyze image.");
      setCapturing(false);
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || capturing) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      await processImage(dataUrl.split(',')[1]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        await processImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const getScanInstruction = () => {
    if (mode === 'photo') return "Describe the scene";
    if (mode === 'card') return "Extract contact details";
    return "OCR Document scan";
  };

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-black text-white">
        <span className="material-symbols-outlined text-red-500 text-6xl mb-4">no_photography</span>
        <h2 className="text-xl font-bold mb-4">{error}</h2>
        <button onClick={onCancel} className="px-8 py-3 bg-primary text-white rounded-full font-bold">Go Back</button>
      </div>
    );
  }

  return (
    <div className="h-full relative overflow-hidden bg-black text-white">
      <video 
        ref={videoRef}
        autoPlay 
        playsInline 
        muted
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${capturing ? 'opacity-40 grayscale' : 'opacity-80'}`}
      />
      
      <canvas ref={canvasRef} className="hidden" />
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />

      {flashOn && !capturing && (
        <div className="absolute inset-0 bg-white/10 pointer-events-none z-0" />
      )}

      <header className="absolute top-0 left-0 w-full p-6 pt-12 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={onCancel} className="size-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/10">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex gap-3">
          <button 
            onClick={() => setFlashOn(!flashOn)}
            className={`size-10 rounded-full backdrop-blur-md flex items-center justify-center border transition-colors ${flashOn ? 'bg-primary text-white border-primary' : 'bg-black/30 border-white/10 text-white'}`}
          >
            <span className={`material-symbols-outlined ${flashOn ? 'fill-1' : ''}`}>
              {flashOn ? 'flashlight_on' : 'flashlight_off'}
            </span>
          </button>
          <button 
            onClick={toggleCamera}
            className="size-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-white/20 transition-colors"
          >
            <span className="material-symbols-outlined">flip_camera_ios</span>
          </button>
        </div>
      </header>

      <main className="h-full flex flex-col items-center justify-center p-12">
        <div className="relative w-full aspect-[3/4] rounded-3xl border-2 border-white/30 flex items-center justify-center">
          <div className="absolute -top-1 -left-1 size-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
          <div className="absolute -top-1 -right-1 size-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
          <div className="absolute -bottom-1 -left-1 size-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
          <div className="absolute -bottom-1 -right-1 size-8 border-b-4 border-r-4 border-primary rounded-br-xl" />
          
          <div className="flex flex-col items-center gap-4 z-20">
            {capturing ? (
              <>
                <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_#ec5b13]" />
                <div className="px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-primary/40">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">AI {mode === 'photo' ? 'Analyzing Scene' : mode === 'card' ? 'Reading Contact' : 'OCR Scanning'}...</span>
                </div>
              </>
            ) : (
              <div className="px-4 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{getScanInstruction()}</span>
              </div>
            )}
          </div>
          
          {!capturing && (
            <div className={`absolute top-0 left-0 w-full h-1 bg-primary/40 shadow-[0_0_20px_#ec5b13] animate-[scan_3s_linear_infinite]`} />
          )}
        </div>
      </main>

      <footer className="absolute bottom-0 left-0 w-full p-8 pb-12 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col items-center gap-8">
        <div className="w-full flex items-center justify-between max-w-xs">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="size-12 rounded-xl bg-white/10 border border-white/20 overflow-hidden hover:bg-white/20 transition-all flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-white/50">photo_library</span>
          </button>
          
          <button 
            onClick={handleCapture}
            disabled={capturing}
            className={`relative size-20 rounded-full flex items-center justify-center transition-all ${capturing ? 'scale-90 opacity-50' : 'active:scale-95'}`}
          >
            <div className={`absolute size-24 rounded-full border-2 transition-colors ${capturing ? 'border-primary/40' : 'border-white/40'}`} />
            <div className="absolute size-[4.5rem] rounded-full border-2 border-white/20" />
            <div className={`size-16 rounded-full flex items-center justify-center transition-colors ${capturing ? 'bg-primary shadow-[0_0_20px_#ec5b13]' : 'bg-white'}`}>
              {capturing ? (
                <span className="material-symbols-outlined text-white text-3xl animate-spin">autorenew</span>
              ) : (
                <div className="size-14 rounded-full border-2 border-slate-100" />
              )}
            </div>
          </button>
          
          <div className="size-12 rounded-full flex items-center justify-center">
             <span className="material-symbols-outlined text-white/50 text-2xl">auto_awesome</span>
          </div>
        </div>

        <div className="flex gap-10">
          <button 
            onClick={() => setMode('photo')}
            className={`text-[10px] font-bold uppercase tracking-widest transition-all ${mode === 'photo' ? 'text-primary scale-110' : 'opacity-40'}`}
          >
            Photo
          </button>
          <button 
            onClick={() => setMode('scan')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-widest transition-all ${mode === 'scan' ? 'text-primary scale-110' : 'opacity-40'}`}
          >
            Scan
            {mode === 'scan' && <div className="size-1 rounded-full bg-primary" />}
          </button>
          <button 
            onClick={() => setMode('card')}
            className={`text-[10px] font-bold uppercase tracking-widest transition-all ${mode === 'card' ? 'text-primary scale-110' : 'opacity-40'}`}
          >
            Card
          </button>
        </div>
      </footer>

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
};

export default Scanner;


import React, { useRef, useState, useCallback, useEffect } from 'react';

interface CameraViewProps {
  onCapture: (base64: string) => void;
  onCancel: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1024 }, height: { ideal: 1024 } }, 
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      setError("Unable to access camera. Please check permissions.");
      console.error(err);
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        // Square crop from center
        const size = Math.min(video.videoWidth, video.videoHeight);
        const startX = (video.videoWidth - size) / 2;
        const startY = (video.videoHeight - size) / 2;
        
        canvas.width = 1024;
        canvas.height = 1024;
        context.drawImage(video, startX, startY, size, size, 0, 0, 1024, 1024);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        onCapture(dataUrl.split(',')[1]);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        onCapture(base64.split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950 flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-lg aspect-square rounded-2xl overflow-hidden bg-stone-900 temporal-glow border border-amber-500/30">
        {!error ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover grayscale-[0.3] contrast-[1.1]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-8 text-center text-red-400">
            {error}
          </div>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Overlays */}
        <div className="absolute inset-0 pointer-events-none border-[40px] border-stone-950/40"></div>
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-64 h-80 border-2 border-dashed border-amber-500/50 rounded-[100px]"></div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <button 
          onClick={capture}
          disabled={!isStreaming}
          className="px-8 py-4 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-full font-bold transition-all transform active:scale-95 disabled:opacity-50 shadow-lg shadow-amber-900/20"
        >
          Capture Temporal Echo
        </button>
        
        <label className="px-8 py-4 bg-stone-800 hover:bg-stone-700 text-amber-200 rounded-full font-bold cursor-pointer transition-all border border-amber-500/30">
          Upload Artifact
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>
        
        <button 
          onClick={onCancel}
          className="px-8 py-4 bg-transparent hover:bg-red-900/20 text-red-400 rounded-full font-bold transition-all border border-red-900/30"
        >
          Abort Mission
        </button>
      </div>

      <p className="mt-6 text-stone-500 text-sm max-w-xs text-center">
        Ensure your face is clearly visible and centered for optimal temporal synchronization.
      </p>
    </div>
  );
};

export default CameraView;

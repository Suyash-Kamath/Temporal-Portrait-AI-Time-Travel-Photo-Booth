
import React from 'react';

interface TemporalLoaderProps {
  message: string;
}

const TemporalLoader: React.FC<TemporalLoaderProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-6">
      <div className="relative w-32 h-32">
        <div className="absolute inset-0 border-4 border-amber-500/20 rounded-full animate-ping"></div>
        <div className="absolute inset-2 border-2 border-amber-400/40 rounded-full animate-[spin_3s_linear_infinite]"></div>
        <div className="absolute inset-4 border border-amber-300/60 rounded-full animate-[spin_5s_linear_infinite_reverse]"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      <p className="text-xl font-cinzel text-amber-200 animate-pulse tracking-widest text-center">
        {message}
      </p>
      <div className="w-64 h-1 bg-stone-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-transparent via-amber-500 to-transparent w-full animate-[shimmer_2s_infinite]"></div>
      </div>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default TemporalLoader;

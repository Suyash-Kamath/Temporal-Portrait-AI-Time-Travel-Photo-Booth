
import React, { useState, useEffect } from 'react';
import { AppStep, HistoricalEra, ImageAnalysis, TemporalResult } from './types';
import { HISTORICAL_ERAS } from './constants';
import { analyzePortrait, transportToEra, editTemporalPortrait } from './services/geminiService';
import CameraView from './components/CameraView';
import TemporalLoader from './components/TemporalLoader';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.LANDING);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [result, setResult] = useState<TemporalResult | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');

  const handleCapture = async (base64: string) => {
    setUserImage(base64);
    setStep(AppStep.ANALYSIS);
    setLoading("Analyzing Portrait Metadata...");
    try {
      const result = await analyzePortrait(base64);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  const handleEraSelect = async (era: HistoricalEra) => {
    if (!userImage) return;
    setLoading(`Calibrating Chronometers for ${era.name}...`);
    try {
      const generatedUrl = await transportToEra(userImage, era);
      setResult({
        imageUrl: generatedUrl,
        era,
        originalImage: userImage
      });
      setStep(AppStep.RESULT);
    } catch (err) {
      alert("Temporal drift detected. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleRefine = async () => {
    if (!result || !editPrompt) return;
    setLoading("Applying Temporal Corrections...");
    try {
      const newUrl = await editTemporalPortrait(result.imageUrl, editPrompt);
      setResult(prev => prev ? { ...prev, imageUrl: newUrl } : null);
      setEditPrompt('');
    } catch (err) {
      alert("Unable to modify timeline.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 selection:bg-amber-500/30">
      {/* Header */}
      <nav className="p-6 border-b border-stone-800/50 backdrop-blur-md sticky top-0 z-40 flex justify-between items-center bg-stone-950/80">
        <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => window.location.reload()}>
          <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center text-stone-950 shadow-lg shadow-amber-900/20 group-hover:rotate-12 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-cinzel font-bold text-amber-100 tracking-tighter">Temporal Portrait</h1>
        </div>
        {userImage && (
          <button 
            onClick={() => window.location.reload()}
            className="text-stone-400 hover:text-amber-200 text-sm font-medium transition-colors"
          >
            Reset Timeline
          </button>
        )}
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {loading && <TemporalLoader message={loading} />}

        {!loading && step === AppStep.LANDING && (
          <div className="flex flex-col items-center text-center py-20 space-y-8 animate-fade-in">
            <div className="max-w-2xl space-y-4">
              <h2 className="text-5xl md:text-7xl font-serif italic text-white leading-tight">Your face is a <span className="text-amber-500 not-italic font-cinzel">map of history.</span></h2>
              <p className="text-stone-400 text-lg md:text-xl font-light leading-relaxed">
                Step into our AI-powered photo booth to transcend time. Gemini will analyze your features and transport your likeness to meticulously recreated historical eras.
              </p>
            </div>
            
            <button 
              onClick={() => setStep(AppStep.CAPTURE)}
              className="group relative px-10 py-5 bg-amber-600 text-stone-950 rounded-full font-bold text-xl overflow-hidden shadow-2xl shadow-amber-900/40 transition-all hover:scale-105"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="relative z-10">Enter the Rift</span>
            </button>

            <div className="grid grid-cols-3 gap-4 max-w-xl opacity-30">
                <img src="https://picsum.photos/seed/hist1/300/300" className="rounded-xl grayscale" />
                <img src="https://picsum.photos/seed/hist2/300/300" className="rounded-xl grayscale" />
                <img src="https://picsum.photos/seed/hist3/300/300" className="rounded-xl grayscale" />
            </div>
          </div>
        )}

        {!loading && step === AppStep.CAPTURE && (
          <CameraView 
            onCapture={handleCapture} 
            onCancel={() => setStep(AppStep.LANDING)} 
          />
        )}

        {!loading && step === AppStep.ANALYSIS && analysis && (
          <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-full md:w-1/3 aspect-square rounded-2xl overflow-hidden border-2 border-amber-500/20 shadow-2xl">
                <img src={`data:image/jpeg;base64,${userImage}`} className="w-full h-full object-cover" alt="Captured" />
              </div>
              <div className="flex-1 space-y-6">
                <div>
                  <span className="text-amber-500 font-cinzel text-xs tracking-widest uppercase">Temporal Profile</span>
                  <h3 className="text-4xl font-serif text-white mt-1">Artifact Analysis</h3>
                </div>
                <p className="text-stone-300 text-lg italic leading-relaxed">"{analysis.description}"</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.visualTraits.map((trait, i) => (
                    <span key={i} className="px-3 py-1 bg-stone-900 border border-stone-700 text-stone-400 rounded-full text-sm">
                      {trait}
                    </span>
                  ))}
                </div>
                <div className="pt-4 p-4 bg-amber-500/5 rounded-xl border border-amber-500/10">
                  <p className="text-amber-100 text-sm">
                    <span className="font-bold">Gemini Suggestion:</span> Based on your visual profile, you would thrive in <span className="underline decoration-amber-500 underline-offset-4">{analysis.suggestedEra}</span>.
                  </p>
                </div>
                <button 
                  onClick={() => setStep(AppStep.ERA_SELECTION)}
                  className="w-full py-4 bg-amber-600 text-stone-950 rounded-xl font-bold hover:bg-amber-500 transition-colors"
                >
                  Confirm Sync & Choose Era
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && step === AppStep.ERA_SELECTION && (
          <div className="space-y-10 animate-fade-in">
            <div className="text-center space-y-2">
              <h3 className="text-3xl font-cinzel text-white">Select Destination</h3>
              <p className="text-stone-500">Where would you like to manifest?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {HISTORICAL_ERAS.map((era) => (
                <div 
                  key={era.id}
                  onClick={() => handleEraSelect(era)}
                  className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer border border-stone-800 hover:border-amber-500/50 transition-all transform hover:-translate-y-2"
                >
                  <img src={era.thumbnail} className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={era.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2">
                    <h4 className="text-2xl font-serif text-white">{era.name}</h4>
                    <p className="text-stone-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">{era.description}</p>
                    <div className="pt-2">
                      <span className="text-amber-500 font-cinzel text-xs tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Engage Chronodrive &rarr;</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && step === AppStep.RESULT && result && (
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fade-in">
            <div className="space-y-6">
              <div className="relative group rounded-3xl overflow-hidden shadow-2xl border border-stone-800">
                <img src={result.imageUrl} className="w-full aspect-square object-cover" alt="Result" />
                <div className="absolute bottom-4 left-4 right-4 p-4 bg-stone-950/80 backdrop-blur-md rounded-2xl border border-stone-800 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-stone-500 font-cinzel uppercase">Current Timeline</p>
                    <p className="text-amber-100 font-serif">{result.era.name}</p>
                  </div>
                  <button 
                    onClick={() => {
                        const link = document.createElement('a');
                        link.href = result.imageUrl;
                        link.download = `temporal-portrait-${result.era.id}.png`;
                        link.click();
                    }}
                    className="p-3 bg-stone-800 hover:bg-stone-700 rounded-full text-amber-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(AppStep.ERA_SELECTION)}
                  className="flex-1 py-4 bg-stone-900 border border-stone-800 rounded-xl text-stone-400 hover:text-white hover:border-stone-600 transition-all"
                >
                  Change Destination
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="flex-1 py-4 bg-stone-900 border border-stone-800 rounded-xl text-stone-400 hover:text-white hover:border-stone-600 transition-all"
                >
                  New Portrait
                </button>
              </div>
            </div>

            <div className="space-y-8 flex flex-col justify-center">
              <div className="space-y-2">
                <h3 className="text-4xl font-serif text-white">Timeline Editor</h3>
                <p className="text-stone-400 leading-relaxed">
                  Refine your manifestation. Tell Gemini to add filters, change lighting, or modify the artifacts around you.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {['Add a retro filter', 'Make it cinematic', 'Increase lighting', 'Add more gold', 'Add film grain'].map(suggestion => (
                            <button 
                                key={suggestion}
                                onClick={() => setEditPrompt(suggestion)}
                                className="px-3 py-1 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-full text-xs text-stone-400 transition-colors"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                    <textarea 
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        placeholder="e.g., 'Add a vintage 1950s polaroid effect'..."
                        className="w-full h-32 bg-stone-900 border border-stone-800 rounded-2xl p-4 text-stone-200 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
                    />
                </div>
                <button 
                  onClick={handleRefine}
                  disabled={!editPrompt}
                  className="w-full py-4 bg-amber-600 text-stone-950 rounded-2xl font-bold hover:bg-amber-500 transition-all transform active:scale-[0.98] disabled:opacity-50"
                >
                  Apply Temporal Correction
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-stone-900/50 border border-stone-800/50 border-dashed">
                <p className="text-stone-500 text-sm">
                  <span className="text-amber-500 mr-2">Note:</span> 
                  Temporal edits use the <span className="text-stone-300">Gemini 2.5 Flash Image</span> engine to ensure high-fidelity historical accuracy and creative flexibility.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Decoration */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-900/20 to-transparent"></div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;

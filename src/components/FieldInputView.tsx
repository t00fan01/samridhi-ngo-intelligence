import { useState, useRef } from 'react';
import { Camera, Mic, Loader2, CheckCircle2 } from 'lucide-react';
import type { Need } from '../App';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY!);

async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
  const base64String = await base64EncodedDataPromise;
  return {
    inlineData: { data: base64String, mimeType: file.type },
  };
}

interface FieldInputViewProps {
  onAddNeed: (need: Need) => void;
  onNavigateToDashboard: () => void;
}

export default function FieldInputView({ onAddNeed, onNavigateToDashboard }: FieldInputViewProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'audio') => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      processWithGemini(type, file);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>, type: 'photo' | 'audio') => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      processWithGemini(type, file);
    }
  };

  const processWithGemini = async (type: 'photo' | 'audio', file: File) => {
    setIsProcessing(true);
    setSuccess(false);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `Analyze this uploaded ${type === 'photo' ? 'image' : 'audio'} of a field worker report. Extract the community need, location, and urgency level. You MUST return ONLY a raw JSON object. Do not include markdown formatting. Ensure keys are strictly: id, location, needType, urgency, description. If the file is NOT a field report, return exactly: {"id": 99, "location": "Unknown", "needType": "Invalid File", "urgency": "Low", "description": "No valid report detected"}`;

      const filePart = await fileToGenerativePart(file);
      const result = await model.generateContent([prompt, filePart]);
      const responseText = result.response.text();

      const cleanedText = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsedNeed = JSON.parse(cleanedText);

      const newNeed: Need = {
        ...parsedNeed,
        id: parsedNeed.id || Date.now(),
        timestamp: new Date().toISOString()
      };

      onAddNeed(newNeed);
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setSelectedFile(null);
      }, 3000);
    } catch (error) {
      console.error(error);
      alert("Failed to extract data using Gemini API.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-50 flex flex-col items-center p-6 relative">
      {/* Background Dots */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-60 z-0"></div>
      
      <div className="relative z-10 w-full max-w-5xl flex flex-col gap-8 items-center mt-4">
        
        {/* Workflow Stepper */}
        <div className="w-full flex items-center justify-center gap-2 sm:gap-4 md:gap-8 font-medium text-sm text-slate-600 bg-white shadow-sm py-4 px-6 rounded-full border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-700 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold">1</span>
            <span className="hidden sm:block">Capture Messy Data</span>
          </div>
          <div className="hidden md:block w-8 h-px bg-slate-300"></div>
          <div className="text-slate-400">➔</div>
          <div className="flex items-center gap-2">
            <span className="bg-teal-100 text-teal-700 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold">2</span>
            <span className="hidden sm:block">AI Extraction</span>
          </div>
          <div className="hidden md:block w-8 h-px bg-slate-300"></div>
          <div className="text-slate-400">➔</div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-700 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold">3</span>
            <span className="hidden sm:block">Live Dispatch</span>
          </div>
        </div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Upload Card */}
          <div className="lg:col-span-8 bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200 transform transition-all">
            <div className="bg-gradient-to-r from-indigo-700 to-teal-600 p-8 text-center text-white">
              <h2 className="text-3xl font-extrabold mb-2">Field Worker Input</h2>
              <p className="text-indigo-50 opacity-90 text-sm">Enterprise-Grade Neural Extraction</p>
            </div>
            
            <div className="p-8 space-y-6 flex flex-col items-center">
              {/* Dropzone 1 */}
              <button 
                onClick={() => photoInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, 'photo')}
                disabled={isProcessing}
                className="w-full group relative flex flex-col items-center justify-center gap-3 bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl p-10 hover:bg-indigo-50 hover:border-teal-500 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                <div className="bg-white p-5 rounded-2xl shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Camera className="w-10 h-10 text-indigo-600" />
                </div>
                <span className="font-bold text-lg text-slate-800 mt-2">Upload Photo of Survey</span>
                <span className="text-sm font-medium text-slate-500">Supports JPG, PNG (Handwritten or Printed)</span>
              </button>
              <input type="file" accept="image/*" ref={photoInputRef} onChange={(e) => handleFileChange(e, 'photo')} className="hidden" />

              {/* Dropzone 2 */}
              <button 
                onClick={() => audioInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, 'audio')}
                disabled={isProcessing}
                className="w-full group relative flex flex-col items-center justify-center gap-3 bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl p-10 hover:bg-teal-50 hover:border-teal-500 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                <div className="bg-white p-5 rounded-2xl shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Mic className="w-10 h-10 text-teal-600" />
                </div>
                <span className="font-bold text-lg text-slate-800 mt-2">Record / Upload Voice Note</span>
                <span className="text-sm font-medium text-slate-500">Supports MP3, WAV (Auto-detects regional dialects)</span>
              </button>
              <input type="file" accept="audio/*" ref={audioInputRef} onChange={(e) => handleFileChange(e, 'audio')} className="hidden" />

              {selectedFile && (
                <div className="w-full flex flex-col items-center pt-2 pb-0 opacity-80 animate-pulse">
                  <p className="text-sm font-semibold text-slate-600 truncate max-w-sm px-4 py-2 bg-slate-100 rounded-lg">
                    Attached: {selectedFile.name}
                  </p>
                </div>
              )}
              
              {isProcessing && (
                <div className="w-full flex flex-col items-center pt-4 pb-2 animate-pulse transition-opacity">
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
                  <p className="text-indigo-700 font-bold tracking-wide">Gemini 2.5 Flash is analyzing...</p>
                </div>
              )}

              {success && (
                <div className="w-full flex flex-col items-center pt-4 pb-2 text-emerald-600 transition-opacity">
                  <CheckCircle2 className="w-10 h-10 mb-2" />
                  <p className="font-bold text-lg">Need extracted and automatically logged!</p>
                </div>
              )}

              <div className="pt-2 w-full">
                <button
                  onClick={() => onNavigateToDashboard()}
                  className="w-full mt-2 bg-slate-900 text-white rounded-2xl py-4 font-bold text-lg hover:bg-indigo-600 hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                >
                  Go to Live Dashboard <span className="group-hover:translate-x-1 transition-transform">➔</span>
                </button>
              </div>
            </div>
          </div>

          {/* System Status Panel */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden sticky top-24">
              <div className="bg-slate-900 p-6 flex items-center justify-between">
                <h3 className="text-white font-bold text-lg">System Status</h3>
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: '75ms' }}></div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 hover:bg-slate-100 transition-colors">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-none">
                    <div className="w-4 h-4 bg-indigo-500 rounded-full relative">
                      <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-75"></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Language Model</p>
                    <p className="font-bold text-slate-700 text-sm">Gemini 2.5 Flash: Connected</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 hover:bg-slate-100 transition-colors">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-none">
                    <div className="w-4 h-4 bg-teal-500 rounded-full relative">
                      <div className="absolute inset-0 bg-teal-500 rounded-full animate-ping opacity-75" style={{ animationDelay: '150ms' }}></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Processing</p>
                    <p className="font-bold text-slate-700 text-sm">Multimodal Engine: Active</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 hover:bg-slate-100 transition-colors">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-none">
                    <div className="w-4 h-4 bg-emerald-500 rounded-full relative">
                      <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Geography</p>
                    <p className="font-bold text-slate-700 text-sm">Spatial Routing: Ready</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

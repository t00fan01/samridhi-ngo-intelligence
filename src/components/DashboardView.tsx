import { useState } from 'react';
import { Map, AlertTriangle, List, TrendingUp, Package, AlertCircle, Loader2, CheckCircle2, Volume2 } from 'lucide-react';
import type { Need } from '../App';

interface DashboardViewProps {
  needs: Need[];
}

export default function DashboardView({ needs }: DashboardViewProps) {
  const [dispatchStatus, setDispatchStatus] = useState<Record<number, 'idle' | 'loading' | 'success'>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleDispatch = (need: Need) => {
    setDispatchStatus(prev => ({ ...prev, [need.id]: 'loading' }));
    
    setTimeout(() => {
      setDispatchStatus(prev => ({ ...prev, [need.id]: 'success' }));
      setToastMessage(`Alert sent to 3 nearby volunteers in ${need.location} for ${need.needType}.`);
      
      setTimeout(() => {
        setToastMessage(null);
      }, 4000);
    }, 1500);
  };

  const handleSpeak = (need: Need) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(
      `Attention: ${need.urgency} urgency need for ${need.needType} reported at ${need.location}.`
    );
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes('Google UK English Female') || 
      v.name.includes('Samantha') || 
      v.name.includes('Microsoft Zira') ||
      v.name.includes('Google US English')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };

  const highUrgencyCount = needs.filter(n => n.urgency === 'High').length;
  const totalNeeds = needs.length;

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 shadow-md border border-slate-100 flex items-center gap-4 hover:shadow-lg transition-shadow">
          <div className="bg-indigo-100 p-4 rounded-xl text-indigo-600">
            <List className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Needs Logged</p>
            <p className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">{totalNeeds}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 shadow-md border border-slate-100 flex items-center gap-4 hover:shadow-lg transition-shadow">
          <div className="bg-red-100 p-4 rounded-xl text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">High Urgency Alerts</p>
            <p className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">{highUrgencyCount}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 shadow-md border border-slate-100 flex items-center gap-4 hover:shadow-lg transition-shadow">
          <div className="bg-teal-100 p-4 rounded-xl text-teal-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Recent Activity</p>
            <p className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              {totalNeeds > 0 ? needs.length : 0}
            </p> 
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[500px]">
        {/* Left Column: Feed */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden max-h-[600px]">
          <div className="bg-slate-50 flex-none p-4 border-b border-slate-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-800">Extracted Needs Feed</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {needs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                <AlertCircle className="w-10 h-10 opacity-50" />
                <p>No needs logged yet.</p>
              </div>
            ) : (
              needs.map(need => (
                <div key={need.id} className={`p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border-l-4 animate-in slide-in-from-top-4 fade-in duration-500 ${need.urgency === 'High' ? 'border-l-red-500' : need.urgency === 'Medium' ? 'border-l-yellow-500' : 'border-l-indigo-500'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-slate-900">{need.needType}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSpeak(need)}
                        className="p-1 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Read out loud"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <span className={`text-xs px-2.5 py-1 font-semibold rounded-full shadow-sm ${
                        need.urgency === 'High' 
                          ? 'bg-red-100 text-red-700 border border-red-200' 
                          : need.urgency === 'Medium'
                            ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                            : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                      }`}>
                        {need.urgency}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{need.description}</p>
                  <div className="flex justify-between items-center text-xs text-slate-500 font-medium mb-3">
                    <span className="flex items-center gap-1">
                      <Map className="w-3 h-3" />
                      {need.location}
                    </span>
                    <span>
                      {new Date(need.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  {need.needType !== 'Invalid File' && (
                    <button
                      onClick={() => handleDispatch(need)}
                      disabled={dispatchStatus[need.id] === 'loading' || dispatchStatus[need.id] === 'success'}
                      className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                        dispatchStatus[need.id] === 'success'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-indigo-500/50 hover:shadow-lg'
                      } disabled:opacity-80`}
                    >
                      {dispatchStatus[need.id] === 'loading' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Locating volunteers...
                        </>
                      ) : dispatchStatus[need.id] === 'success' ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Dispatch SMS Sent!
                        </>
                      ) : (
                        'Auto-Dispatch Volunteers'
                      )}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Interactive Map Integration */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 overflow-hidden shadow-xl relative h-[400px] lg:h-auto z-0 bg-white">
          <iframe width="100%" height="100%" style={{ minHeight: '400px', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }} frameBorder="0" src="https://www.openstreetmap.org/export/embed.html?bbox=77.0,22.0,79.0,24.0&layer=mapnik"></iframe>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-50">
          <div className="bg-emerald-500/20 p-2 rounded-full">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="font-medium text-slate-50">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}

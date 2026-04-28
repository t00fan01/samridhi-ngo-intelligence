import { useState, useEffect } from 'react';
import { LayoutDashboard, Smartphone, Menu, X } from 'lucide-react';
import FieldInputView from './components/FieldInputView';
import DashboardView from './components/DashboardView';

export type Urgency = 'High' | 'Medium' | 'Low';

export type Need = {
  id: number;
  location: string;
  needType: string;
  urgency: Urgency;
  description: string;
  timestamp: string;
};

type ViewMode = 'field' | 'coordinator';

export default function App() {
  const [view, setView] = useState<ViewMode>('field');
  const [needs, setNeeds] = useState<Need[]>(() => {
    try {
      const saved = localStorage.getItem('samridhi_needs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('samridhi_needs', JSON.stringify(needs));
  }, [needs]);

  const handleAddNeed = (need: Need) => {
    setNeeds(prev => [need, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans transition-colors duration-300">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-indigo-600 to-teal-500 p-2 rounded-xl shadow-sm">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-teal-500">
                Samridhi
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:flex space-x-2 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setView('field')}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                  view === 'field' 
                    ? 'bg-white text-indigo-700 shadow shadow-slate-200' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Field Input
              </button>
              <button
                onClick={() => setView('coordinator')}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                  view === 'coordinator' 
                    ? 'bg-white text-indigo-700 shadow shadow-slate-200' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </button>
            </div>

            {/* Mobile Navigation Toggle */}
            <div className="sm:hidden flex items-center">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-600 hover:text-indigo-600 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-100 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={() => { setView('field'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center px-3 py-3 rounded-md text-base font-medium transition-colors ${
                  view === 'field' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-5 h-5 mr-3" />
                Field Worker Input
              </button>
              <button
                onClick={() => { setView('coordinator'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center px-3 py-3 rounded-md text-base font-medium transition-colors ${
                  view === 'coordinator' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-5 h-5 mr-3" />
                Coordinator Dashboard
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1 flex flex-col transition-opacity duration-500">
        {view === 'field' ? (
          <FieldInputView onAddNeed={handleAddNeed} onNavigateToDashboard={() => setView('coordinator')} />
        ) : (
          <DashboardView needs={needs} />
        )}
      </main>
    </div>
  );
}

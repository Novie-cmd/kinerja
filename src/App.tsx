import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FormInput from './components/FormInput';
import ReportHistory from './components/ReportHistory';
import AppsScriptHub from './components/AppsScriptHub';
import { KinerjaReport, AppSettings } from './types';
import { Send, FileText, Settings } from 'lucide-react';

const LOCAL_STORAGE_REPORTS_KEY = 'ekinerja_reports_data';
const LOCAL_STORAGE_SETTINGS_KEY = 'ekinerja_settings_data';

// Initial sample seed reports
const SEED_REPORTS: KinerjaReport[] = [
  {
    id: 'rep_seed_1',
    tanggal: '2026-05-27',
    waktu: '09:15',
    uraian: 'Mengikuti pertemuan teknis koordinasi sosialisasi aplikasi E-Kinerja Mandiri Instansi NTB dan verifikasi format data penyerapan anggaran Triwulan II.',
    fotoName: 'foto_sosialisasi.jpg',
    fotoUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600',
    link: 'https://drive.google.com/drive/folders/ekinerja-sosialisasi-ntb',
    status: 'Sent',
    timestamp: Date.now() - 24 * 60 * 60 * 1000
  },
  {
    id: 'rep_seed_2',
    tanggal: '2026-05-28',
    waktu: '08:30',
    uraian: 'Melakukan verifikasi berkas administrasi pengajuan dinas untuk evaluasi kinerja harian dan koordinasi fungsional pranata komputer.',
    fotoName: 'berkas_verifikasi_kegiatan.png',
    fotoUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600',
    link: 'https://docs.google.com/spreadsheets/d/ekinerja-verifikasi-log',
    status: 'Sent',
    timestamp: Date.now() - 3 * 60 * 60 * 1000
  }
];

const DEFAULT_SETTINGS: AppSettings = {
  gasUrl: '',
  employeeName: 'Ahmad Fauzi, S.Kom',
  employeeId: '19920315 201804 1 003',
  position: 'Pranata Komputer Ahli Pertama - Dinas Kominfotik'
};

export default function App() {
  // Tabs State
  const [activeTab, setActiveTab] = useState<'formulir' | 'riwayat' | 'integrasi'>('formulir');
  
  // Reports Lists
  const [reports, setReports] = useState<KinerjaReport[]>([]);
  
  // App Settings
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Initialize and load persistent data
  useEffect(() => {
    // Load setting
    const storedSettings = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
    if (storedSettings) {
      try {
        setSettings(JSON.parse(storedSettings));
      } catch (e) {
        console.error('Error parsing settings', e);
      }
    }

    // Load reports
    const storedReports = localStorage.getItem(LOCAL_STORAGE_REPORTS_KEY);
    if (storedReports) {
      try {
        const parsed = JSON.parse(storedReports);
        if (parsed && parsed.length > 0) {
          setReports(parsed);
          return;
        }
      } catch (e) {
        console.error('Error parsing reports', e);
      }
    }
    
    // Fallback seed
    setReports(SEED_REPORTS);
    localStorage.setItem(LOCAL_STORAGE_REPORTS_KEY, JSON.stringify(SEED_REPORTS));
  }, []);

  const handleAddReport = (newReport: KinerjaReport) => {
    const updated = [newReport, ...reports];
    setReports(updated);
    localStorage.setItem(LOCAL_STORAGE_REPORTS_KEY, JSON.stringify(updated));
  };

  const handleDeleteReport = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data laporan kinerja harian ini dari log HP?')) {
      const updated = reports.filter(item => item.id !== id);
      setReports(updated);
      localStorage.setItem(LOCAL_STORAGE_REPORTS_KEY, JSON.stringify(updated));
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Apakah Anda ingin menghapus seluruh riwayat log laporan di aplikasi ini? Tindakan ini tidak menghapus data yang telah tersimpan di Google Sheets Anda.')) {
      setReports([]);
      localStorage.removeItem(LOCAL_STORAGE_REPORTS_KEY);
    }
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(newSettings));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-start lg:py-10 lg:px-4 font-sans antialiased text-slate-800" id="main-view-wrapper">
      
      {/* Premium Natural Ambient Overlay */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-indigo-150/40 via-indigo-50/10 to-transparent pointer-events-none z-0"></div>

      {/* Centered Smartphone Container */}
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-xl flex justify-center z-10" id="phone-app-container">
        
        {/* Smartphone Simulator Frame Wrapper on Desktop */}
        <div className="w-full bg-slate-950 lg:border-[10px] lg:border-slate-800 lg:rounded-[42px] lg:shadow-2xl overflow-hidden relative flex flex-col justify-between" style={{ minHeight: '100vh', maxHeight: '100vh' }} id="simulated-smartphone">
            
            {/* Top Ear Speaker Indicator (Invisible on actual phone screens) */}
            <div className="hidden lg:block absolute top-2.5 left-1/2 transform -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-full z-20"></div>

            {/* Main Inside Frame */}
            <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50/70 scrollbar-none" id="internal-viewport">
              {/* Official Elegant Header */}
              <Header 
                hasGasUrl={!!settings.gasUrl} 
                employeeName={settings.employeeName}
                employeeId={settings.employeeId}
              />

              {/* Main Tab Views Scrollable Container */}
              <main className="flex-1 px-4 py-5 pb-24 overflow-y-auto" id="app-content-view">
                {activeTab === 'formulir' && (
                  <FormInput 
                    settings={settings} 
                    onAddReport={handleAddReport} 
                  />
                )}
                
                {activeTab === 'riwayat' && (
                  <ReportHistory 
                    reports={reports} 
                    onDeleteReport={handleDeleteReport}
                    onClearAll={handleClearAll}
                  />
                )}
                
                {activeTab === 'integrasi' && (
                  <AppsScriptHub 
                    settings={settings}
                    onSaveSettings={handleSaveSettings}
                  />
                )}
              </main>
            </div>

            {/* Elegant Fixed Bottom Navigation for phone feel */}
            <nav className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-100 py-3.5 px-6 flex justify-around items-center z-50 rounded-t-[24px] lg:rounded-b-[32px] shadow-lg shadow-slate-100" id="bottom-navigation-bar">
              <button
                onClick={() => setActiveTab('formulir')}
                className={`flex flex-col items-center gap-1.5 focus:outline-none transition-all cursor-pointer ${
                  activeTab === 'formulir' 
                    ? 'text-indigo-600 font-bold scale-105' 
                    : 'text-slate-400 hover:text-slate-600 font-semibold'
                }`}
                id="btn-nav-form"
              >
                <Send size={18} className={activeTab === 'formulir' ? 'text-indigo-600' : 'text-slate-400'} />
                <span className="text-[10px] tracking-wide">Formulir</span>
              </button>

              <button
                onClick={() => setActiveTab('riwayat')}
                className={`flex flex-col items-center gap-1.5 focus:outline-none transition-all cursor-pointer ${
                  activeTab === 'riwayat' 
                    ? 'text-indigo-600 font-bold scale-105' 
                    : 'text-slate-400 hover:text-slate-600 font-semibold'
                }`}
                id="btn-nav-riwayat"
              >
                <div className="relative">
                  <FileText size={18} className={activeTab === 'riwayat' ? 'text-indigo-600' : 'text-slate-400'} />
                  {reports.length > 0 && (
                    <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-indigo-600 rounded-full text-[8px] text-white flex items-center justify-center font-bold font-mono">
                      {reports.length}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-wide">Riwayat</span>
              </button>

              <button
                onClick={() => setActiveTab('integrasi')}
                className={`flex flex-col items-center gap-1.5 focus:outline-none transition-all cursor-pointer ${
                  activeTab === 'integrasi' 
                    ? 'text-indigo-600 font-bold scale-105' 
                    : 'text-slate-400 hover:text-slate-600 font-semibold'
                }`}
                id="btn-nav-settings"
              >
                <Settings size={18} className={activeTab === 'integrasi' ? 'text-indigo-600' : 'text-slate-400'} />
                <span className="text-[10px] tracking-wide">Integrasi</span>
              </button>
            </nav>

          </div>

        </div>

    </div>
  );
}


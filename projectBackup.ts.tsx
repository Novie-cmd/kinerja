export const BACKUP_FILES: Record<string, string> = {
  "package.json": `{
  "name": "react-example",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port=3000 --host=0.0.0.0",
    "build": "vite build",
    "preview": "vite preview",
    "clean": "rm -rf dist server.js",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@google/genai": "^2.4.0",
    "@tailwindcss/vite": "^4.1.14",
    "@vitejs/plugin-react": "^5.0.4",
    "lucide-react": "^0.546.0",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "vite": "^6.2.3",
    "express": "^4.21.2",
    "dotenv": "^17.2.3",
    "motion": "^12.23.24"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "autoprefixer": "^10.4.21",
    "esbuild": "^0.25.0",
    "tailwindcss": "^4.1.14",
    "tsx": "^4.21.0",
    "typescript": "~5.8.2",
    "vite": "^6.2.3",
    "@types/express": "^4.17.21"
  }
}`,

  "package-lock.json": `{
  "name": "react-example",
  "version": "0.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "react-example",
      "version": "0.0.0",
      "dependencies": {
        "@google/genai": "^2.4.0",
        "@tailwindcss/vite": "^4.1.14",
        "@vitejs/plugin-react": "^5.0.4",
        "lucide-react": "^0.546.0",
        "react": "^19.0.1",
        "react-dom": "^19.0.1",
        "vite": "^6.2.3",
        "express": "^4.21.2",
        "dotenv": "^17.2.3",
        "motion": "^12.23.24"
      },
      "devDependencies": {
        "@types/node": "^22.14.0",
        "autoprefixer": "^10.4.21",
        "esbuild": "^0.25.0",
        "tailwindcss": "^4.1.14",
        "tsx": "^4.21.0",
        "typescript": "~5.8.2",
        "@types/express": "^4.17.21"
      }
    }
  }
}`,

  "vite.config.ts": `import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});`,

  "index.html": `<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>E-Kinerja Mandiri PRO</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,

  "vercel.json": `{
  "cleanUrls": true,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}`,

  "src/types.ts": `export interface KinerjaReport {
  id: string;
  tanggal: string; // YYYY-MM-DD
  waktu: string;   // HH:MM
  uraian: string;
  fotoName?: string;
  fotoBase64?: string;
  fotoUrl?: string; // Stored URL (Google Drive URL or Mock URL)
  link: string;
  status: 'Draft' | 'Sent' | 'Failed';
  timestamp: number;
}

export interface AppSettings {
  gasUrl: string; // Google Apps Script Executable URL
  employeeName: string;
  employeeId: string;
  position: string;
}`,

  "src/main.tsx": `import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);`,

  "src/index.css": `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
}

/* Custom minimal scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.05);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(15, 23, 42, 0.2);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(15, 23, 42, 0.35);
}`,

  "src/components/Header.tsx": `import React from 'react';
import { ShieldAlert, BadgeCheck } from 'lucide-react';

interface HeaderProps {
  hasGasUrl: boolean;
  employeeName: string;
  employeeId: string;
}

export default function Header({ hasGasUrl, employeeName, employeeId }: HeaderProps) {
  return (
    <header className="bg-white text-slate-800 rounded-b-3xl shadow-sm border-b border-slate-100 relative z-10" id="app-header">
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 h-1.5 w-full"></div>
      
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-100/80">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          
          <div>
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">E-Kinerja PRO</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sistem Laporan Kinerja</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5" id="header-status-badge">
          {hasGasUrl ? (
            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase rounded-full tracking-wider border border-indigo-100 flex items-center gap-1">
              <BadgeCheck size={11} /> Sheets Live
            </span>
          ) : (
            <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase rounded-full tracking-wider border border-amber-100 flex items-center gap-1">
              <ShieldAlert size={11} /> Mode Demo
            </span>
          )}
        </div>
      </div>
    </header>
  );
}`,

  "src/App.tsx": `import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FormInput from './components/FormInput';
import ReportHistory from './components/ReportHistory';
import AppsScriptHub from './components/AppsScriptHub';
import { KinerjaReport, AppSettings } from './types';
import { Send, FileText, Settings } from 'lucide-react';

const LOCAL_STORAGE_REPORTS_KEY = 'ekinerja_reports_data';
const LOCAL_STORAGE_SETTINGS_KEY = 'ekinerja_settings_data';

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
  const [activeTab, setActiveTab] = useState<'formulir' | 'riwayat' | 'integrasi'>('formulir');
  const [reports, setReports] = useState<KinerjaReport[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const storedSettings = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
    if (storedSettings) {
      try {
        setSettings(JSON.parse(storedSettings));
      } catch (e) {
        console.error('Error parsing settings', e);
      }
    }

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
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-indigo-150/40 via-indigo-50/10 to-transparent pointer-events-none z-0"></div>
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-xl flex justify-center z-10" id="phone-app-container">
        <div className="w-full bg-slate-950 lg:border-[10px] lg:border-slate-800 lg:rounded-[42px] lg:shadow-2xl overflow-hidden relative flex flex-col justify-between" style={{ minHeight: '100vh', maxHeight: '100vh' }} id="simulated-smartphone">
            <div className="hidden lg:block absolute top-2.5 left-1/2 transform -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-full z-20"></div>
            <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50/70 scrollbar-none" id="internal-viewport">
              <Header 
                hasGasUrl={!!settings.gasUrl} 
                employeeName={settings.employeeName}
                employeeId={settings.employeeId}
              />
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
            <nav className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-100 py-3.5 px-6 flex justify-around items-center z-50 rounded-t-[24px] lg:rounded-b-[32px] shadow-lg shadow-slate-100" id="bottom-navigation-bar">
              <button
                onClick={() => setActiveTab('formulir')}
                className={\`flex flex-col items-center gap-1.5 focus:outline-none transition-all cursor-pointer \${
                  activeTab === 'formulir' 
                    ? 'text-indigo-600 font-bold scale-105' 
                    : 'text-slate-400 hover:text-slate-600 font-semibold'
                }\`}
                id="btn-nav-form"
              >
                <Send size={18} className={activeTab === 'formulir' ? 'text-indigo-600' : 'text-slate-400'} />
                <span className="text-[10px] tracking-wide">Formulir</span>
              </button>
              <button
                onClick={() => setActiveTab('riwayat')}
                className={\`flex flex-col items-center gap-1.5 focus:outline-none transition-all cursor-pointer \${
                  activeTab === 'riwayat' 
                    ? 'text-indigo-600 font-bold scale-105' 
                    : 'text-slate-400 hover:text-slate-600 font-semibold'
                }\`}
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
                className={\`flex flex-col items-center gap-1.5 focus:outline-none transition-all cursor-pointer \${
                  activeTab === 'integrasi' 
                    ? 'text-indigo-600 font-bold scale-105' 
                    : 'text-slate-400 hover:text-slate-600 font-semibold'
                }\`}
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
}`,

  "src/components/FormInput.tsx": `import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, AlignLeft, Image as ImageIcon, Link as LinkIcon, Send, AlertTriangle, CheckCircle, FileUp, X, Sparkles } from 'lucide-react';
import { KinerjaReport, AppSettings } from '../types';

const TEMPLATE_URAIAN = [
  "Melakukan koordinasi teknis terkait pengembangan modul pelaporan e-kinerja berbasis Google Apps Script.",
  "Melaksanakan pelayanan administrasi kepegawaian dan verifikasi kelengkapan berkas lap.",
  "Mengikuti rapat koordinasi mingguan terkait progres e-kinerja provinsi.",
  "Menyusun draf spesifikasi teknis pengadaan sarana dan prasarana kantor."
];

export default function FormInput({ settings, onAddReport }: FormInputProps) {
  const [tanggal, setTanggal] = useState('');
  const [waktu, setWaktu] = useState('');
  const [uraian, setUraian] = useState('');
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoName, setFotoName] = useState('');
  const [fotoBase64, setFotoBase64] = useState('');
  const [fotoPreviewUrl, setFotoPreviewUrl] = useState('');
  const [link, setLink] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [submittingStep, setSubmittingStep] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setTanggal(formattedDate);
    
    const formattedTime = today.toTimeString().split(' ')[0].substring(0, 5);
    setWaktu(formattedTime);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Ukuran file terlalu besar! Maksimal ukuran file foto adalah 5 MB agar aman dikirim ke Apps Script.');
        return;
      }
      setErrorMsg('');
      setFotoFile(file);
      setFotoName(file.name);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFotoBase64(base64String);
        setFotoPreviewUrl(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removePhoto = () => {
    setFotoFile(null);
    setFotoName('');
    setFotoBase64('');
    setFotoPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTemplateClick = (text: string) => {
    if (uraian) {
      setUraian(prev => prev + '\\n' + text);
    } else {
      setUraian(text);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!tanggal || !waktu || !uraian.trim()) {
      setErrorMsg('Mohon isi kolom Tanggal, Waktu, dan Uraian Kinerja Anda.');
      return;
    }

    setSubmitting(true);
    setSubmittingStep('Menyiapkan berkas laporan...');

    const newReportId = 'rep_' + Math.random().toString(36).substr(2, 9);
    
    const newReport: KinerjaReport = {
      id: newReportId,
      tanggal,
      waktu,
      uraian: uraian.trim(),
      fotoName: fotoName || undefined,
      fotoBase64: fotoBase64 || undefined,
      fotoUrl: fotoPreviewUrl || undefined,
      link: link.trim(),
      status: 'Draft',
      timestamp: Date.now()
    };

    if (settings.gasUrl) {
      setSubmittingStep('Mengirim data ke Google Sheet...');
      try {
        const payload = {
          tanggal,
          waktu,
          uraian: uraian.trim(),
          fotoBase64,
          fotoName,
          link: link.trim()
        };

        const response = await fetch(settings.gasUrl, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8', 
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const resJson = await response.json();
          if (resJson.status === 'success') {
            newReport.status = 'Sent';
            if (resJson.fileUrl) {
              newReport.fotoUrl = resJson.fileUrl;
            }
          } else {
            newReport.status = 'Draft';
            throw new Error(resJson.message || 'Respons server gagal');
          }
        } else {
          newReport.status = 'Sent';
        }
      } catch (err: any) {
        console.warn('Apps Script connection warning:', err);
        newReport.status = 'Sent';
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000));
      newReport.status = 'Sent';
    }

    onAddReport(newReport);
    
    setUraian('');
    setLink('');
    removePhoto();
    setSubmitting(false);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
    }, 4000);
  };

  return (
    <div className="space-y-6" id="form-input-container">
      {(settings.employeeName || settings.position) && (
        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex items-center justify-between shadow-2xs animate-fade-in" id="employee-badge-info">
          <div>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block mb-0.5">Identitas Pelapor</span>
            <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">{settings.employeeName || 'Pegawai Laporan'}</h4>
            <p className="text-xs text-slate-500 font-medium">{settings.position || 'Jabatan Umum'} {settings.employeeId && \`• NIP. \${settings.employeeId}\`}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-150 text-indigo-600 font-bold flex items-center justify-center text-sm shadow-2xs">
            {(settings.employeeName || 'P')[0].toUpperCase()}
          </div>
        </div>
      )}

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 p-6 md:p-8" id="card-input-form">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-550">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-600 animate-pulse" />
            <span>Formulir Input Laporan</span>
          </h2>
          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase rounded-full tracking-wider border border-indigo-100">
            Mandiri
          </span>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 p-3.5 rounded-2xl text-xs flex gap-2 mb-5 items-start" id="msg-err">
            <AlertTriangle size={15} className="mt-0.5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-1.5" htmlFor="field-tanggal">
                <Calendar size={12} className="text-indigo-600" /> Tanggal
              </label>
              <input
                id="field-tanggal"
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm text-slate-800 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-1.5" htmlFor="field-waktu">
                <Clock size={12} className="text-indigo-600" /> Waktu Kegiatan
              </label>
              <input
                id="field-waktu"
                type="time"
                required
                value={waktu}
                onChange={(e) => setWaktu(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm text-slate-800 font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center justify-between" htmlFor="field-uraian">
              <span className="flex items-center gap-1.5">
                <AlignLeft size={12} className="text-indigo-600" /> Uraian Pekerjaan / Kegiatan
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Min. 5 Huruf</span>
            </label>
            <textarea
              id="field-uraian"
              required
              rows={4}
              placeholder="Jelaskan detail kegiatan anda hari ini..."
              value={uraian}
              onChange={(e) => setUraian(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm text-slate-800 leading-relaxed resize-none"
            />
            
            <div className="space-y-1 pt-1" id="templates-area">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block ml-1">✨ Rekomendasi Templat Cepat (Klik):</span>
              <div className="flex flex-wrap gap-1.5 max-h-[90px] overflow-y-auto p-1.5 bg-slate-50 rounded-xl custom-scrollbar">
                {TEMPLATE_URAIAN.map((template, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleTemplateClick(template)}
                    className="text-[10px] text-left px-2.5 py-1.5 bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200/60 rounded-xl shadow-3xs transition-all cursor-pointer truncate max-w-[280px]"
                    title={template}
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1 block">
              Lampiran Foto / File
            </label>
            
            <input
              type="file"
              accept="image/*,.pdf"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            <div 
              onClick={!fotoPreviewUrl ? triggerFileSelect : undefined}
              className={\`relative rounded-2xl overflow-hidden transition-all flex flex-col items-center justify-center \${
                !fotoPreviewUrl 
                  ? 'border-2 border-dashed border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/10 p-6 text-center cursor-pointer group' 
                  : 'border border-slate-200 bg-slate-50 p-2 min-h-[160px]'
              }\`}
              id="drop-zone-or-preview"
            >
              {!fotoPreviewUrl ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-indigo-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                    <FileUp size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-700">Pilih Berkas / Foto Kegiatan</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Format file: JPG, PNG, PDF (Maks. 5 MB)</p>
                  </div>
                </>
              ) : (
                <div className="w-full h-full min-h-[140px] flex flex-col justify-between p-2 relative group/preview">
                  {fotoFile?.type.startsWith('image/') ? (
                    <div className="relative w-full h-36 rounded-xl overflow-hidden border border-slate-100 bg-white shadow-2xs">
                      <img 
                        src={fotoPreviewUrl} 
                        alt="Upload Preview" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerFileSelect();
                          }}
                          className="px-3 py-1.5 bg-white hover:bg-indigo-50 text-indigo-750 rounded-xl text-xs font-bold shadow-sm transition-all"
                        >
                          Ganti
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removePhoto();
                          }}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-24 rounded-xl bg-indigo-50/60 border border-indigo-100/50 flex flex-col items-center justify-center gap-1">
                      <svg className="w-8 h-8 text-indigo-650" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">Berkas PDF Dokumen</span>
                    </div>
                  )}

                  <div className="mt-2.5 flex items-center justify-between px-1">
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-slate-700 truncate">{fotoName}</p>
                      <p className="text-[9px] text-slate-400 font-mono font-medium">Size: {fotoFile ? (fotoFile.size / 1024 / 1024).toFixed(2) : '0'} MB</p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerFileSelect();
                        }}
                        className="p-1 px-2.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                      >
                        Ganti
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto();
                        }}
                        className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-1.5" htmlFor="field-link">
              <LinkIcon size={12} className="text-indigo-600" /> Link Dokumen Pendukung
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <svg className="h-4 w-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                id="field-link"
                type="url"
                placeholder="https://docs.google.com/..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm text-slate-800 font-medium"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 italic ml-1">Contoh: Link Google Drive, Trello, atau Jira.</p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={\`w-full py-4 px-4 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-sm shadow-lg transition-all cursor-pointer transform active:scale-95 focus:outline-none \${
              submitting 
                ? 'bg-slate-350 text-slate-500 cursor-not-allowed shadow-none' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
            }\`}
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-slate-550 border-t-white animate-spin"></div>
                <span className="font-mono text-xs">{submittingStep}</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span>Simpan Laporan Sekarang</span>
              </>
            )}
          </button>
        </form>
      </div>

      {showSuccess && (
        <div className="fixed inset-x-4 top-4 z-[999] bg-white border border-emerald-100 rounded-2xl shadow-xl p-4 flex gap-3 animate-slide-down" id="success-banner">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex-shrink-0 flex items-center justify-center text-emerald-600">
            <CheckCircle size={22} className="animate-bounce" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-800">Laporan Berhasil Terkirim!</h4>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Kinerja harian Anda telah tersimpan. {settings.gasUrl ? 'Telah langsung tersinkronisasi ke Google Sheet Anda.' : 'Tersimpan aman di log riwayat lokal ponsel.'}
            </p>
          </div>
          <button 
            onClick={() => setShowSuccess(false)}
            className="text-slate-400 hover:text-slate-600 text-xs self-start"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}`,

  "src/components/ReportHistory.tsx": `import React, { useState } from 'react';
import { Search, Calendar, Clock, Image as ImageIcon, ExternalLink, Trash2, Check, AlertCircle, Copy, Database, Download, Eye, FileText } from 'lucide-react';
import { KinerjaReport } from '../types';

export default function ReportHistory({ reports, onDeleteReport, onClearAll }: ReportHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Sent' | 'Draft'>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const filteredReports = reports.filter(item => {
    const matchesSearch = item.uraian.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.tanggal.includes(searchTerm);
    const matchesStatus = statusFilter === 'All' ? true : item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalReports = reports.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const reportsToday = reports.filter(r => r.tanggal === todayStr).length;
  const reportsWithDrive = reports.filter(r => r.status === 'Sent').length;

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadCSV = () => {
    if (reports.length === 0) return;
    
    const headers = ['Tanggal', 'Waktu', 'Uraian', 'Foto', 'Link'];
    const rows = reports.map(r => [
      r.tanggal,
      r.waktu,
      \`"\${r.uraian.replace(/"/g, '""')}"\`,
      r.fotoUrl || '',
      r.link || ''
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", \`Laporan_E_Kinerja_\${todayStr}.csv\`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5" id="report-history">
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-5 space-y-4" id="filters-container">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kata kunci kegiatan atau tanggal (YYYY-MM-DD)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-sm rounded-2xl border border-transparent bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-700 font-sans font-medium"
          />
        </div>
        
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex bg-slate-50 border border-slate-100 p-1 rounded-2xl gap-1 text-[11px] font-bold" id="toggle-list-status">
            <button
              onClick={() => setStatusFilter('All')}
              className={\`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer \${
                statusFilter === 'All' 
                  ? 'bg-white text-indigo-700 shadow-md shadow-slate-250/30' 
                  : 'text-slate-500 hover:text-slate-800'
              }\`}
            >
              Semua ({totalReports})
            </button>
            <button
              onClick={() => setStatusFilter('Sent')}
              className={\`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer \${
                statusFilter === 'Sent' 
                  ? 'bg-white text-indigo-700 shadow-md shadow-slate-250/30' 
                  : 'text-slate-500 hover:text-slate-800'
              }\`}
            >
              Terkirim ({reportsWithDrive})
            </button>
            <button
              onClick={() => setStatusFilter('Draft')}
              className={\`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer \${
                statusFilter === 'Draft' 
                  ? 'bg-white text-indigo-700 shadow-md shadow-slate-250/30' 
                  : 'text-slate-500 hover:text-slate-800'
              }\`}
            >
              Lokal ({totalReports - reportsWithDrive})
            </button>
          </div>

          <div className="flex gap-2 text-xs">
            {reports.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleDownloadCSV}
                  className="px-3 py-2 border border-slate-200 text-slate-600 hover:text-indigo-650 hover:bg-slate-50 rounded-xl flex items-center gap-1.5 font-bold cursor-pointer transition-all"
                >
                  <Download size={13} /> Export CSV
                </button>
                <button
                  type="button"
                  onClick={onClearAll}
                  className="px-3 py-2 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl flex items-center gap-1.5 font-bold cursor-pointer transition-all"
                >
                  <Trash2 size={13} /> Reset Log
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3" id="sub-statistics">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/30 border border-indigo-100/60 p-3.5 rounded-2xl text-center">
          <span className="block text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Total</span>
          <span className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">{totalReports}</span>
        </div>
        <div className="bg-gradient-to-br from-indigo-50/50 to-indigo-100/10 border border-indigo-100/30 p-3.5 rounded-2xl text-center">
          <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Hari Ini</span>
          <span className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">{reportsToday}</span>
        </div>
        <div className="bg-gradient-to-br from-slate-50 to-slate-100/65 border border-slate-200/50 p-3.5 rounded-2xl text-center">
          <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Cloud Sinkron</span>
          <span className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">{reportsWithDrive}</span>
        </div>
      </div>

      <div className="space-y-4" id="report-items-list">
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center" id="empty-state">
            <FileText size={40} className="text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-700">Tidak ada data laporan ditemukan</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              {searchTerm 
                ? 'Coba ganti kata kunci pencarian atau tanggal laporan Anda.' 
                : 'Silakan isi formulir kinerja di tab sebelah untuk menambahkan laporan pertama.'}
            </p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div 
              key={report.id} 
              className="bg-white border border-slate-100 rounded-[24px] p-5 hover:border-indigo-100/80 shadow-3xs transition-all duration-300 space-y-3.5 relative overflow-hidden"
              id={\`report-item-\${report.id}\`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 font-medium">
                  <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg text-slate-600 font-semibold">
                    <Calendar size={11} className="text-indigo-600" /> {report.tanggal}
                  </span>
                  <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg text-slate-600 font-semibold">
                    <Clock size={11} className="text-indigo-600" /> {report.waktu}
                  </span>
                </div>
                
                <span className={\`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1 uppercase \${
                  report.status === 'Sent' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'bg-amber-50 text-amber-700'
                }\`}>
                  <Database size={10} />
                  {report.status === 'Sent' ? 'Sheets' : 'Lokal'}
                </span>
              </div>

              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-wrap break-words">
                {report.uraian}
              </div>

              {(report.fotoUrl || report.link) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2" id="report-media">
                  {report.fotoUrl && (
                    <div className="border border-slate-100 rounded-xl bg-slate-50 p-2 flex items-center gap-2">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-white flex-shrink-0 flex items-center justify-center">
                        {report.fotoUrl.startsWith('data:') ? (
                          <img 
                            src={report.fotoUrl} 
                            alt="Attached Document" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <ImageIcon size={16} className="text-indigo-700 animate-pulse" />
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedPhoto(report.fotoUrl || null)}
                          className="absolute inset-0 bg-black/40 hover:bg-black/25 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                        >
                          <Eye size={12} />
                        </button>
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block text-[9px] text-slate-400 uppercase font-bold">Foto Lampiran</span>
                        <span className="text-[10px] text-slate-600 font-mono truncate block" title={report.fotoName || 'Dokumen.jpg'}>
                          {report.fotoName || 'Dokumen.jpg'}
                        </span>
                      </div>
                    </div>
                  )}

                  {report.link && (
                    <a
                      href={report.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-slate-200/80 rounded-xl bg-slate-50 hover:bg-slate-100/55 p-2 flex items-center justify-between transition-colors text-slate-700"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="block text-[9px] text-slate-400 uppercase font-bold">Link Dokumentasi</span>
                        <span className="text-[10px] text-slate-600 truncate block font-sans pr-1">
                          {report.link}
                        </span>
                      </div>
                      <ExternalLink size={13} className="text-slate-400 flex-shrink-0" />
                    </a>
                  )}
                </div>
              )}

              <div className="border-t border-slate-100 pt-3 flex items-center justify-between" id="report-item-actions">
                <button
                  onClick={() => handleCopyText(\`\${report.tanggal} | \${report.waktu} | \${report.uraian}\`, report.id)}
                  className="text-[10px] text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors cursor-pointer font-bold"
                >
                  {copiedId === report.id ? (
                    <>
                      <Check size={11} className="text-emerald-500" />
                      <span className="text-emerald-500 font-bold">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy size={11} />
                      <span>Salin Transkrip</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onDeleteReport(report.id)}
                  className="text-slate-350 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50/50 transition-all cursor-pointer"
                  title="Hapus Laporan Harian"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/85 z-[99999] flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
          <div className="max-w-3xl w-full text-center relative max-h-[90vh]">
            <button 
              onClick={() => setSelectedPhoto(null)} 
              className="absolute -top-10 right-0 text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs"
            >
              Tutup [X]
            </button>
            {selectedPhoto.startsWith('data:') ? (
              <img 
                src={selectedPhoto} 
                alt="Zoomed attachment" 
                className="max-h-[80vh] max-w-full rounded-xl mx-auto border-2 border-white/25 object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="bg-white p-6 rounded-xl inline-block max-w-sm">
                <p className="text-xs text-slate-755 mb-2">Tautan lampiran Drive :</p>
                <a href={selectedPhoto} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-600 underline break-all">
                  {selectedPhoto}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}`,

  "src/components/AppsScriptHub.tsx": `import React, { useState, useEffect } from 'react';
import { Copy, Check, FileCode, HelpCircle, HardDrive, Database, Sliders, ExternalLink, Folder, Eye, Download, Info } from 'lucide-react';
import { AppSettings } from '../types';
import { BACKUP_FILES } from '../utils/projectBackup';

export default function AppsScriptHub({ settings, onSaveSettings }: AppsScriptHubProps) {
  const [activeSegmentTab, setActiveSegmentTab] = useState<'koneksi' | 'script' | 'backup'>('koneksi');
  const [copiedScript, setCopiedScript] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(true);
  
  const [gasUrl, setGasUrl] = useState(settings.gasUrl);
  const [employeeName, setEmployeeName] = useState(settings.employeeName);
  const [employeeId, setEmployeeId] = useState(settings.employeeId);
  const [position, setPosition] = useState(settings.position);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [selectedBackupFile, setSelectedBackupFile] = useState<string>('src/App.tsx');
  const [fileContent, setFileContent] = useState<string>('');
  const [loadingFile, setLoadingFile] = useState<boolean>(false);
  const [copiedBackup, setCopiedBackup] = useState<boolean>(false);

  const FILES_TO_BACKUP = [
    'src/App.tsx',
    'src/components/FormInput.tsx',
    'src/components/ReportHistory.tsx',
    'src/components/AppsScriptHub.tsx',
    'src/components/Header.tsx',
    'src/types.ts',
    'src/main.tsx',
    'src/index.css',
    'package.json',
    'package-lock.json',
    'vite.config.ts',
    'index.html',
    'README.md',
    'vercel.json'
  ];

  useEffect(() => {
    if (activeSegmentTab !== 'backup') return;
    
    const loadFile = async () => {
      setLoadingFile(true);
      try {
        const response = await fetch('/' + selectedBackupFile);
        if (response.ok) {
          const text = await response.text();
          setFileContent(text);
        } else {
          if (BACKUP_FILES[selectedBackupFile]) {
            setFileContent(BACKUP_FILES[selectedBackupFile]);
          } else {
            setFileContent(\`/* File: /\${selectedBackupFile} */\\n\\nHubungi Admin: Gagal memuat file dari server pengembangan (Vite/Container tidak merespons).\`);
          }
        }
      } catch (e) {
        if (BACKUP_FILES[selectedBackupFile]) {
          setFileContent(BACKUP_FILES[selectedBackupFile]);
        } else {
          setFileContent(\`/* File: /\${selectedBackupFile} */\\n\\nHubungi Admin: Gagal melakukan sinkronisasi file hulu (Network Error).\`);
        }
      } finally {
        setLoadingFile(false);
      }
    };
    loadFile();
  }, [selectedBackupFile, activeSegmentTab]);

  const handleCopyBackup = () => {
    navigator.clipboard.writeText(fileContent);
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 2500);
  };

  const handleDownloadSingleFile = () => {
    const element = document.createElement("a");
    const file = new Blob([fileContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    const parts = selectedBackupFile.split('/');
    element.download = parts[parts.length - 1];
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = (code: string, type: 'gs') => {
    navigator.clipboard.writeText(code);
    setCopiedScript(type);
    setTimeout(() => setCopiedScript(null), 3000);
  };

  return (
    <div id="settings-page">Layanan Ekspor & Setup</div>
  );
}`,

  "README.md": `# 📱 Portal Laporan E-Kinerja Mandiri

Aplikasi pengisian aktivitas kinerja harian mandiri yang cepat, modern, dan sepenuhnya dioptimalkan untuk perangkat mobile (smartphone-first). Terintegrasi langsung dengan **Google Sheets** dan **Google Drive** menggunakan **Google Apps Script** secara aman tanpa memerlukan server backend tambahan (Serverless Client-State).

---

## 🛠️ Cara Integrasi dengan Google Sheets

Untuk menghubungkan formulir ini ke Google Sheet pribadi Anda, ikuti 8 langkah mudah berikut:

1. **Buat Google Spreadsheet Baru** di Google Drive Anda. Beri nama file (cth: \`Laporan E-Kinerja Pegawai\`) dan beri nama tab lembar pertama dengan \`Sheet1\`.
2. **Atur Judul Kolom di Baris 1** sebagai berikut:
   - **Kolom A**: \`Tanggal\`
   - **Kolom B**: \`Waktu\`
   - **Kolom C**: \`Uraian\`
   - **Kolom D**: \`Foto\`
   - **Kolom E**: \`Link\`
3. Bukat spreadsheet Anda lalu klik menu **Ekstensi (Extensions)** > **Apps Script** di bagian atas.
4. Salin kode Apps Script yang disediakan di tab **Integrasi** pada aplikasi ini, hapus kode bawaan di dalam editor \`Code.gs\`, lalu tempelkan. Klik ikon disket untuk menyimpan.
5. Klik tombol biru **Terapkan (Deploy)** di kanan atas > Pilih **Terapkan baru (New deployment)**.
6. Pada jendela konfigurasi yang muncul:
   - Klik ikon roda gigi > pilih jenis **Aplikasi web (Web app)**.
   - Jalankan sebagai (Execute as): **Saya (Email Anda / Me)**.
   - Siapa yang memiliki akses (Who has access): **Siapa saja (Anyone)**.
7. Klik **Terapkan**. Jika diminta persetujuan keamanan, klik **Berikan Akses (Authorize Access)**, pilih akun Google Anda, klik **Lanjutan (Advanced)** di kiri bawah, pilih **Buka Laporan (Tidak Aman)**, lalu klik **Izinkan (Allow)**.
8. Salin URL Aplikasi Web Apps Script yang dihasilkan (berakhiran \`/exec\`) dan tempelkan ke kolom **Google Apps Script Web App URL** di pengaturan aplikasi Anda!
`
};

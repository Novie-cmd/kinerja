/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileSpreadsheet, 
  ShieldAlert, 
  ClipboardCheck, 
  CloudIcon, 
  HelpCircle,
  FileCheck2,
  Clock,
  ArrowRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Laporan, GoogleUser } from './types';
import { initAuth, googleSignIn, logout } from './lib/firebase';
import { getOrCreateSpreadsheet, fetchReportsFromSheet, appendReportToSheet, uploadFileToDrive } from './lib/googleApi';
import { Navbar } from './components/Navbar';
import { ReportForm } from './components/ReportForm';
import { ReportList } from './components/ReportList';

export default function App() {
  // Authentication states
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Workspace integration states
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);
  const [reports, setReports] = useState<Laporan[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Monitor Auth Lifecycle
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser({
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL,
        });
        setAccessToken(token);
        setAuthLoading(false);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setAuthLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch reports helper
  const syncSpreadsheetData = useCallback(async (token: string) => {
    setIsSyncing(true);
    try {
      // 1. Get or create the unique Laporan spreadsheet
      const sheetId = await getOrCreateSpreadsheet(token);
      setSpreadsheetId(sheetId);

      // 2. Load prior entries
      const sheetReports = await fetchReportsFromSheet(sheetId, token);
      setReports(sheetReports);
    } catch (err: any) {
      console.error('Data loading failure:', err);
      // If we encounter a 401, clear out access token to prompt user re-login
      if (err.message && err.message.includes('401')) {
        setAuthError('Sesi login Google Anda telah kedaluwarsa. Silakan lakukan login ulang.');
        handleLogout();
      } else {
        setAuthError(`Sinkronisasi Google Sheets gagal: ${err.message || err}`);
      }
    } finally {
      setIsSyncing(false);
      setDataLoading(false);
    }
  }, []);

  // React to successful login by syncing Sheets
  useEffect(() => {
    if (accessToken) {
      setDataLoading(true);
      setAuthError(null);
      syncSpreadsheetData(accessToken);
    } else {
      setSpreadsheetId(null);
      setReports([]);
    }
  }, [accessToken, syncSpreadsheetData]);

  // Auth Interactive Hooks
  const handleLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser({
          uid: result.user.uid,
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
        });
        setAccessToken(result.accessToken);
      }
    } catch (err: any) {
      console.error('Oauth login error:', err);
      setAuthError(err.message || 'Gagal login via Google Auth.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setAccessToken(null);
      setSpreadsheetId(null);
      setReports([]);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Form submission coordinator
  const handleReportSubmit = async (
    rawLaporan: Omit<Laporan, 'fileUrl' | 'fileId'>,
    file: File | null
  ) => {
    if (!accessToken || !spreadsheetId) {
      throw new Error('Aliran autentikasi Sheets/Drive terputus. Silakan coba masuk ulang.');
    }

    setActionSubmitting(true);
    try {
      let fileUrl = '';
      let fileId = '';

      // 1. Double upload report attachments if present
      if (file) {
        const driveData = await uploadFileToDrive(file, accessToken);
        fileUrl = driveData.fileUrl;
        fileId = driveData.fileId;
      }

      // 2. Prepare database sheet payload
      const finalReport: Laporan = {
        ...rawLaporan,
        fileUrl: fileUrl || undefined,
        fileId: fileId || undefined,
        timestamp: new Date().toLocaleString('id-ID', { timeZoneName: 'short' }),
      };

      // 3. Save directly to Sheet database
      await appendReportToSheet(spreadsheetId, finalReport, accessToken);

      // 4. Trigger lightweight layout updates locally & pull verified rows
      await syncSpreadsheetData(accessToken);
    } catch (err) {
      console.error('Failed to submit report row:', err);
      throw err;
    } finally {
      setActionSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm animate-pulse flex items-center justify-center mb-3">
          <FileSpreadsheet className="h-8 w-8 text-emerald-600 animate-bounce" />
        </div>
        <p className="text-xs font-semibold text-gray-500 font-mono tracking-wider">
          MEMPERSIAPKAN RUANG KERJA...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-gray-800 font-sans">
      
      <AnimatePresence mode="wait">
        {!user ? (
          /* Login Screen Container */
          <motion.div
            key="login-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-radial from-white to-slate-100"
          >
            <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 sm:p-10 space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
              
              {/* BRAND HEADER */}
              <div className="text-center space-y-4">
                <div className="inline-flex bg-emerald-50 text-emerald-600 p-4 rounded-2xl shadow-inner shadow-emerald-100 relative">
                  <ClipboardCheck className="h-10 w-10" />
                  <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-[9px] text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                    Live
                  </span>
                </div>
                
                <div className="space-y-1.5">
                  <h1 className="text-2xl font-sans font-bold text-gray-900 tracking-tight leading-none">
                    Laporan Kinerja Harian
                  </h1>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                    Sistem pelaporan aktivitas kerja otomatis, terhubung langsung secara resmi dengan Google Drive & Google Sheets Anda.
                  </p>
                </div>
              </div>

              {/* INTEGRATION HIGHLIGHT BENTO MINI */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-gray-100/50">
                <div className="text-center space-y-1">
                  <div className="bg-emerald-100/60 p-1.5 rounded-lg inline-block text-emerald-700">
                    <FileSpreadsheet className="w-4 h-4 mx-auto" />
                  </div>
                  <p className="font-semibold text-[10px] text-gray-700">Sheets DB</p>
                  <p className="text-[9px] text-gray-400">Penyimpanan Terstruktur</p>
                </div>
                <div className="text-center space-y-1">
                  <div className="bg-emerald-100/60 p-1.5 rounded-lg inline-block text-emerald-700">
                    <CloudIcon className="w-4 h-4 mx-auto" />
                  </div>
                  <p className="font-semibold text-[10px] text-gray-700">Drive Cloud</p>
                  <p className="text-[9px] text-gray-400">Simpan Foto & File</p>
                </div>
                <div className="text-center space-y-1">
                  <div className="bg-emerald-100/60 p-1.5 rounded-lg inline-block text-emerald-700">
                    <Sparkles className="w-4 h-4 mx-auto" />
                  </div>
                  <p className="font-semibold text-[10px] text-gray-700">Instan</p>
                  <p className="text-[9px] text-gray-400">Sinkronisasi Realtime</p>
                </div>
              </div>

              {/* ERROR WARNING PANEL */}
              {authError && (
                <div className="flex items-start space-x-2 bg-rose-50 border border-rose-100 rounded-2xl p-4 text-rose-800">
                  <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                  <div className="text-xs text-rose-700 leading-tight">
                    <p className="font-bold">Informasi Sistem</p>
                    <p className="mt-0.5">{authError}</p>
                  </div>
                </div>
              )}

              {/* OFFICIALLY DESIGNED GOOGLE AUTH TRIGGER BUTTON */}
              <div className="space-y-4">
                <button 
                  onClick={handleLogin}
                  className="w-full h-12 bg-white hover:bg-slate-50 border border-gray-200 hover:border-gray-300 rounded-xl px-4 flex items-center justify-center space-x-3 shadow-md shadow-gray-100/20 active:scale-[0.99] transition-all cursor-pointer group"
                  id="google-signin-popup-btn"
                >
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 shrink-0">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                    Masuk dengan Akun Google
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all" />
                </button>

                <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                  Kami mengutamakan privasi Anda. Berkas draf, laporan, dan lampiran Anda disimpan langsung secara mandiri di Google Workspace Anda sendiri tanpa perantara server database pihak ketiga.
                </p>
              </div>

            </div>
          </motion.div>
        ) : (
          /* Main Interactive Workspace Area */
          <motion.div
            key="workspace-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col min-h-screen"
          >
            {/* Header / Navbar section */}
            <Navbar
              user={user}
              spreadsheetId={spreadsheetId}
              onLogout={handleLogout}
              onRefresh={() => syncSpreadsheetData(accessToken!)}
              isSyncing={isSyncing}
            />

            {/* Content workspace core */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              
              {/* SYSTEM NOTIFICATION / ERROR AREA (IF INSTANCE STOPS WORKING) */}
              {authError && (
                <div className="mb-6 flex items-start space-x-2.5 bg-rose-50 border border-rose-100 rounded-2xl p-4 text-rose-800">
                  <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                  <div className="text-xs text-rose-700 leading-tight">
                    <p className="font-bold">Informasi Sinkronisasi</p>
                    <p className="mt-0.5">{authError}</p>
                  </div>
                  <button
                    onClick={() => setAuthError(null)}
                    className="ml-auto text-rose-400 hover:text-rose-600 font-sans text-xs font-semibold"
                  >
                    Tutup
                  </button>
                </div>
              )}

              {/* DUAL WORKSPACE LAYOUT Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT COLUMN: The Report entry form (5-cols) */}
                <div className="lg:col-span-5 lg:sticky lg:top-24">
                  <ReportForm
                    onSubmit={handleReportSubmit}
                    isSubmitting={actionSubmitting}
                  />

                  {/* MINI INSTRUCTION BANNER (SO USER ALWAYS SECURES SUCCESS) */}
                  <div className="mt-4 bg-emerald-50/40 border border-emerald-150/40 rounded-2xl p-4 flex items-start space-x-3">
                    <HelpCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <div className="text-xs text-emerald-800/90 leading-relaxed text-left">
                      <p className="font-bold">Cara Kerja Otomasi:</p>
                      <p className="mt-0.5">
                        Setiap formulir yang dikirimkan akan ditambahkan ke Google Sheet di bagian baris terakhir secara aman. Lampiran foto/dokumen diunggah ke Google Drive Anda dan tautan unduhannya (Share link) disertakan otomatis pada kolom laporan.
                      </p>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: The Interactive reports history list (7-cols) */}
                <div className="lg:col-span-7">
                  <ReportList
                    reports={reports}
                    isLoading={dataLoading}
                  />
                </div>

              </div>

            </main>

            {/* High fidelity professional footer element */}
            <footer className="bg-white border-t border-gray-150 py-6 mt-16 text-center text-xs text-gray-400">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p>
                  © {new Date().getFullYear()} Laporan Kinerja Harian. Otomasi Google Workspace terverifikasi keamanan penuh.
                </p>
                <div className="flex items-center space-x-1">
                  <span>Penyimpanan Awan:</span>
                  <span className="font-bold text-gray-500">Google Drive & Sheets API</span>
                </div>
              </div>
            </footer>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

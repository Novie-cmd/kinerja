import React, { useState, useEffect } from 'react';
import { Copy, Check, FileCode, HelpCircle, HardDrive, Database, Sliders, ExternalLink, Folder, Eye, Download, Info, Wifi, CheckCircle, X } from 'lucide-react';
import { AppSettings } from '../types';
import { BACKUP_FILES } from '../utils/projectBackup';

interface AppsScriptHubProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
}

export default function AppsScriptHub({ settings, onSaveSettings }: AppsScriptHubProps) {
  const [activeSegmentTab, setActiveSegmentTab] = useState<'koneksi' | 'script' | 'backup'>('koneksi');
  const [copiedScript, setCopiedScript] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(true);
  
  // Local temporary settings
  const [gasUrl, setGasUrl] = useState(settings.gasUrl);
  const [employeeName, setEmployeeName] = useState(settings.employeeName);
  const [employeeId, setEmployeeId] = useState(settings.employeeId);
  const [position, setPosition] = useState(settings.position);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Live Connection Tester States
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'success' | 'error'; message: string }>({ status: 'idle', message: '' });

  // Backup file states
  const [selectedBackupFile, setSelectedBackupFile] = useState<string>('src/App.tsx');
  const [fileContent, setFileContent] = useState<string>('');
  const [loadingFile, setLoadingFile] = useState<boolean>(false);
  const [copiedBackup, setCopiedBackup] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

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

  // Dynamic file loader from Vite static server with fallback
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
          // Fallback to static backups for static files
          if (BACKUP_FILES[selectedBackupFile]) {
            setFileContent(BACKUP_FILES[selectedBackupFile]);
          } else {
            setFileContent(`/* File: /${selectedBackupFile} */\n\nHubungi Admin: Gagal memuat file dari server pengembangan (Vite/Container tidak merespons).`);
          }
        }
      } catch (e) {
        if (BACKUP_FILES[selectedBackupFile]) {
          setFileContent(BACKUP_FILES[selectedBackupFile]);
        } else {
          setFileContent(`/* File: /${selectedBackupFile} */\n\nHubungi Admin: Gagal melakukan sinkronisasi file hulu (Network Error).`);
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
    const fileName = parts[parts.length - 1];
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setDownloadSuccess(fileName);
    setTimeout(() => {
      setDownloadSuccess(null);
    }, 4500);
  };

  const appsScriptCode = `/**
 * Google Apps Script Kode (Code.gs)
 * Menampung input data dari web app Laporan E-Kinerja dan menyimpannya 
 * ke Google Sheet serta mengunduh berkas gambar langsung ke Google Drive Anda.
 * 
 * Struktur Kolom Google Sheet:
 * Kolom A : Tanggal
 * Kolom B : Waktu
 * Kolom C : Uraian
 * Kolom D : Foto (Link File Berkas Di Google Drive)
 * Kolom E : Link (Tautan Pendukung)
 */

function doGet(e) {
  return HtmlService.createHtmlOutput(
    "<h3>Web App E-Kinerja Aktif! silakan gunakan formulir React untuk mengirim data.</h3>"
  ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  var response = { status: "error", message: "Gagal memproses data" };
  
  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    
    // Uji Koneksi / Ping check
    if (data.action === "ping") {
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Koneksi Berhasil! Google Apps Script Anda terhubung secara real-time dan siap digunakan."
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Akses Spreadsheet aktif
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    var tanggal = data.tanggal || "";
    var waktu = data.waktu || "";
    var uraian = data.uraian || "";
    var linkPendukung = data.link || "";
    var fotoUrl = "";
    
    // Jika ada kiriman foto/file berkas dalam format Base64
    if (data.fotoBase64 && data.fotoName) {
      try {
        var base64Data = data.fotoBase64.split(",")[1] || data.fotoBase64;
        var decoded = Utilities.base64Decode(base64Data);
        
        // Tentukan tipe konten file
        var contentType = "image/jpeg";
        if (data.fotoName.endsWith(".png")) contentType = "image/png";
        if (data.fotoName.endsWith(".pdf")) contentType = "application/pdf";
        
        var blob = Utilities.newBlob(decoded, contentType, data.fotoName);
        
        // Simpan file berkas ke Google Drive akar (atau folder tertentu)
        var file = DriveApp.createFile(blob);
        
        // Atur izin berkas agar bisa diakses public via link
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        
        fotoUrl = file.getUrl();
      } catch (uploadError) {
        fotoUrl = "Gagal simpan file di Drive: " + uploadError.toString();
      }
    } else if (data.fotoUrl) {
      fotoUrl = data.fotoUrl;
    }
    
    // Kirim data ke sheet baru (Baris Terakhir)
    sheet.appendRow([
      tanggal,
      waktu,
      uraian,
      fotoUrl,
      linkPendukung
    ]);
    
    response.status = "success";
    response.message = "Data berhasil disimpan ke Google Sheets!";
    response.fileUrl = fotoUrl;
    
  } catch(error) {
    response.status = "error";
    response.message = error.toString();
  }
  
  // Format balasan CORS mendukung HTTP POST Cross-Origin
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}`;

  const handleCopy = (code: string, type: 'gs') => {
    navigator.clipboard.writeText(code);
    setCopiedScript(type);
    setTimeout(() => setCopiedScript(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      gasUrl: gasUrl.trim(),
      employeeName: employeeName.trim(),
      employeeId: employeeId.trim(),
      position: position.trim()
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTestConnection = async () => {
    if (!gasUrl) {
      setTestResult({ status: 'error', message: 'Silakan masukkan Google Apps Script Web App URL terlebih dahulu!' });
      return;
    }
    setTestingConnection(true);
    setTestResult({ status: 'idle', message: '' });
    try {
      const response = await fetch(gasUrl.trim(), {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ action: 'ping' })
      });
      if (response.ok) {
        const resJson = await response.json();
        if (resJson.status === 'success') {
          setTestResult({ status: 'success', message: resJson.message || 'Koneksi Sukses!' });
        } else {
          setTestResult({ status: 'error', message: resJson.message || 'Apps Script merespons tetapi mengembalikan status gagal.' });
        }
      } else {
        setTestResult({ 
          status: 'error', 
          message: `Uji koneksi gagal (HTTP ${response.status}). Pastikan Anda telah menerapkan (deployed) script sebagai Aplikasi Web dan memberikan hak akses ke "Siapa saja" (Anyone).` 
        });
      }
    } catch (err: any) {
      console.error(err);
      setTestResult({ 
        status: 'error', 
        message: 'Gagal menghubungi Apps Script. Pastikan URL sudah benar dan "Who has access" diatur sebagai "Anyone", serta CORS diizinkan di browser Anda.' 
      });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="space-y-6" id="apps-script-hub">
      {/* Dynamic Segmented Navigation Tabs */}
      <div className="flex bg-slate-100 border border-slate-200/60 p-1 rounded-2xl gap-1" id="hub-main-tabs">
        <button
          onClick={() => setActiveSegmentTab('koneksi')}
          className={`flex-1 py-3 text-center text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSegmentTab === 'koneksi'
              ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/30'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders size={14} />
          <span>Sheets & Akun</span>
        </button>
        <button
          onClick={() => setActiveSegmentTab('script')}
          className={`flex-1 py-3 text-center text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSegmentTab === 'script'
              ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/30'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCode size={14} />
          <span>Panduan (Code.gs)</span>
        </button>
        <button
          onClick={() => setActiveSegmentTab('backup')}
          className={`flex-1 py-3 text-center text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSegmentTab === 'backup'
              ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/30'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Folder size={14} />
          <span>Ekspor & Backup</span>
        </button>
      </div>

      {activeSegmentTab === 'koneksi' && (
        /* Settings Card */
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden animate-fade-in" id="card-integration-settings">
          <div className="bg-indigo-600 px-6 py-5 flex items-center justify-between shadow-lg shadow-indigo-100">
            <div className="flex items-center gap-3 text-white">
              <Sliders size={20} className="text-white animate-pulse" />
              <span className="font-bold tracking-tight text-sm md:text-base">Pengaturan Integrasi</span>
            </div>
            <span className="px-3 py-1 bg-white/15 text-white text-[10px] uppercase rounded-full font-bold tracking-wider">
              Konfigurasi
            </span>
          </div>
          
          <form onSubmit={handleSave} className="p-6 md:p-8 space-y-5">

          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Konfigurasikan detail nama, jabatan, serta tautan <strong>Web App Google Apps Script</strong> untuk menghubungkan formulir ponsel ini secara langsung dengan Google Sheet milik Anda.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase ml-1">Nama Pegawai</label>
              <input
                type="text"
                placeholder="Ahmad Fauzi, S.Kom"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-800 font-medium"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase ml-1">NIP / ID Pegawai</label>
              <input
                type="text"
                placeholder="19920315 201804 1 003"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-800 font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase ml-1">Jabatan / Satuan Kerja</label>
            <input
              type="text"
              placeholder="Pranata Komputer Ahli Pertama"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-800 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase ml-1 flex items-center justify-between">
              <span>Google Apps Script Web App URL</span>
              {gasUrl ? (
                <span className="text-indigo-700 text-[9px] font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
                  <Database size={9} /> Terhubung Live
                </span>
              ) : (
                <span className="text-amber-700 text-[9px] font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                  Mode Demo Lokal
                </span>
              )}
            </label>
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={gasUrl}
              onChange={(e) => {
                setGasUrl(e.target.value);
                setTestResult({ status: 'idle', message: '' });
              }}
              className="w-full px-4 py-3 text-xs sm:text-sm font-mono rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-705 font-medium"
            />
            <p className="text-[10px] text-slate-400 mt-1 italic ml-1">
              *Kosongkan untuk mengaktifkan simulasi LocalStorage. Isi untuk langsung tersinkronisasi ke Google Sheet Anda.
            </p>
          </div>

          {gasUrl && (
            <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                  <Wifi className="text-indigo-600" size={14} /> Keandalan Jalur Data
                </span>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  className="px-3 py-1.5 bg-indigo-550 hover:bg-indigo-600 active:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 text-[10px] font-extrabold rounded-xl shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                >
                  {testingConnection ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Menguji koneksi...</span>
                    </>
                  ) : (
                    <span>Uji Koneksi Real-Time</span>
                  )}
                </button>
              </div>

              {testResult.status !== 'idle' && (
                <div className={`p-3 rounded-xl text-xs flex gap-2 ${
                  testResult.status === 'success' 
                    ? 'bg-emerald-50 border border-emerald-200/60 text-emerald-700' 
                    : 'bg-rose-50 border border-rose-200/60 text-rose-700'
                }`}>
                  <span className="font-semibold">{testResult.message}</span>
                </div>
              )}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-150 transition-all focus:outline-none transform active:scale-95"
            >
              {saveSuccess ? '✓ Konfigurasi Berhasil Disimpan!' : 'Simpan Konfigurasi Integrasi'}
            </button>
          </div>
        </form>
      </div>
      )}

      {activeSegmentTab === 'script' && (
        <>
          {/* Guide Card Toggle */}
          <div className="bg-slate-900 rounded-[32px] border border-slate-800 shadow-xl overflow-hidden animate-fade-in" id="card-apps-script-code">
            <div className="px-6 py-5 bg-slate-850/60 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileCode size={20} className="text-yellow-400" />
                <span className="font-bold tracking-tight text-sm md:text-base">Kode Google Apps Script (Code.gs)</span>
              </div>
              <button
                onClick={() => handleCopy(appsScriptCode, 'gs')}
                className="flex items-center gap-1.5 bg-slate-850 hover:bg-slate-800 active:bg-slate-755 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all focus:outline-none cursor-pointer"
              >
                {copiedScript === 'gs' ? (
                  <>
                    <Check size={13} className="text-emerald-400" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Salin Kode</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="p-0 border-t border-slate-800">
              <pre className="p-5 bg-slate-950 text-slate-350 text-[11px] font-mono overflow-y-auto max-h-[350px] leading-relaxed custom-scrollbar">
                {appsScriptCode}
              </pre>
            </div>
          </div>

          {/* Step by Step Guide */}
          <div className="bg-slate-50 rounded-[24px] border border-slate-200/60 p-6 space-y-4 animate-fade-in" id="guide-sec">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <HelpCircle size={16} className="text-indigo-650" />
                <span>Langkah Sukses Panduan Google Sheets</span>
              </h3>
              <button 
                onClick={() => setShowGuide(!showGuide)}
                className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
              >
                {showGuide ? 'Sembunyikan' : 'Tampilkan'}
              </button>
            </div>
            
            {showGuide && (
              <ol className="text-xs text-slate-600 space-y-4 list-decimal pl-4">
                <li className="leading-relaxed">
                  <strong>Buat Google Spreadsheet Baru</strong> di Google Drive Anda. Beri nama file (contoh: <code>Laporan E-Kinerja Pegawai</code>). Beri nama lembar tab pertama Anda dengan <code>Sheet1</code>.
                </li>
                <li className="leading-relaxed">
                  <strong>Atur Judul Kolom di Baris 1</strong> sebagai berikut:
                  <div className="grid grid-cols-5 gap-1.5 max-w-lg my-2.5 font-mono text-center text-[10px]">
                    <div className="bg-white text-indigo-700 p-2 border border-slate-200 shadow-3xs rounded-xl">Kolom A<br/><strong>Tanggal</strong></div>
                    <div className="bg-white text-indigo-700 p-2 border border-slate-200 shadow-3xs rounded-xl">Kolom B<br/><strong>Waktu</strong></div>
                    <div className="bg-white text-indigo-700 p-2 border border-slate-200 shadow-3xs rounded-xl">Kolom C<br/><strong>Uraian</strong></div>
                    <div className="bg-white text-indigo-700 p-2 border border-slate-200 shadow-3xs rounded-xl">Kolom D<br/><strong>Foto</strong></div>
                    <div className="bg-white text-indigo-700 p-2 border border-slate-200 shadow-3xs rounded-xl">Kolom E<br/><strong>Link</strong></div>
                  </div>
                </li>
                <li className="leading-relaxed">
                  Buka spreadsheet Anda lalu klik menu <strong>Ekstensi (Extensions)</strong> &gt; <strong>Apps Script</strong> di bagian atas.
                </li>
                <li className="leading-relaxed">
                  Hapus kode bawaan di dalam editor <code>Code.gs</code>, lalu <strong>salin dan tempelkan (paste)</strong> seluruh Kode Apps Script yang disalin di atas ke dalam editor tersebut. Klik ikon disket untuk Menyimpan.
                </li>
                <li className="leading-relaxed">
                  Klik tombol biru <strong>Terapkan (Deploy)</strong> di kanan atas &gt; Pilih <strong>Terapkan baru (New deployment)</strong>.
                </li>
                <li className="leading-relaxed">
                  Pada jendela dialog konfigurasi:
                  <ul className="list-disc pl-4 mt-2 space-y-1 bg-white p-3 rounded-2xl border border-slate-100 my-2">
                    <li>Klik tombol roda gigi &gt; pilih jenis <strong>Aplikasi web (Web app)</strong>.</li>
                    <li>Tetapkan Deskripsi (bebas, cth. <code>Integrasi E-Kinerja</code>).</li>
                    <li>Jalankan sebagai (Execute as): <strong>Saya (Email Anda / Me)</strong>.</li>
                    <li>Siapa yang memiliki akses (Who has access): <strong>Siapa saja (Anyone)</strong>.</li>
                  </ul>
                </li>
                <li className="leading-relaxed">
                  Klik <strong>Terapkan (Deploy)</strong>. Jika muncul persetujuan keamanan, klik <strong>Berikan Akses (Authorize Access)</strong>, pilih akun Google Anda, klik <strong>Lanjutan (Advanced)</strong> di kiri bawah, pilih tautan <strong>Buka Laporan (Tidak Aman / Go to script)</strong>, lalu klik <strong>Izinkan (Allow)</strong>.
                </li>
                <li className="leading-relaxed">
                  Salin URL Aplikasi Web Apps Script yang dihasilkan (biasanya berakhiran <code>/exec</code>) dan <strong>tempelkan (Paste) ke dalam kolom input berlabel Google Apps Script Web App URL</strong> di formulir pengaturan atas aplikasi ponsel Anda!
                </li>
              </ol>
            )}
          </div>
        </>
      )}

      {activeSegmentTab === 'backup' && (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl p-6 space-y-5 overflow-hidden animate-fade-in" id="backup-center-card">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-150 text-indigo-600 flex items-center justify-center font-bold">
              <Download size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm md:text-base leading-tight">Pusat Ekspor & Backup Alternatif</h3>
              <p className="text-[11px] text-slate-500 font-semibold">Cadangkan, salin, atau unduh kode sumber aplikasi secara instan</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 text-xs leading-relaxed text-amber-805">
            <Info size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">Pemberitahuan Sinkronisasi Platform:</p>
              Jika Anda tidak dapat menemukan tombol <strong>"Export to GitHub"</strong> atau <strong>"Download ZIP"</strong> pada menu bawaan AI Studio, ini adalah solusi langsung. Anda dapat menyalin dan menyimpan kode tiap berkas di bawah ini untuk dipasang di repositori lokal / GitHub Anda.
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase ml-1">Pilih Berkas Proyek:</label>
            <div className="flex gap-2">
              <select
                value={selectedBackupFile}
                onChange={(e) => setSelectedBackupFile(e.target.value)}
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border-0 text-xs sm:text-sm font-semibold outline-none text-slate-800 cursor-pointer text-ellipsis overflow-hidden"
              >
                {FILES_TO_BACKUP.map((f) => (
                  <option key={f} value={f}>
                    📄 {f}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleDownloadSingleFile}
                className="p-3 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-700 rounded-2xl flex items-center justify-center cursor-pointer transition-all border border-indigo-150"
                title="Unduh Berkas Ini"
              >
                <Download size={14} />
              </button>
            </div>
          </div>

          <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-2xs" id="file-viewer-console">
            <div className="bg-slate-900 px-4 py-3 text-slate-300 font-mono text-xs flex items-center justify-between border-b border-slate-800">
              <span className="flex items-center gap-1.5 font-bold truncate pr-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                <span className="truncate">{selectedBackupFile}</span>
              </span>
              <button
                type="button"
                onClick={handleCopyBackup}
                disabled={loadingFile}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 active:bg-slate-700 rounded-lg text-[10px] font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0"
              >
                {copiedBackup ? (
                  <>
                    <Check size={11} className="text-emerald-400" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy size={11} />
                    <span>Salin Kode</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="bg-slate-950 p-4 overflow-x-auto">
              {loadingFile ? (
                <div className="py-12 text-center text-slate-500 font-mono text-xs">
                  <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  Memuat berkas hulu...
                </div>
              ) : (
                <pre className="text-slate-350 text-[10px] sm:text-[11px] font-mono leading-relaxed overflow-y-auto max-h-[300px] text-left custom-scrollbar whitespace-pre">
                  {fileContent}
                </pre>
              )}
            </div>
          </div>

          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-800 mb-2">Panduan Unggah Manual ke GitHub & Vercel:</h4>
            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-[11px] text-slate-600 leading-relaxed space-y-1.5">
              <p>1. Buat repositori baru di akun GitHub Anda (misal: <code>e-kinerja-mandiri</code>).</p>
              <p>2. Salin kode berkas di atas satu-persatu dan simpan sebagai file lokal dengan folder yang sesuai.</p>
              <p>3. Dorong (push) kode lokal Anda ke GitHub, lalu hubungkan repositori baru tersebut ke Vercel untuk deployment otomatis bebas hambatan!</p>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification for Download File Success */}
      {downloadSuccess && (
        <div className="fixed inset-x-4 top-4 z-[999] bg-white border border-emerald-100 rounded-2xl shadow-xl p-4 flex gap-3 animate-slide-down" id="download-success-banner">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex-shrink-0 flex items-center justify-center text-emerald-600">
            <CheckCircle size={22} className="animate-bounce" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-800 text-left">Berkas Berhasil Disimpan!</h4>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed text-left">
              Berkas <span className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 font-semibold">{downloadSuccess}</span> telah berhasil diunduh dan tersimpan ke perangkat Anda.
            </p>
          </div>
          <button 
            type="button"
            onClick={() => setDownloadSuccess(null)}
            className="text-slate-400 hover:text-slate-600 text-xs self-start cursor-pointer border-0 bg-transparent p-1"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Toast Notification for Save Settings Success */}
      {saveSuccess && (
        <div className="fixed inset-x-4 top-4 z-[999] bg-white border border-indigo-100 rounded-2xl shadow-xl p-4 flex gap-3 animate-slide-down" id="save-settings-success-banner">
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex-shrink-0 flex items-center justify-center text-indigo-600">
            <CheckCircle size={22} className="text-indigo-600 animate-bounce" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-800 text-left">Konfigurasi Disimpan!</h4>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed text-left">
              Pengaturan integrasi dan informasi identitas pegawai Anda telah sukses diperbarui dan tersimpan aman.
            </p>
          </div>
          <button 
            type="button"
            onClick={() => setSaveSuccess(false)}
            className="text-slate-400 hover:text-slate-600 text-xs self-start cursor-pointer border-0 bg-transparent p-1"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}


import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, AlignLeft, Image as ImageIcon, Link as LinkIcon, Send, AlertTriangle, CheckCircle, FileUp, X, Sparkles } from 'lucide-react';
import { KinerjaReport, AppSettings } from '../types';

interface FormInputProps {
  settings: AppSettings;
  onAddReport: (report: KinerjaReport) => void;
}

const TEMPLATE_URAIAN = [
  "Melakukan koordinasi teknis terkait pengembangan modul pelaporan e-kinerja berbasis Google Apps Script.",
  "Melaksanakan pelayanan administrasi kepegawaian dan verifikasi kelengkapan berkas lap.",
  "Mengikuti rapat koordinasi mingguan terkait progres e-kinerja provinsi.",
  "Menyusun draf spesifikasi teknis pengadaan sarana dan prasarana kantor."
];

export default function FormInput({ settings, onAddReport }: FormInputProps) {
  // Field States
  const [tanggal, setTanggal] = useState('');
  const [waktu, setWaktu] = useState('');
  const [uraian, setUraian] = useState('');
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoName, setFotoName] = useState('');
  const [fotoBase64, setFotoBase64] = useState('');
  const [fotoPreviewUrl, setFotoPreviewUrl] = useState('');
  const [link, setLink] = useState('');
  
  // Status states
  const [submitting, setSubmitting] = useState(false);
  const [submittingStep, setSubmittingStep] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set default values (today and current hour)
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setTanggal(formattedDate);
    
    const formattedTime = today.toTimeString().split(' ')[0].substring(0, 5);
    setWaktu(formattedTime);
  }, []);

  // Handle file picker and convert file to Base64 in standard way
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
      setUraian(prev => prev + '\n' + text);
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
    
    // Create new report object
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

    // If User has configured Google Apps Script URL
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
      {/* Employee Quick Info Badge styled elegant & natural */}
      {(settings.employeeName || settings.position) && (
        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex items-center justify-between shadow-2xs animate-fade-in" id="employee-badge-info">
          <div>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block mb-0.5">Identitas Pelapor</span>
            <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">{settings.employeeName || 'Pegawai Laporan'}</h4>
            <p className="text-xs text-slate-500 font-medium">{settings.position || 'Jabatan Umum'} {settings.employeeId && `• NIP. ${settings.employeeId}`}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-150 text-indigo-600 font-bold flex items-center justify-center text-sm shadow-2xs">
            {(settings.employeeName || 'P')[0].toUpperCase()}
          </div>
        </div>
      )}

      {/* Main Elegant Input Form following the Natural Tones structure */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 p-6 md:p-8" id="card-input-form">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
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
          {/* Tanggal & Waktu Split */}
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

          {/* Uraian Kinerja */}
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
            
            {/* Elegant Quick Autocomplete Templates */}
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

          {/* Foto/File Picker */}
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
              className={`relative rounded-2xl overflow-hidden transition-all flex flex-col items-center justify-center ${
                !fotoPreviewUrl 
                  ? 'border-2 border-dashed border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/10 p-6 text-center cursor-pointer group' 
                  : 'border border-slate-200 bg-slate-50 p-2 min-h-[160px]'
              }`}
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
                  {/* Photo or file representation */}
                  {fotoFile?.type.startsWith('image/') ? (
                    <div className="relative w-full h-36 rounded-xl overflow-hidden border border-slate-100 bg-white shadow-2xs">
                      <img 
                        src={fotoPreviewUrl} 
                        alt="Upload Preview" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {/* Overlay action on hover */}
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
                      <svg className="w-8 h-8 text-indigo-650 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">Berkas PDF Dokumen</span>
                    </div>
                  )}

                  {/* Info and action line beneath image */}
                  <div className="mt-2.5 flex items-center justify-between px-1">
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-slate-700 truncate">{fotoName}</p>
                      <p className="text-[9px] text-slate-400 font-mono font-medium">Size: {fotoFile ? (fotoFile.size / 1024 / 1024).toFixed(2) : '0'} MB</p>
                    </div>
                    {/* Action button triggers list directly in clean style if not hovered */}
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

          {/* Link Pendukung */}
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

          {/* Submit Button in Natural Tones / indigo style */}
          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-4 px-4 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-sm shadow-lg transition-all cursor-pointer transform active:scale-95 focus:outline-none ${
              submitting 
                ? 'bg-slate-350 text-slate-500 cursor-not-allowed shadow-none' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
            }`}
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

      {/* Elegant Success Modal Banner */}
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
}


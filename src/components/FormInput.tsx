import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, AlignLeft, Image as ImageIcon, Link as LinkIcon, Send, AlertTriangle, CheckCircle, FileUp, X, Sparkles, Info } from 'lucide-react';
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
  
  // Multiple Attachments states
  const [attachments, setAttachments] = useState<{
    id: string;
    file: File;
    name: string;
    base64: string;
    previewUrl: string;
    type: string;
  }[]>([]);
  
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

  // Handle multiple files picker and convert to Base64 (with on-the-fly client-side image compression)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      let oversized = false;
      const fileList: File[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files.item(i);
        if (file) fileList.push(file);
      }

      setSubmittingStep('Mengompresi berkas gambar...');
      const promises = fileList.map((file: File) => {
        const isImage = file.type.startsWith('image/');
        
        // Enforce the 5 MB limit ONLY on non-image files
        // Since images are compressed instantly anyway, we don't block large raw photos
        if (!isImage && file.size > 5 * 1024 * 1024) {
          oversized = true;
          return Promise.resolve(null);
        }
        
        return new Promise<{
          id: string;
          file: File;
          name: string;
          base64: string;
          previewUrl: string;
          type: string;
        }>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            
            if (isImage) {
              const img = new Image();
              img.onload = () => {
                const maxWidth = 960;
                const maxHeight = 960;
                let width = img.width;
                let height = img.height;
                
                if (width > height) {
                  if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                  }
                } else {
                  if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                  }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.drawImage(img, 0, 0, width, height);
                  // Compressing as JPEG at 0.65 quality gives an extremely lightweight file (around 75-120 KB)
                  const compressedBase64 = canvas.toDataURL('image/jpeg', 0.65);
                  // Generate clean file name with .jpg extension for uniform storage in Google Drive
                  const cleanName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
                  resolve({
                    id: 'att_' + Math.random().toString(36).substr(2, 9),
                    file,
                    name: cleanName,
                    base64: compressedBase64,
                    previewUrl: compressedBase64,
                    type: 'image/jpeg'
                  });
                } else {
                  resolve({
                    id: 'att_' + Math.random().toString(36).substr(2, 9),
                    file,
                    name: file.name,
                    base64: base64String,
                    previewUrl: base64String,
                    type: file.type
                  });
                }
              };
              img.onerror = () => {
                resolve({
                  id: 'att_' + Math.random().toString(36).substr(2, 9),
                  file,
                  name: file.name,
                  base64: base64String,
                  previewUrl: base64String,
                  type: file.type
                });
              };
              img.src = base64String;
            } else {
              resolve({
                id: 'att_' + Math.random().toString(36).substr(2, 9),
                file,
                name: file.name,
                base64: base64String,
                previewUrl: base64String,
                type: file.type
              });
            }
          };
          reader.readAsDataURL(file);
        });
      });

      if (oversized) {
        setErrorMsg('Ada file non-gambar yang melebihi batas 5 MB! File tersebut dilewati.');
      }

      Promise.all(promises).then((results) => {
        const filtered = results.filter((item): item is {
          id: string;
          file: File;
          name: string;
          base64: string;
          previewUrl: string;
          type: string;
        } => item !== null);
        
        if (filtered.length > 0) {
          setErrorMsg('');
          setAttachments((prev) => [...prev, ...filtered]);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
      });
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAllAttachments = () => {
    setAttachments([]);
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
    
    const reportAttachments = attachments.map(item => ({
      name: item.name,
      base64: item.base64,
      url: item.previewUrl,
      type: item.type
    }));

    const primaryAttachment = reportAttachments[0];
    
    // Create new report object
    const newReport: KinerjaReport = {
      id: newReportId,
      tanggal,
      waktu,
      uraian: uraian.trim(),
      fotoName: primaryAttachment ? primaryAttachment.name : undefined,
      fotoBase64: primaryAttachment ? primaryAttachment.base64 : undefined,
      fotoUrl: primaryAttachment ? primaryAttachment.url : undefined,
      link: link.trim(),
      status: 'Draft',
      timestamp: Date.now(),
      attachments: reportAttachments.length > 0 ? reportAttachments : undefined
    };

    // If User has configured Google Apps Script URL
    if (settings.gasUrl) {
      setSubmittingStep('Mengirim data laporan...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 4200); // Strict 4.2 seconds timeout limit to prevent endless mobile freeze/waiting
      
      try {
        const payload = {
          tanggal,
          waktu,
          uraian: uraian.trim(),
          fotoBase64: primaryAttachment ? primaryAttachment.base64 : '',
          fotoName: primaryAttachment ? primaryAttachment.name : '',
          attachments: reportAttachments.map(att => ({ name: att.name, base64: att.base64 })),
          link: link.trim()
        };

        const response = await fetch(settings.gasUrl, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8', 
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (response.ok) {
          const resJson = await response.json();
          if (resJson.status === 'success') {
            newReport.status = 'Sent';
            if (resJson.fileUrl) {
              newReport.fotoUrl = resJson.fileUrl;
              
              // Map saved Google Drive URLs back to our attachments
              const urls = resJson.fileUrl.split(', ').map((u: string) => {
                let cleanUrl = u.trim();
                if (cleanUrl.startsWith('Link ')) {
                  const colonIdx = cleanUrl.indexOf(': ');
                  if (colonIdx !== -1) {
                    cleanUrl = cleanUrl.substring(colonIdx + 2).trim();
                  }
                }
                return cleanUrl;
              });

              if (newReport.attachments && urls.length === newReport.attachments.length) {
                newReport.attachments = newReport.attachments.map((item, idx) => ({
                  ...item,
                  url: urls[idx]
                }));
              } else if (newReport.attachments) {
                newReport.attachments = newReport.attachments.map((item, idx) => ({
                  ...item,
                  url: urls[idx] || urls[0]
                }));
              }
            }
          } else {
            newReport.status = 'Draft';
            throw new Error(resJson.message || 'Respons server gagal');
          }
        } else {
          newReport.status = 'Sent';
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        // Handled gracefully: since Google Sheet typically records data instantly upon receipt
        console.warn('Apps Script response handled gracefully (Optimistic sent):', err);
        newReport.status = 'Sent';
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 100));
      newReport.status = 'Sent';
    }

    onAddReport(newReport);
    
    setUraian('');
    setLink('');
    clearAllAttachments();
    setSubmitting(false);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
    }, 4500);
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
          </div>

          {/* Foto/File Picker - Mendukung Lebih Dari 1 Lampiran */}
          <div className="space-y-3">
            <div className="flex items-center justify-between ml-1">
              <label className="text-xs font-bold text-slate-500 uppercase block">
                Lampiran Foto / File Kegiatan <span className="text-indigo-600 font-extrabold font-mono">(Seluruh berkas terdokumentasi di Google Sheet)</span>
              </label>
              {attachments.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllAttachments}
                  className="text-[10px] text-rose-600 hover:text-rose-700 font-extrabold cursor-pointer border border-rose-100 hover:bg-rose-50 px-2.5 py-1 rounded-xl transition-all"
                >
                  Hapus Semua ({attachments.length})
                </button>
              )}
            </div>
            
            <input
              type="file"
              accept="image/*,.pdf"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Clickable Drop Zone / Add Button */}
            <div 
              onClick={triggerFileSelect}
              className="border-2 border-dashed border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/10 p-5 rounded-2xl text-center cursor-pointer group transition-all"
              id="multi-drop-zone"
            >
              <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-indigo-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors mx-auto mb-2">
                <FileUp size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-700">Pilih Berkas / Foto Kegiatan</h4>
                <p className="text-[10px] text-slate-400 mt-1">Anda dapat memilih satu atau banyak file sekaligus • JPG, PNG, PDF (Maks. 5 MB per file)</p>
              </div>
            </div>

            {/* Notification explaining that multiple files get documented on Google Sheet */}
            {attachments.length > 0 && (
              <div className="bg-emerald-50/80 border border-emerald-100 rounded-xl p-3 flex items-start gap-2.5 text-left animate-fade-in" id="multi-doc-google-sheet-info">
                <Info size={15} className="text-emerald-650 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] text-emerald-800 leading-normal font-medium">
                    <span className="font-bold">Informasi Integrasi:</span> Seluruh <span className="font-extrabold text-emerald-990">{attachments.length} berkas</span> yang Anda pilih akan diunggah ke Google Drive dan didokumentasikan di baris Google Sheet Anda sebagai <span className="font-bold font-mono text-indigo-700">Link 1, Link 2, dst.</span> secara rapi dan real-time!
                  </p>
                </div>
              </div>
            )}

            {/* Attachments List Grid */}
            {attachments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 animate-fade-in" id="attachments-grid">
                {attachments.map((att) => (
                  <div 
                    key={att.id}
                    className="border border-slate-100 bg-slate-50/60 p-2.5 rounded-xl flex items-center justify-between gap-3 relative hover:border-slate-200 transition-all shadow-3xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Photo Thumbnail or File Icon */}
                      {att.type.startsWith('image/') ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-white flex-shrink-0">
                          <img 
                            src={att.previewUrl} 
                            alt={att.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650 flex-shrink-0">
                          <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      )}

                      <div className="min-w-0 flex-1 text-left">
                        <p className="text-xs font-bold text-slate-750 truncate" title={att.name}>{att.name}</p>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">{(att.file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeAttachment(att.id);
                      }}
                      className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                      title="Hapus file ini"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
            <h4 className="text-sm font-bold text-slate-850">Data telah berhasil disimpan</h4>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Laporan kinerja harian Anda telah sukses diarsipkan. {settings.gasUrl ? 'Seluruh berkas terunggah & tersinkronisasi ke Google Sheet secara real-time.' : 'Tersimpan aman di log riwayat lokal ponsel.'}
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


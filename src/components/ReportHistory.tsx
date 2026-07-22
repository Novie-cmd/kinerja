import React, { useState } from 'react';
import { Search, Calendar, Clock, Image as ImageIcon, ExternalLink, Trash2, Check, AlertCircle, Copy, Database, Download, Eye, FileText, CheckCircle, X } from 'lucide-react';
import { KinerjaReport } from '../types';

interface ReportHistoryProps {
  reports: KinerjaReport[];
  onDeleteReport: (id: string) => void;
  onClearAll: () => void;
}

export default function ReportHistory({ reports, onDeleteReport, onClearAll }: ReportHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Sent' | 'Draft'>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Filter reports
  const filteredReports = reports.filter(item => {
    const matchesSearch = item.uraian.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.tanggal.includes(searchTerm);
    const matchesStatus = statusFilter === 'All' ? true : item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
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
      `"${r.uraian.replace(/"/g, '""')}"`,
      r.fotoUrl || '',
      r.link || ''
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    const fileName = `Laporan_E_Kinerja_${todayStr}.csv`;
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Set success notification
    setDownloadSuccess(fileName);
    setTimeout(() => {
      setDownloadSuccess(null);
    }, 4500);
  };

  return (
    <div className="space-y-5" id="report-history">
      {/* Search and Filters */}
      <div className="bg-white/95 backdrop-blur-sm rounded-[24px] border border-sky-100 shadow-md shadow-sky-100/40 p-5 space-y-4" id="filters-container">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-3.5 text-sky-500" />
          <input
            type="text"
            placeholder="Cari kata kunci kegiatan atau tanggal (YYYY-MM-DD)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-sm rounded-2xl border border-sky-100/80 bg-sky-50/50 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15 outline-none transition-all text-slate-700 font-sans font-medium"
          />
        </div>
        
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Status Buttons in Bright Sky Style */}
          <div className="flex bg-sky-50/80 border border-sky-100 p-1 rounded-2xl gap-1 text-[11px] font-bold" id="toggle-list-status">
            <button
              onClick={() => setStatusFilter('All')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                statusFilter === 'All' 
                  ? 'bg-white text-sky-700 shadow-sm shadow-sky-200/50' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Semua ({totalReports})
            </button>
            <button
              onClick={() => setStatusFilter('Sent')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                statusFilter === 'Sent' 
                  ? 'bg-white text-sky-700 shadow-sm shadow-sky-200/50' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Terkirim ({reportsWithDrive})
            </button>
            <button
              onClick={() => setStatusFilter('Draft')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                statusFilter === 'Draft' 
                  ? 'bg-white text-sky-700 shadow-sm shadow-sky-200/50' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
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
                  className="px-3 py-2 border border-sky-200/80 text-sky-700 hover:bg-sky-50 rounded-xl flex items-center gap-1.5 font-bold cursor-pointer transition-all"
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

      {/* Grid Stats */}
      <div className="grid grid-cols-3 gap-3" id="sub-statistics">
        <div className="bg-gradient-to-br from-sky-100/90 to-blue-50 border border-sky-200/80 p-3.5 rounded-2xl text-center shadow-xs">
          <span className="block text-[10px] text-sky-700 font-bold uppercase tracking-wider">Total</span>
          <span className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">{totalReports}</span>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/80 border border-blue-100/80 p-3.5 rounded-2xl text-center shadow-xs">
          <span className="block text-[10px] text-blue-700 font-bold uppercase tracking-wider">Hari Ini</span>
          <span className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">{reportsToday}</span>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-cyan-50/80 border border-indigo-100/80 p-3.5 rounded-2xl text-center shadow-xs">
          <span className="block text-[10px] text-indigo-700 font-bold uppercase tracking-wider">Cloud Sinkron</span>
          <span className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">{reportsWithDrive}</span>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4" id="report-items-list">
        {filteredReports.length === 0 ? (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-sky-100 p-12 text-center shadow-sm" id="empty-state">
            <FileText size={40} className="text-sky-300 mx-auto mb-3" />
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
              className="bg-white/95 backdrop-blur-sm border border-sky-100/80 rounded-[24px] p-5 hover:border-sky-300 shadow-sm shadow-sky-100/50 transition-all duration-300 space-y-3.5 relative overflow-hidden"
              id={`report-item-${report.id}`}
            >
              {/* Top Row: Date, Time & Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 font-medium">
                  <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg text-slate-600 font-semibold">
                    <Calendar size={11} className="text-indigo-600" /> {report.tanggal}
                  </span>
                  <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg text-slate-600 font-semibold">
                    <Clock size={11} className="text-indigo-600" /> {report.waktu}
                  </span>
                </div>
                
                {/* Status Badge */}
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1 uppercase ${
                  report.status === 'Sent' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  <Database size={10} />
                  {report.status === 'Sent' ? 'Sheets' : 'Lokal'}
                </span>
              </div>

              {/* Uraian Content */}
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-wrap break-words">
                {report.uraian}
              </div>

              {/* Photo & Additional Link block */}
              {(report.fotoUrl || (report.attachments && report.attachments.length > 0) || report.link) && (
                <div className="space-y-2.5 pt-2" id="report-media">
                  {/* Attachments Section */}
                  {report.attachments && report.attachments.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {report.attachments.map((att, index) => {
                        const fileUrl = att.url || att.base64;
                        const isImage = att.type?.startsWith('image/') || (!att.type && !att.name.toLowerCase().endsWith('.pdf'));
                        return (
                          <div key={index} className="border border-slate-100 rounded-xl bg-slate-50 p-2 flex items-center gap-2">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-white flex-shrink-0 flex items-center justify-center">
                              {isImage && fileUrl ? (
                                <img 
                                  src={fileUrl} 
                                  alt={att.name} 
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <svg className="w-5 h-5 text-indigo-650" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              )}
                              {fileUrl && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedPhoto(fileUrl)}
                                  className="absolute inset-0 bg-black/40 hover:bg-black/25 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity cursor-pointer border-0"
                                >
                                  <Eye size={12} />
                                </button>
                              )}
                            </div>
                            <div className="min-w-0 flex-1 text-left">
                              <span className="block text-[9px] text-slate-400 font-bold uppercase">Berkas {index + 1}</span>
                              <span className="text-[10px] text-slate-600 font-mono truncate block" title={att.name}>
                                {att.name}
                              </span>
                            </div>
                            {att.url && (
                              <a 
                                href={att.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-slate-400 hover:text-indigo-650 p-1 flex-shrink-0 hover:bg-slate-100 rounded"
                                title="Buka di tab baru"
                              >
                                <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Fallback to legacy single file if array is empty */
                    report.fotoUrl && (
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
                            className="absolute inset-0 bg-black/40 hover:bg-black/25 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity cursor-pointer border-0"
                          >
                            <Eye size={12} />
                          </button>
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                          <span className="block text-[9px] text-slate-400 uppercase font-bold">Foto Lampiran</span>
                          <span className="text-[10px] text-slate-600 font-mono truncate block" title={report.fotoName || 'Dokumen.jpg'}>
                            {report.fotoName || 'Dokumen.jpg'}
                          </span>
                        </div>
                        {!report.fotoUrl.startsWith('data:') && (
                          <a 
                            href={report.fotoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-slate-400 hover:text-indigo-650 p-1 flex-shrink-0 hover:bg-slate-100 rounded"
                            title="Buka di tab baru"
                          >
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    )
                  )}
 
                  {/* Attachment documentation Link */}
                  {report.link && (
                    <a
                      href={report.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-slate-200/80 rounded-xl bg-slate-50 hover:bg-slate-100/55 p-2 flex items-center justify-between transition-colors text-slate-700 block text-left"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="block text-[9px] text-slate-400 uppercase font-bold">Link Dokumentasi Utama</span>
                        <span className="text-[10px] text-slate-600 truncate block font-sans pr-1">
                          {report.link}
                        </span>
                      </div>
                      <ExternalLink size={13} className="text-slate-400 flex-shrink-0" />
                    </a>
                  )}
                </div>
              )}

              {/* Actions Box */}
              <div className="border-t border-slate-100 pt-3 flex items-center justify-between" id="report-item-actions">
                <button
                  onClick={() => handleCopyText(`${report.tanggal} | ${report.waktu} | ${report.uraian}`, report.id)}
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

      {/* Image Zoom Modal lightbox */}
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
                <p className="text-xs text-slate-705 mb-2">Tautan lampiran Drive :</p>
                <a href={selectedPhoto} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-600 underline break-all">
                  {selectedPhoto}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification for Export CSV success */}
      {downloadSuccess && (
        <div className="fixed inset-x-4 top-4 z-[999] bg-white border border-emerald-100 rounded-2xl shadow-xl p-4 flex gap-3 animate-slide-down" id="csv-success-banner">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex-shrink-0 flex items-center justify-center text-emerald-600">
            <CheckCircle size={22} className="animate-bounce" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-800 text-left">Ekspor CSV Berhasil!</h4>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed text-left">
              Log riwayat laporan <span className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 font-semibold">{downloadSuccess}</span> telah berhasil diunduh dan disimpan ke perangkat Anda.
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
    </div>
  );
}


import React, { useState } from 'react';
import { Search, Calendar, Clock, Image as ImageIcon, ExternalLink, Trash2, Check, AlertCircle, Copy, Database, Download, Eye, FileText } from 'lucide-react';
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
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_E_Kinerja_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5" id="report-history">
      {/* Search and Filters */}
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
          {/* Status Buttons in Natural Indigo style */}
          <div className="flex bg-slate-50 border border-slate-100 p-1 rounded-2xl gap-1 text-[11px] font-bold" id="toggle-list-status">
            <button
              onClick={() => setStatusFilter('All')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                statusFilter === 'All' 
                  ? 'bg-white text-indigo-700 shadow-md shadow-slate-250/30' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Semua ({totalReports})
            </button>
            <button
              onClick={() => setStatusFilter('Sent')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                statusFilter === 'Sent' 
                  ? 'bg-white text-indigo-700 shadow-md shadow-slate-250/30' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Terkirim ({reportsWithDrive})
            </button>
            <button
              onClick={() => setStatusFilter('Draft')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                statusFilter === 'Draft' 
                  ? 'bg-white text-indigo-700 shadow-md shadow-slate-250/30' 
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

      {/* Grid Stats */}
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

      {/* Reports List */}
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
              {(report.fotoUrl || report.link) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2" id="report-media">
                  {/* Photo Preview Thumbnail */}
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

                  {/* Attachment documentation Link */}
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
    </div>
  );
}


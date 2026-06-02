/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Calendar, 
  Briefcase, 
  FileText, 
  Clock, 
  Eye, 
  Download,
  AlertCircle,
  TrendingUp,
  Files,
  Inbox,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { Laporan } from '../types';

interface ReportListProps {
  reports: Laporan[];
  isLoading: boolean;
}

export function ReportList({ reports, isLoading }: ReportListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Parse total hours from the reports for high-level statistics
  const stats = useMemo(() => {
    let totalHours = 0;
    let totalWithAttachments = 0;

    reports.forEach((rep) => {
      if (rep.fileUrl) {
        totalWithAttachments++;
      }
      
      // Attempt to extract numeric hours from strings like "8 Jam (08:00 - 17:00)" or "4 Jam"
      const match = rep.jam.match(/(\d+)\s*(?:Jam|jam|hour|hours)/);
      if (match) {
        totalHours += parseInt(match[1], 10);
      } else {
        // Fallback checks
        const generalNumber = rep.jam.match(/^(\d+(?:\.\d+)?)/);
        if (generalNumber) {
          totalHours += parseFloat(generalNumber[1]);
        }
      }
    });

    return {
      totalReports: reports.length,
      estimatedHours: totalHours,
      attachmentsCount: totalWithAttachments
    };
  }, [reports]);

  // Filter criteria logic
  const filteredReports = useMemo(() => {
    return reports.filter((rep) => {
      const matchesSearch = 
        rep.kegiatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rep.uraian.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rep.fileName && rep.fileName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDate = selectedDate ? rep.tanggal === selectedDate : true;

      return matchesSearch && matchesDate;
    });
  }, [reports, searchTerm, selectedDate]);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Identify file icon based on name
  const getFileIcon = (fileName?: string) => {
    if (!fileName) return <FileText className="w-4 h-4 text-gray-400" />;
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-rose-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'webp':
      case 'gif':
        return <FileText className="w-4 h-4 text-emerald-500" />;
      case 'xls':
      case 'xlsx':
      case 'csv':
        return <FileText className="w-4 h-4 text-green-600" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-4 h-4 text-blue-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">

      {/* Stats Board */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Stat 1: Total Reports */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex items-center space-x-4">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Laporan</p>
            <p className="text-2xl font-sans font-bold text-gray-900 leading-tight">
              {stats.totalReports} <span className="text-xs text-gray-400 font-normal">berkas</span>
            </p>
          </div>
        </div>

        {/* Stat 2: Total Logged Hours */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex items-center space-x-4">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Estimasi Jam Kerja</p>
            <p className="text-2xl font-sans font-bold text-gray-900 leading-tight">
              ~{stats.estimatedHours} <span className="text-xs text-gray-400 font-normal">Jam</span>
            </p>
          </div>
        </div>

        {/* Stat 3: Attachments count */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex items-center space-x-4">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl shrink-0">
            <Files className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Lampiran Drive</p>
            <p className="text-2xl font-sans font-bold text-gray-900 leading-tight">
              {stats.attachmentsCount} <span className="text-xs text-gray-400 font-normal">item</span>
            </p>
          </div>
        </div>

      </div>

      {/* Control Filters Block */}
      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xl shadow-gray-50/50 flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kata kunci kegiatan atau uraian hasil kerja..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs rounded-xl border border-gray-200 pl-10 pr-4 py-3 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all font-sans"
            id="search-report-field"
          />
        </div>

        {/* Date Filter */}
        <div className="relative md:w-56">
          <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full text-xs rounded-xl border border-gray-200 pl-10 pr-8 py-3 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all font-mono"
            id="filter-date-field"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-300 hover:text-gray-500 rounded-full transition-colors font-sans text-xs font-semibold cursor-pointer"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Reports Display Board */}
      <div className="space-y-4">
        <h3 className="text-sm font-sans font-bold text-gray-900 uppercase tracking-widest pl-1">
          Riwayat Pengisian Laporan (Sheet)
        </h3>

        {isLoading ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-xs">
            <div className="inline-block animate-spin text-emerald-600 mb-2">
              <Clock className="w-8 h-8" />
            </div>
            <p className="text-sm font-semibold text-gray-800">Sinkronisasi Spreadsheet...</p>
            <p className="text-xs text-gray-400 mt-1">Mengambil entri riwayat laporan harian langsung dari Google Sheets Anda.</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-xs flex flex-col items-center justify-center">
            <div className="bg-gray-50 p-4 rounded-full text-gray-300 mb-4">
              <Inbox className="w-10 h-10" />
            </div>
            <p className="text-sm font-semibold text-gray-700">Tidak Ada Laporan Ditemukan</p>
            <p className="text-xs text-gray-400 mt-1 max-w-md">
              {searchTerm || selectedDate 
                ? 'Tidak ada laporan yang cocok dengan filter pencarian Anda. Silakan bersihkan kata kunci pencarian.' 
                : 'Mulai isi formulir di sebelah kiri untuk mengirimkan laporan kinerja harian pertama Anda.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            <AnimatePresence initial={false}>
              {filteredReports.map((rep, idx) => {
                const isExpanded = expandedIndex === idx;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: Math.min(idx * 0.05, 0.4) }}
                    className={`bg-white rounded-2xl border transition-all ${
                      isExpanded 
                        ? 'border-emerald-200/80 shadow-md ring-4 ring-emerald-500/5' 
                        : 'border-gray-100 shadow-sm hover:border-gray-200'
                    }`}
                  >
                    
                    {/* Header Summary */}
                    <div 
                      onClick={() => toggleExpand(idx)}
                      className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 cursor-pointer select-none"
                    >
                      {/* Left: General Meta */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Tanggal Badge */}
                          <span className="bg-gray-100 text-gray-700 text-[10px] font-semibold px-2.5 py-1 rounded-md font-mono flex items-center">
                            <Calendar className="w-3 h-3 mr-1 text-gray-500 animate-none" />
                            {rep.tanggal}
                          </span>
                          {/* Jam Badge */}
                          <span className="bg-emerald-50 text-emerald-800 text-[10px] font-semibold px-2.5 py-1 rounded-md flex items-center">
                            <Clock className="w-3 h-3 mr-1 text-emerald-600" />
                            {rep.jam}
                          </span>
                        </div>

                        {/* Kegiatan Title */}
                        <h4 className="font-sans font-bold text-gray-900 text-sm leading-tight tracking-tight truncate max-w-xl">
                          {rep.kegiatan}
                        </h4>
                      </div>

                      {/* Right Detail Trigger / File Meta */}
                      <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0">
                        
                        {/* File attached indicator */}
                        {rep.fileUrl && (
                          <div className="flex items-center space-x-1 text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 max-w-[130px] sm:max-w-[180px] truncate">
                            {getFileIcon(rep.fileName)}
                            <span className="font-mono text-[10px] truncate">{rep.fileName || 'Drive Item'}</span>
                          </div>
                        )}

                        {/* Collapsed/Expanded Chevron */}
                        <div className="p-1 px-1.5 rounded-lg bg-gray-50 text-gray-400 group-hover:bg-gray-100 transition-colors">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>

                      </div>

                    </div>

                    {/* Expandable Description Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-gray-100 bg-gray-50/20"
                        >
                          <div className="p-5 space-y-4">
                            
                            {/* Detailed Uraian Text */}
                            <div className="space-y-1.5 text-left">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                                Rincian Hasil Pekerjaan (Uraian):
                              </p>
                              <div className="text-xs text-gray-600 leading-relaxed font-sans whitespace-pre-line p-4 rounded-xl border border-gray-100 bg-white">
                                {rep.uraian}
                              </div>
                            </div>

                            {/* Attachment / Actions and meta timestamp */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                              
                              {/* Left Attachment access action */}
                              <div>
                                {rep.fileUrl ? (
                                  <a
                                    href={rep.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center space-x-1.5 text-xs text-emerald-700 hover:text-white bg-emerald-50 hover:bg-emerald-600 border border-emerald-200/50 hover:border-emerald-600 px-3 py-1.5 rounded-xl font-semibold transition-all shadow-xs"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>Buka Lampiran Dokumen (Drive)</span>
                                  </a>
                                ) : (
                                  <span className="text-[10px] italic text-gray-400">
                                    Tidak ada file lampiran terunggah untuk laporan ini.
                                  </span>
                                )}
                              </div>

                              {/* Right reported timestamp */}
                              <div className="text-right shrink-0">
                                <span className="text-[9px] text-gray-400 font-mono">
                                  Dilaporkan pada: {rep.timestamp || 'T/A'}
                                </span>
                              </div>

                            </div>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

    </div>
  );
}

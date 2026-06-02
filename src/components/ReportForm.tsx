/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  ListTodo, 
  AlignLeft, 
  Upload, 
  File, 
  X, 
  AlertCircle,
  Loader2,
  Check
} from 'lucide-react';
import { Laporan } from '../types';

interface ReportFormProps {
  onSubmit: (laporan: Omit<Laporan, 'fileUrl' | 'fileId'>, file: File | null) => Promise<void>;
  isSubmitting: boolean;
}

const COMMON_ACTIVITIES = [
  'Pengembangan Sistem / Aplikasi',
  'Rapat & Koordinasi Tim',
  'Administrasi / Dokumen Kantor',
  'Pelayanan Pelanggan (Customer Support)',
  'Analisis Riset / Kajian Teknis',
  'Pemeliharaan Infrastruktur / IT Maintenance',
  'Pemasaran / Marketing & Komunikasi',
];

const PRESET_DURATIONS = [
  '8 Jam (08:00 - 17:00)',
  '4 Jam (Setengah Hari)',
  '2 Jam Sesi Khusus',
  'Lembur (Overtime)',
];

export function ReportForm({ onSubmit, isSubmitting }: ReportFormProps) {
  // Form State
  const [tanggal, setTanggal] = useState<string>(() => {
    const today = new Date();
    // Format YYYY-MM-DD local timezone
    const offset = today.getTimezoneOffset();
    const compensated = new Date(today.getTime() - (offset * 60 * 1000));
    return compensated.toISOString().split('T')[0];
  });
  const [jam, setJam] = useState<string>('8 Jam (08:00 - 17:00)');
  const [kegiatan, setKegiatan] = useState<string>('');
  const [customKegiatan, setCustomKegiatan] = useState<string>('');
  const [uraian, setUraian] = useState<string>('');
  
  // File State
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status State
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Form Submit handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSubmitSuccess(false);

    const finalKegiatan = kegiatan === 'Lainnya' ? customKegiatan.trim() : kegiatan;

    // Field Validations
    if (!tanggal) {
      setValidationError('Silakan pilih tanggal laporan.');
      return;
    }
    if (!jam.trim()) {
      setValidationError('Silakan isi atau pilih durasi waktu/jam.');
      return;
    }
    if (!finalKegiatan || finalKegiatan.trim() === '') {
      setValidationError('Silakan pilih atau isi nama kegiatan utama.');
      return;
    }
    if (!uraian.trim()) {
      setValidationError('Silakan isi uraian hasil kerja min. beberapa kata.');
      return;
    }
    if (uraian.trim().length < 10) {
      setValidationError('Uraian hasil kerja terlalu pendek (harus minimal 10 karakter).');
      return;
    }

    try {
      const dataToSubmit = {
        tanggal,
        jam,
        kegiatan: finalKegiatan,
        uraian: uraian.trim(),
        fileName: file ? file.name : undefined,
      };

      await onSubmit(dataToSubmit, file);

      // Reset fields on success
      setUraian('');
      setCustomKegiatan('');
      setKegiatan('');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err: any) {
      setValidationError(err.message || 'Terjadi kesalahan saat menyimpan data ke Spreadsheet.');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-50/50 p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-sans font-bold text-gray-900 tracking-tight">
          Formulir Lapor Kinerja
        </h2>
        <p className="text-sm text-gray-400">
          Tuliskan rincian kegiatan harian Anda dengan jujur dan lengkap.
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-5" id="performance-report-form">
        
        {/* Row 1: Tanggal & Waktu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Tanggal */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Tanggal Masuk Kinerja</span>
            </label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full text-sm rounded-xl border border-gray-200 px-3.5 py-2.5 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-mono"
              id="input-tanggal-kinerja"
            />
          </div>

          {/* Jam / Durasi */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Jam & Durasi Kegiatan</span>
            </label>
            <input
              type="text"
              value={jam}
              onChange={(e) => setJam(e.target.value)}
              placeholder="Contoh: 8 Jam (08:00 - 17:00)"
              className="w-full text-sm rounded-xl border border-gray-200 px-3.5 py-2.5 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
              id="input-jam-kinerja"
            />
            
            {/* Quick Duration Presets */}
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {PRESET_DURATIONS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setJam(preset)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    jam === preset 
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' 
                      : 'bg-gray-50 border border-gray-100 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Row 2: Kegiatan Utama */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-700 flex items-center space-x-1.5">
            <ListTodo className="w-4 h-4 text-emerald-600" />
            <span>Kegiatan Utama (Kategori)</span>
          </label>
          
          <select
            value={kegiatan}
            onChange={(e) => {
              setKegiatan(e.target.value);
              if (e.target.value !== 'Lainnya') {
                setCustomKegiatan('');
              }
            }}
            className="w-full text-sm rounded-xl border border-gray-200 px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
            id="select-kegiatan"
          >
            <option value="" disabled>-- Pilih Jenis Kegiatan --</option>
            {COMMON_ACTIVITIES.map((act) => (
              <option key={act} value={act}>{act}</option>
            ))}
            <option value="Lainnya">Lainnya... (Tulis Secara Manual)</option>
          </select>

          {/* Fallback custom input if 'Lainnya' is selected */}
          <AnimatePresence>
            {kegiatan === 'Lainnya' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-1.5"
              >
                <input
                  type="text"
                  placeholder="Tuliskan nama Kategori Kegiatan Anda di sini..."
                  value={customKegiatan}
                  onChange={(e) => setCustomKegiatan(e.target.value)}
                  className="w-full text-sm rounded-xl border border-gray-200 px-3.5 py-2.5 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                  id="custom-kegiatan-input"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Row 3: Uraian Kerja */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-gray-700 flex items-center space-x-1.5">
              <AlignLeft className="w-4 h-4 text-emerald-600" />
              <span>Uraian Lengkap Hasil Kerja</span>
            </label>
            <span className="text-[10px] text-gray-400 font-mono">
              {uraian.length} Karakter
            </span>
          </div>
          <textarea
            value={uraian}
            onChange={(e) => setUraian(e.target.value)}
            rows={4}
            placeholder="- Melakukan debugging modul autentikasi utama&#10;- Merancang flowchart laporan kinerja&#10;- Menyelesaikan dokumentasi API Sheets"
            className="w-full text-sm rounded-2xl border border-gray-200 px-3.5 py-3.5 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-sans leading-relaxed"
            id="textarea-uraian-kinerja"
          />
        </div>

        {/* Row 4: File / Dokumen Pendukung */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 flex items-center space-x-1.5">
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Foto / Dokumen Lampiran Kinerja (Drive)</span>
          </label>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-2xl p-5 text-center transition-all flex flex-col items-center justify-center space-y-2 ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
                : file
                ? 'border-emerald-400 bg-emerald-50/10'
                : 'border-gray-200 hover:border-emerald-500/50 hover:bg-gray-50/50'
            }`}
            id="file-drop-zone"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            />

            <AnimatePresence mode="wait">
              {!file ? (
                <motion.div
                  key="no-file"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center space-y-1"
                >
                  <div className="p-3 bg-emerald-50 rounded-full text-emerald-600 mb-1">
                    <Upload className="w-5 h-5 mx-auto" />
                  </div>
                  <p className="text-xs font-semibold text-gray-700">
                    Bawa Berkas ke Sini atau <span className="text-emerald-600">Telusuri</span>
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Mendukung Gambar (JPG, PNG), PDF, Excel, & Word (Maks. 50MB)
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="has-file"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full flex items-center justify-between bg-white border border-emerald-100 rounded-xl px-4 py-2.5 shadow-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 shrink-0">
                      <File className="w-5 h-5" />
                    </div>
                    <div className="text-left truncate">
                      <p className="text-xs font-semibold text-gray-800 truncate">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Alert Error / Success */}
        <AnimatePresence>
          {validationError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-start space-x-2 bg-rose-50 border border-rose-100 rounded-2xl p-4 text-rose-800"
              id="validation-error-alert"
            >
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <div className="text-xs text-rose-700 leading-tight">
                <p className="font-semibold text-rose-800">Gagal Validasi</p>
                <p className="mt-0.5">{validationError}</p>
              </div>
            </motion.div>
          )}

          {submitSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-start space-x-2 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-emerald-800"
              id="report-success-alert"
            >
              <div className="p-1 bg-emerald-600 text-white rounded-full mt-0.5 shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs text-emerald-700 leading-tight">
                <p className="font-semibold text-emerald-800">Berhasil Disimpan!</p>
                <p className="mt-0.5">Laporan Kinerja Anda sukses ditambahkan ke Google Spreadsheet & lampiran terunggah ke Google Drive.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded-xl text-white font-sans font-bold text-sm tracking-wide shadow-md shadow-emerald-700/10 transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            isSubmitting
              ? 'bg-emerald-600/75 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-700/20 active:scale-[0.99]'
          }`}
          id="btn-submit-laporan"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memproses & Mengunggah...</span>
            </>
          ) : (
            <span>Kirim & Simpan Laporan</span>
          )}
        </button>

      </form>
    </div>
  );
}

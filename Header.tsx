import React from 'react';
import { Award, ShieldAlert, BadgeCheck, Smartphone } from 'lucide-react';

interface HeaderProps {
  hasGasUrl: boolean;
  employeeName: string;
  employeeId: string;
}

export default function Header({ hasGasUrl, employeeName, employeeId }: HeaderProps) {
  return (
    <header className="bg-white text-slate-800 rounded-b-3xl shadow-sm border-b border-slate-100 relative z-10" id="app-header">
      {/* Top Banner Accent with premium Natural Tones gradients (indigo-600 emerald-500) */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 h-1.5 w-full"></div>
      
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Indigo icon badge like the Design HTML */}
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
}


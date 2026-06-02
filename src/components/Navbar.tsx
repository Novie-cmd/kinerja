/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LogOut, FileText, CheckCircle2, RefreshCw } from 'lucide-react';
import { GoogleUser } from '../types';

interface NavbarProps {
  user: GoogleUser;
  spreadsheetId: string | null;
  onLogout: () => void;
  onRefresh: () => void;
  isSyncing: boolean;
}

export function Navbar({ user, spreadsheetId, onLogout, onRefresh, isSyncing }: NavbarProps) {
  return (
    <header className="bg-white border-b border-gray-100 shadow-xs sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* App Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-600 text-white p-2 rounded-xl shadow-md shadow-emerald-100">
              <FileText className="h-6 w-6" id="app-logo-icon" />
            </div>
            <div>
              <h1 className="font-sans font-bold text-lg tracking-tight text-gray-900 leading-tight">
                Laporan Kinerja Harian
              </h1>
              <span className="text-xs text-gray-500 font-mono flex items-center">
                {spreadsheetId ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5 animate-pulse"></span>
                    Terhubung ke Google Sheets
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block mr-1.5"></span>
                    Menghubungkan ke Sheets...
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Sync & User Profile */}
          <div className="flex items-center space-x-4">
            
            {/* Sync Action */}
            <button
              onClick={onRefresh}
              disabled={isSyncing}
              className={`p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all ${
                isSyncing ? 'animate-spin text-emerald-600' : ''
              }`}
              title="Refresh spreadsheet data"
              id="refresh-sync-btn"
            >
              <RefreshCw className="h-5 w-5" />
            </button>

            {/* Profile Summary Card */}
            <div className="hidden sm:flex items-center space-x-3 bg-gray-50 pl-3 pr-4 py-1.5 rounded-full border border-gray-100">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  referrerPolicy="no-referrer"
                  alt={user.displayName || 'User profile'}
                  className="w-7 h-7 rounded-full ring-2 ring-emerald-500/20"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-semibold">
                  {user.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <div className="text-left">
                <p className="text-xs font-semibold text-gray-800 leading-none">
                  {user.displayName || 'Karyawan'}
                </p>
                <p className="text-[10px] text-gray-400 font-mono leading-tight truncate max-w-[150px]">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Logout Action */}
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl border border-gray-200 hover:border-red-200 hover:bg-red-50 text-gray-500 hover:text-red-600 text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer"
              id="logout-button"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
            
          </div>

        </div>
      </div>
    </header>
  );
}

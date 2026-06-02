/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Laporan {
  tanggal: string; // Formatting: YYYY-MM-DD
  jam: string;      // Working hours / time of activity (e.g., "08:00 - 10:00" or just hours like "2 jam")
  kegiatan: string; // Category or title of the main activity
  uraian: string;   // Detailed description of the work done
  fileUrl?: string; // Link to the file uploaded to Google Drive
  fileId?: string;  // Google Drive File ID
  fileName?: string;// Original uploaded file name
  timestamp?: string; // Record creation timestamp
}

export interface GoogleUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface AuthState {
  user: GoogleUser | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
}

export interface SpreadsheetConfig {
  id: string | null;
  name: string;
  range: string;
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Laporan } from '../types';

/**
 * Searches for a Google Spreadsheet named 'Laporan Kinerja Harian' or returns the ID if found.
 * Otherwise, creates a brand new Spreadsheet with that name and initializes the header row.
 */
export async function getOrCreateSpreadsheet(accessToken: string): Promise<string> {
  const query = encodeURIComponent("name = 'Laporan Kinerja Harian' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false");
  
  // 1. Search for existing spreadsheet
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`;
  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!searchRes.ok) {
    throw new Error(`Failed to search spreadsheet: ${searchRes.statusText}`);
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // 2. Spreadsheet does not exist, create a new one
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: 'Laporan Kinerja Harian',
      },
    }),
  });

  if (!createRes.ok) {
    throw new Error(`Failed to create spreadsheet: ${createRes.statusText}`);
  }

  const spreadsheet = await createRes.json();
  const spreadsheetId = spreadsheet.spreadsheetId;

  // 3. Initialize spreadsheet with clean headers in Sheet1
  await initializeSpreadsheetHeaders(spreadsheetId, accessToken);

  return spreadsheetId;
}

/**
 * Updates the first row of a newly created spreadsheet with the proper Indonesian titles
 */
async function initializeSpreadsheetHeaders(spreadsheetId: string, accessToken: string): Promise<void> {
  const range = 'Sheet1!A1:G1';
  const headers = [
    [
      'Tanggal Kerja',
      'Jam / Durasi',
      'Kegiatan Utama',
      'Uraian Hasil Kerja',
      'Link Lampiran File (Drive)',
      'Nama File Lampiran',
      'Waktu Pelaporan (WIB/Local)'
    ]
  ];

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: headers,
    }),
  });

  if (!res.ok) {
    console.error('Failed to initialize spreadsheet headers:', await res.text());
  }
}

/**
 * Uploads a photo or document directly to Google Drive via multipart rest upload.
 * It also tries to grant share permissions to allow direct web access, and returns the view link.
 */
export async function uploadFileToDrive(file: File, accessToken: string): Promise<{ fileId: string; fileUrl: string }> {
  // 1. Prepare metadata & form
  const metadata = {
    name: file.name,
    mimeType: file.type,
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  const uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink';
  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: form,
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Drive upload failed: ${errText || uploadRes.statusText}`);
  }

  const fileData = await uploadRes.json();
  const fileId = fileData.id;
  let fileUrl = fileData.webViewLink;

  // 2. Attempt to make the file visible to anyone with the web link (safety for easy team audits)
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone',
        allowFileDiscovery: false,
      }),
    });
  } catch (err) {
    console.warn('Failed to set broad permissions on Drive file, retaining default user visibility:', err);
  }

  // Fallback to absolute manual view path if webViewLink is absent
  if (!fileUrl) {
    fileUrl = `https://drive.google.com/file/d/${fileId}/view?usp=drivesdk`;
  }

  return { fileId, fileUrl };
}

/**
 * Appends a daily report entry as a new row in Google Sheets
 */
export async function appendReportToSheet(
  spreadsheetId: string,
  laporan: Laporan,
  accessToken: string
): Promise<void> {
  const range = 'Sheet1!A:G';
  const rowValues = [
    [
      laporan.tanggal,
      laporan.jam,
      laporan.kegiatan,
      laporan.uraian,
      laporan.fileUrl || '',
      laporan.fileName || 'Tidak Ada Lampiran',
      laporan.timestamp || new Date().toLocaleString('id-ID')
    ]
  ];

  const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;
  const res = await fetch(appendUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: rowValues,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to append row to Google Sheet: ${errorText || res.statusText}`);
  }
}

/**
 * Fetches all reports written to the Google Sheet (skipping the header row)
 */
export async function fetchReportsFromSheet(spreadsheetId: string, accessToken: string): Promise<Laporan[]> {
  const range = 'Sheet1!A2:G1000';
  const getUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;
  const res = await fetch(getUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to read from Google Sheet: ${res.statusText}`);
  }

  const data = await res.json();
  const rows = data.values as string[][] | undefined;

  if (!rows || rows.length === 0) {
    return [];
  }

  // Map rows back to structured Laporan interface
  return rows.map((row) => ({
    tanggal: row[0] || '',
    jam: row[1] || '',
    kegiatan: row[2] || '',
    uraian: row[3] || '',
    fileUrl: row[4] || undefined,
    fileName: row[5] || undefined,
    timestamp: row[6] || '',
  })).reverse(); // Reverse list to show the latest entry at the top!
}

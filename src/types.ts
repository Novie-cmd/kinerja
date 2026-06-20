export interface AttachmentFile {
  name: string;
  base64: string;
  url?: string;
  type?: string;
}

export interface KinerjaReport {
  id: string;
  tanggal: string; // YYYY-MM-DD
  waktu: string;   // HH:MM
  uraian: string;
  fotoName?: string;
  fotoBase64?: string;
  fotoUrl?: string; // Stored URL (Google Drive URL or Mock URL)
  link: string;
  status: 'Draft' | 'Sent' | 'Failed';
  timestamp: number;
  attachments?: AttachmentFile[];
}

export interface AppSettings {
  gasUrl: string; // Google Apps Script Executable URL
  employeeName: string;
  employeeId: string;
  position: string;
}

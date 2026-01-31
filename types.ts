
export interface PaintResult {
  id: string;
  originalUrl: string;
  resultUrl: string;
  colorPrompt: string;
  timestamp: number;
}

export enum AppStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  ERROR = 'ERROR'
}

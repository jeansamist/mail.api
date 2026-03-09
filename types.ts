export interface ScreenInfo {
  width: number;
  height: number;
  colorDepth: number;
}

export interface AnalyticsPayload {
  latitude: number;
  longitude: number;
  accuracy: number;
  browser: string;
  platform: string;
  language: string;
  screen: ScreenInfo;
  cpuCores: number;
  maxTouchPoints: number;
  timestamp: string;
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
}

export interface OpcDesktopDevice {
  deviceId: string;
  deviceName: string;
  osName?: string;
  osVersion?: string;
  appVersion?: string;
  userId?: number;
  userDisplayName?: string;
  userOnline?: boolean;
  lastIp?: string;
  lastHeartbeatTime?: string;
  status?: string;
  online?: boolean;
}

export interface OpcDesktopDeviceQuery {
  onlineOnly?: boolean;
  deviceName?: string;
}
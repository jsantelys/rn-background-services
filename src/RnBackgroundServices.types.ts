export enum PermissionStatus {
  GRANTED = "granted",
  DENIED = "denied",
  UNDETERMINED = "undetermined",
}

export interface PermissionsResponse {
  status: PermissionStatus;
  expires: string;
  granted: boolean;
  canAskAgain: boolean;
  reason?: string | null;
}


export type BackgroundServicesAvailability = {
  isAvailable: boolean;
  reason?: string | null;
};

export type RegisterServiceResult = {
  success: boolean;
  reason?: string | null;
};

export type StartServiceResult = {
  success: boolean;
  reason?: string | null;
};

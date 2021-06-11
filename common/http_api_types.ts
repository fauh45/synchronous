export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  user_account: string;
  device_id: string;
  robot_device_id: string;
  server_url: string;
}

export interface CloseRequest extends AuthRequest {
  device_id: string;
}

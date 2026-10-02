import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class RealtimeService {
  private socket: Socket | null = null;
  private isConnected = false;

  public init() {
    let token: string | undefined;
    try { token = JSON.parse(localStorage.getItem('kumbh_user') || 'null')?.token; } catch { token = undefined; }
    if (!token) return;
    if (this.socket?.auth && (this.socket.auth as { token?: string }).token === token) return;
    this.socket?.disconnect();
    this.socket = io(SOCKET_URL, { auth: { token }, transports: ['websocket', 'polling'], reconnectionAttempts: 10 });
    this.socket.on('connect', () => { this.isConnected = true; });
    this.socket.on('disconnect', () => { this.isConnected = false; });
    this.socket.on('connect_error', () => { this.isConnected = false; });
  }

  public disconnect() { this.socket?.disconnect(); this.socket = null; this.isConnected = false; }
  public subscribe(event: string, callback: (data: any) => void) { if (!this.socket) this.init(); this.socket?.on(event, callback); }
  public unsubscribe(event: string, callback?: (data: any) => void) { callback ? this.socket?.off(event, callback) : this.socket?.off(event); }
  public emit(event: string, data: any) { if (!this.socket) this.init(); this.socket?.emit(event, data); }
  public getStatus() { return this.isConnected; }
}
export const realtimeService = new RealtimeService();

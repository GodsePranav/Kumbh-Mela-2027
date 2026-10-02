/**
 * Realtime Service using Socket.io Client
 * Listens for P0 SOS broadcasts, responder updates, crowd alerts, geofence violations, and incidents.
 */

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

class RealtimeService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  public init() {
    if (this.socket) return;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 10,
    });

    this.socket.on('connect', () => {
      console.log('⚡ Socket connected:', this.socket?.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (err) => {
      console.warn('Socket connection warning:', err.message);
      this.isConnected = false;
    });
  }

  public subscribe(event: string, callback: (data: any) => void) {
    if (!this.socket) this.init();
    this.socket?.on(event, callback);
  }

  public unsubscribe(event: string, callback?: (data: any) => void) {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

  public emit(event: string, data: any) {
    if (!this.socket) this.init();
    this.socket?.emit(event, data);
  }

  public getStatus(): boolean {
    return this.isConnected;
  }
}

export const realtimeService = new RealtimeService();

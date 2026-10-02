export interface LocationData { lat: number; lng: number; accuracy: number; timestamp: number; isStale: boolean }

class LocationService {
  private currentLocation: LocationData | null = null;
  private watchId: number | null = null;
  private listeners = new Map<(loc: LocationData) => void, (error: GeolocationPositionError | Error) => void>();

  public getCurrentLocation(maxAccuracy = 100): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) return reject(new Error('Location services are unavailable on this device.'));
      navigator.geolocation.getCurrentPosition((pos) => {
        const loc = this.toLocation(pos);
        this.currentLocation = loc;
        if (loc.accuracy > maxAccuracy) return reject(new Error(`GPS accuracy is too low (${Math.round(loc.accuracy)} m). Move to an open area and retry.`));
        resolve(loc);
      }, (err) => reject(this.locationError(err)), { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
    });
  }

  public watchLocation(callback: (loc: LocationData) => void, onError: (error: GeolocationPositionError | Error) => void = () => {}): () => void {
    if (typeof navigator === 'undefined' || !navigator.geolocation) { onError(new Error('Location services are unavailable on this device.')); return () => {}; }
    this.listeners.set(callback, onError);
    if (this.watchId === null) {
      this.watchId = navigator.geolocation.watchPosition((pos) => {
        this.currentLocation = this.toLocation(pos);
        this.listeners.forEach((_onError, listener) => listener(this.currentLocation!));
      }, (err) => this.listeners.forEach((onError) => onError(this.locationError(err))), { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 });
    }
    return () => {
      this.listeners.delete(callback);
      if (!this.listeners.size && this.watchId !== null) { navigator.geolocation.clearWatch(this.watchId); this.watchId = null; }
    };
  }

  public getCachedLocation() { return this.currentLocation; }
  private toLocation(pos: GeolocationPosition): LocationData { return { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy, timestamp: pos.timestamp || Date.now(), isStale: false }; }
  private locationError(err: GeolocationPositionError) {
    if (err.code === err.PERMISSION_DENIED) return new Error('Location permission was denied. Enable location access to send an SOS with your precise position.');
    if (err.code === err.POSITION_UNAVAILABLE) return new Error('GPS location is unavailable. Move to an area with a clear sky view and retry.');
    if (err.code === err.TIMEOUT) return new Error('GPS timed out. Please retry in a moment.');
    return new Error(err.message || 'Unable to determine your GPS location.');
  }
}
export const locationService = new LocationService();

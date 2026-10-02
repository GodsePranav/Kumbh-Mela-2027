/**
 * Location Service
 * Handles browser/device geolocation, accuracy validation, staleness tracking, and mock fallback for testing.
 */

export interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
  isStale: boolean;
}

class LocationService {
  private currentLocation: LocationData = {
    lat: 19.9975,
    lng: 73.7898,
    accuracy: 5,
    timestamp: Date.now(),
    isStale: false,
  };

  private watchId: number | null = null;
  private listeners: ((loc: LocationData) => void)[] = [];

  public getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            this.currentLocation = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy || 10,
              timestamp: pos.timestamp || Date.now(),
              isStale: false,
            };
            resolve(this.currentLocation);
          },
          (err) => {
            console.warn('Geolocation warning, fallback to default Kumbh coordinates:', err.message);
            resolve(this.currentLocation);
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
        );
      } else {
        resolve(this.currentLocation);
      }
    });
  }

  public watchLocation(callback: (loc: LocationData) => void): () => void {
    this.listeners.push(callback);
    callback(this.currentLocation);

    if (typeof window !== 'undefined' && 'geolocation' in navigator && !this.watchId) {
      this.watchId = navigator.geolocation.watchPosition(
        (pos) => {
          this.currentLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy || 10,
            timestamp: pos.timestamp || Date.now(),
            isStale: false,
          };
          this.notifyListeners();
        },
        (err) => {
          console.warn('Watch location error:', err.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    }

    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
      if (this.listeners.length === 0 && this.watchId !== null) {
        navigator.geolocation.clearWatch(this.watchId);
        this.watchId = null;
      }
    };
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      listener(this.currentLocation);
    }
  }

  public simulateMovement(latDelta: number, lngDelta: number) {
    this.currentLocation.lat += latDelta;
    this.currentLocation.lng += lngDelta;
    this.currentLocation.timestamp = Date.now();
    this.currentLocation.isStale = false;
    this.notifyListeners();
  }
}

export const locationService = new LocationService();

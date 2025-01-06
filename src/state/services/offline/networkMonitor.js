class NetworkMonitor {
    constructor() {
        this.isOnline = navigator.onLine;
        this.listeners = new Set();
        this.qualityListeners = new Set();

        window.addEventListener('online', () => this.updateStatus(true));
        window.addEventListener('offline', () => this.updateStatus(false));

        // Monitor connection quality if available
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', () => this.updateConnectionQuality());
        }
    }

    updateStatus(status) {
        this.isOnline = status;
        this.notifyListeners();
    }

    updateConnectionQuality() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            const quality = {
                type: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt
            };
            this.notifyQualityListeners(quality);
        }
    }

    onOnline(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    onConnectionQualityChange(callback) {
        this.qualityListeners.add(callback);
        return () => this.qualityListeners.delete(callback);
    }

    notifyListeners() {
        this.listeners.forEach(listener => listener(this.isOnline));
    }

    notifyQualityListeners(quality) {
        this.qualityListeners.forEach(listener => listener(quality));
    }

    // Helper method to check if connection is good enough for sync
    isConnectionStable() {
        if (!this.isOnline) return false;
        if (!('connection' in navigator)) return true;

        const connection = navigator.connection;
        // Consider connection as unstable if it's a slow 2G or data saving mode is on
        return !(connection.saveData ||
            connection.effectiveType === 'slow-2g' ||
            connection.effectiveType === '2g');
    }
}

export const networkMonitor = new NetworkMonitor();
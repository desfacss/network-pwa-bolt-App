// class NetworkMonitor {
//     constructor() {
//         this.isOnline = navigator.onLine;
//         this.listeners = new Set();
//         this.qualityListeners = new Set();

//         window.addEventListener('online', () => this.updateStatus(true));
//         window.addEventListener('offline', () => this.updateStatus(false));

//         // Monitor connection quality if available
//         if ('connection' in navigator) {
//             navigator.connection.addEventListener('change', () => this.updateConnectionQuality());
//         }
//     }

//     updateStatus(status) {
//         this.isOnline = status;
//         this.notifyListeners();
//     }

//     updateConnectionQuality() {
//         if ('connection' in navigator) {
//             const connection = navigator.connection;
//             const quality = {
//                 type: connection.effectiveType,
//                 downlink: connection.downlink,
//                 rtt: connection.rtt
//             };
//             this.notifyQualityListeners(quality);
//         }
//     }

//     onOnline(callback) {
//         this.listeners.add(callback);
//         return () => this.listeners.delete(callback);
//     }

//     onConnectionQualityChange(callback) {
//         this.qualityListeners.add(callback);
//         return () => this.qualityListeners.delete(callback);
//     }

//     notifyListeners() {
//         this.listeners.forEach(listener => listener(this.isOnline));
//     }

//     notifyQualityListeners(quality) {
//         this.qualityListeners.forEach(listener => listener(quality));
//     }

//     // Helper method to check if connection is good enough for sync
//     isConnectionStable() {
//         if (!this.isOnline) return false;
//         if (!('connection' in navigator)) return true;

//         const connection = navigator.connection;
//         // Consider connection as unstable if it's a slow 2G or data saving mode is on
//         return !(connection.saveData ||
//             connection.effectiveType === 'slow-2g' ||
//             connection.effectiveType === '2g');
//     }
// }

// export const networkMonitor = new NetworkMonitor();





// export const networkMonitor = {
//     _isOnline: navigator.onLine,
//     _isConnectionStable: true,

//     get isOnline() {
//         return this._isOnline;
//     },

//     get isConnectionStable() {
//         return this._isConnectionStable;
//     },

//     onOnline: [],
//     onOffline: [],
//     onConnectionQualityChange: [],

//     init() {
//         window.addEventListener('online', () => {
//             this._isOnline = true;
//             this.notify('onOnline');
//         });

//         window.addEventListener('offline', () => {
//             this._isOnline = false;
//             this.notify('onOffline');
//         });

//         // Simulating connection quality check (implement real checks based on your needs)
//         setInterval(() => {
//             // Here, you can implement checks for connection quality
//             const newConnectionState = Math.random() > 0.2; // Simulated stability check
//             if (newConnectionState !== this._isConnectionStable) {
//                 this._isConnectionStable = newConnectionState;
//                 this.notify('onConnectionQualityChange');
//             }
//         }, 10000); // Check every 10 seconds
//     },

//     notify(eventName) {
//         this[eventName].forEach(callback => callback());
//     },

//     addEventListener(eventName, callback) {
//         if (this[eventName].includes(callback)) return;
//         this[eventName].push(callback);
//     },

//     removeEventListener(eventName, callback) {
//         this[eventName] = this[eventName].filter(cb => cb !== callback);
//     }
// };

// networkMonitor.init();


// services/networkMonitor.js
// class NetworkMonitor {
//     constructor() {
//         this.isOnline = navigator.onLine;
//         this.listeners = {
//             online: new Set(),
//             offline: new Set(),
//             connectionQuality: new Set()
//         };

//         // Initialize connection quality state
//         this.connectionQuality = {
//             type: 'unknown',
//             downlink: null,
//             rtt: null,
//             isStable: true
//         };

//         // Bind methods to preserve context
//         this.updateOnlineStatus = this.updateOnlineStatus.bind(this);
//         this.updateConnectionQuality = this.updateConnectionQuality.bind(this);

//         // Add window listeners
//         window.addEventListener('online', () => this.updateOnlineStatus(true));
//         window.addEventListener('offline', () => this.updateOnlineStatus(false));

//         // Monitor connection quality if available
//         if ('connection' in navigator) {
//             navigator.connection.addEventListener('change', this.updateConnectionQuality);
//             this.updateConnectionQuality(); // Initial check
//         }

//         // Periodic connection stability check
//         setInterval(() => {
//             this.checkConnectionStability();
//         }, 10000);
//     }

//     updateOnlineStatus(status) {
//         this.isOnline = status;
//         const eventName = status ? 'online' : 'offline';
//         this.notifyListeners(eventName, status);
//     }

//     updateConnectionQuality() {
//         if ('connection' in navigator) {
//             const connection = navigator.connection;
//             this.connectionQuality = {
//                 type: connection.effectiveType,
//                 downlink: connection.downlink,
//                 rtt: connection.rtt,
//                 isStable: this.isConnectionStable()
//             };
//             this.notifyListeners('connectionQuality', this.connectionQuality);
//         }
//     }

//     checkConnectionStability() {
//         const wasStable = this.connectionQuality.isStable;
//         const isNowStable = this.isConnectionStable();
        
//         if (wasStable !== isNowStable) {
//             this.connectionQuality.isStable = isNowStable;
//             this.notifyListeners('connectionQuality', this.connectionQuality);
//         }
//     }

//     // Main event subscription method (replaces both onOnline and addEventListener)
//     subscribe(eventName, callback) {
//         if (!this.listeners[eventName]) {
//             throw new Error(`Invalid event name: ${eventName}`);
//         }
//         this.listeners[eventName].add(callback);
        
//         // Immediately call with current state for online/offline status
//         if (eventName === 'online' || eventName === 'offline') {
//             callback(this.isOnline);
//         }
        
//         // Return unsubscribe function
//         return () => {
//             this.listeners[eventName].delete(callback);
//         };
//     }

//     // Backwards compatibility method
//     onOnline(callback) {
//         return this.subscribe('online', callback);
//     }

//     notifyListeners(eventName, data) {
//         if (this.listeners[eventName]) {
//             this.listeners[eventName].forEach(listener => listener(data));
//         }
//     }

//     isConnectionStable() {
//         if (!this.isOnline) return false;
//         if (!('connection' in navigator)) return true;

//         const connection = navigator.connection;
//         return !(
//             connection.saveData ||
//             connection.effectiveType === 'slow-2g' ||
//             connection.effectiveType === '2g' ||
//             (connection.downlink && connection.downlink < 0.5) || // Less than 0.5 Mbps
//             (connection.rtt && connection.rtt > 1000) // More than 1 second RTT
//         );
//     }

//     // Public getter for current state
//     getStatus() {
//         return {
//             isOnline: this.isOnline,
//             connectionQuality: this.connectionQuality
//         };
//     }
// }

// export const networkMonitor = new NetworkMonitor();



// class NetworkMonitor {
//     constructor() {
//         // Initialize the online status
//         this.isOnline = navigator.onLine;
        
//         // Use a Set for listeners to manage event subscriptions
//         this.listeners = new Set(); // Single set for all listeners since we only have 'online' events

//         // Bind methods to preserve context
//         this.updateOnlineStatus = this.updateOnlineStatus.bind(this);

//         // Add window listeners for online/offline status
//         window.addEventListener('online', () => this.updateOnlineStatus(true));
//         window.addEventListener('offline', () => this.updateOnlineStatus(false));

//         console.log("A1. NetworkMonitor initialized. Current status:", this.isOnline);
//     }

//     /**
//      * Updates the online status and notifies listeners
//      * @param {boolean} status - Whether the network is online or not
//      */
//     updateOnlineStatus(status) {
//         console.log("A2. Network status update:", status);
//         this.isOnline = status;
//         this.notifyListeners(status);
//     }

//     /**
//      * Subscribes a callback to be notified when the network status changes
//      * @param {Function} callback - Function to call when status changes
//      * @returns {Function} - An unsubscribe function
//      */
//     subscribe(callback) {
//         this.listeners.add(callback);
//         console.log("A3. New listener subscribed. Total listeners:", this.listeners.size);
//         // Notify new subscriber with the current status
//         callback(this.isOnline);

//         // Return an unsubscribe function
//         return () => {
//             this.listeners.delete(callback);
//             console.log("A4. Listener unsubscribed. Remaining listeners:", this.listeners.size);
//         };
//     }

//     /**
//      * Notifies all listeners of a change in network status
//      * @param {boolean} status - The new network status
//      */
//     notifyListeners(status) {
//         console.log("A5. Notifying", this.listeners.size, "listeners of status change:", status);
//         this.listeners.forEach(listener => listener(status));
//     }

//     /**
//      * Returns the current network status
//      * @return {Object} - An object with the current online status
//      */
//     getStatus() {
//         console.log("A6. Current network status:", this.isOnline);
//         return { isOnline: this.isOnline };
//     }
// }

// // Export a single instance
// export const networkMonitor = new NetworkMonitor();


// class NetworkMonitor {
//     constructor() {
//         this.isOnline = navigator.onLine;
//         this.listeners = new Set();
//         this.connectionQuality = {
//             type: 'unknown',
//             downlink: null,
//             rtt: null,
//             isStable: true
//         };

//         this.updateOnlineStatus = this.updateOnlineStatus.bind(this);
//         this.updateConnectionQuality = this.updateConnectionQuality.bind(this);

//         window.addEventListener('online', () => this.updateOnlineStatus(true));
//         window.addEventListener('offline', () => this.updateOnlineStatus(false));

//         if ('connection' in navigator) {
//             navigator.connection.addEventListener('change', this.updateConnectionQuality);
//             this.updateConnectionQuality(); // Initial check
//         }

//         // Periodic connection stability check
//         setInterval(() => {
//             this.checkConnectionStability();
//         }, 10000);

//         console.log("A1. NetworkMonitor initialized. Current status:", this.isOnline);
//     }

//     updateOnlineStatus(status) {
//         console.log("A2. Network status update:", status);
//         this.isOnline = status;
//         this.notifyListeners(status);
//     }

//     notifyListeners(status) {
//         console.log("A5. Notifying", this.listeners.size, "listeners of status change:", status);
//         this.listeners.forEach(listener => {
//             if (typeof listener === 'function') {
//                 listener(status);
//             } else {
//                 console.warn("A5.1. Listener is not a function, skipping:", listener);
//                 // Optionally, you might want to clean up non-function listeners here:
//                 // this.listeners.delete(listener);
//             }
//         });
//     }

//     updateConnectionQuality() {
//         if ('connection' in navigator) {
//             const connection = navigator.connection;
//             this.connectionQuality = {
//                 type: connection.effectiveType,
//                 downlink: connection.downlink,
//                 rtt: connection.rtt,
//                 isStable: this.isConnectionStable()
//             };
//             this.notifyListeners('connectionQuality', this.connectionQuality);
//         }
//     }

//     checkConnectionStability() {
//         const wasStable = this.connectionQuality.isStable;
//         const isNowStable = this.isConnectionStable();
        
//         if (wasStable !== isNowStable) {
//             this.connectionQuality.isStable = isNowStable;
//             this.notifyListeners('connectionQuality', this.connectionQuality);
//         }
//     }

//     subscribe(callback) {
//         console.log('C1. Subscribing with callback:', callback, 'Type:', typeof callback);
//         this.listeners.add(callback);
//         console.log("C2. New listener subscribed. Total listeners:", this.listeners.size);
//         callback(this.isOnline); // Notify new subscriber with current status

//         return () => {
//             this.listeners.delete(callback);
//             console.log("A4. Listener unsubscribed. Remaining listeners:", this.listeners.size);
//         };
//     }

//     notifyListeners(eventName, data) {
//         console.log(`A5. Notifying ${this.listeners.size} listeners of ${eventName} change:`, data ?? this.isOnline);
//         this.listeners.forEach(listener => listener(data ?? this.isOnline));
//     }

//     isConnectionStable() {
//         if (!this.isOnline) return false;
//         if (!('connection' in navigator)) return true;

//         const connection = navigator.connection;
//         return !(
//             connection.saveData ||
//             connection.effectiveType === 'slow-2g' ||
//             connection.effectiveType === '2g' ||
//             (connection.downlink && connection.downlink < 0.5) || 
//             (connection.rtt && connection.rtt > 1000)
//         );
//     }

//     getStatus() {
//         console.log("A6. Current network status:", { isOnline: this.isOnline, connectionQuality: this.connectionQuality });
//         return {
//             isOnline: this.isOnline,
//             connectionQuality: this.connectionQuality,
//             isConnectionStable: this.isConnectionStable()
//         };
//     }
// }

// export const networkMonitor = new NetworkMonitor();


// compare with above when connection quality is needed
class NetworkMonitor {
    constructor() {
        this.isOnline = navigator.onLine;
        this.listeners = new Set(); // Single set for all listeners since we only have 'online'/'offline' events

        this.updateOnlineStatus = this.updateOnlineStatus.bind(this);

        window.addEventListener('online', () => this.updateOnlineStatus(true));
        window.addEventListener('offline', () => this.updateOnlineStatus(false));

        console.log("A1. NetworkMonitor initialized. Current status:", this.isOnline);
    }

    updateOnlineStatus(status) {
        console.log("A2. Network status update:", status);
        this.isOnline = status;
        this.notifyListeners(status);
    }

    subscribe(callback) {
        if (typeof callback !== 'function') {
            console.error('NetworkMonitor: Attempted to subscribe with a non-function:', callback);
            return () => {};
        }
        this.listeners.add(callback);
        console.log("A3. New listener subscribed. Total listeners:", this.listeners.size);
        callback(this.isOnline); // Notify new subscriber with current status

        return () => {
            this.listeners.delete(callback);
            console.log("A4. Listener unsubscribed. Remaining listeners:", this.listeners.size);
        };
    }

    notifyListeners(status) {
        console.log("A5. Notifying", this.listeners.size, "listeners of status change:", status);
        this.listeners.forEach(listener => {
            if (typeof listener === 'function') {
                listener(status);
            } else {
                console.error('Attempted to call a non-function listener:', listener);
                this.listeners.delete(listener); // Remove non-function listeners
            }
        });
    }

    getStatus() {
        console.log("A6. Current network status:", this.isOnline);
        return { isOnline: this.isOnline };
    }
}

export const networkMonitor = new NetworkMonitor();


// Notes:
// Simplified Event Management: Here, we've simplified to only manage 'online'/'offline' events. If you need more specific event types like connection quality, you would need to extend this class or add more complex listener management.
// Removed Connection Quality: For simplicity, we've removed connection quality monitoring. If you need this feature, you could reintroduce it with separate listeners or another method.
// Single Listener Set: We use a single Set for all listeners instead of multiple Sets per event type since we're only handling one type of event (online/offline status). 
// Backward Compatibility: Removed onOnline method as it's now redundant with subscribe.
import { debounce } from 'lodash';

export class NetworkMonitor {
  constructor() {
    this.online = navigator.onLine;
    this.listeners = new Set();
    this.updateOnlineStatus = debounce(this.updateOnlineStatus.bind(this), 300); // Debounce network changes
    
    window.addEventListener('online', this.updateOnlineStatus);
    window.addEventListener('offline', this.updateOnlineStatus);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.online); // Immediately notify new subscriber of current state
    return () => this.listeners.delete(listener); // Return unsubscribe function
  }

  updateOnlineStatus() {
    const wasOnline = this.online;
    this.online = navigator.onLine;
    
    if (wasOnline !== this.online) {
      this.listeners.forEach(listener => listener(this.online));
    }
  }

  isOnline() {
    return this.online;
  }
}

export const networkMonitor = new NetworkMonitor();



// class NetworkMonitor {
//   constructor() {
//     this.isOnline = navigator.onLine;
//     this.listeners = new Set(); // Single set for all listeners since we only have 'online'/'offline' events

//     this.updateOnlineStatus = this.updateOnlineStatus.bind(this);

//     window.addEventListener('online', () => this.updateOnlineStatus(true));
//     window.addEventListener('offline', () => this.updateOnlineStatus(false));

//     console.log("A1. NetworkMonitor initialized. Current status:", this.isOnline);
//   }

//   updateOnlineStatus(status) {
//     console.log("A2. Network status update:", status);
//     this.isOnline = status;
//     this.notifyListeners(status);
//   }

//   subscribe(callback) {
//     if (typeof callback !== 'function') {
//       console.error('NetworkMonitor: Attempted to subscribe with a non-function:', callback);
//       return () => { };
//     }
//     this.listeners.add(callback);
//     console.log("A3. New listener subscribed. Total listeners:", this.listeners.size);
//     callback(this.isOnline); // Notify new subscriber with current status

//     return () => {
//       this.listeners.delete(callback);
//       console.log("A4. Listener unsubscribed. Remaining listeners:", this.listeners.size);
//     };
//   }

//   notifyListeners(status) {
//     console.log("A5. Notifying", this.listeners.size, "listeners of status change:", status);
//     this.listeners.forEach(listener => {
//       if (typeof listener === 'function') {
//         listener(status);
//       } else {
//         console.error('Attempted to call a non-function listener:', listener);
//         this.listeners.delete(listener); // Remove non-function listeners
//       }
//     });
//   }

//   getStatus() {
//     console.log("A6. Current network status:", this.isOnline);
//     return { isOnline: this.isOnline };
//   }
// }

// export const networkMonitor = new NetworkMonitor();
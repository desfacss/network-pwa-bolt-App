export class NetworkMonitor {
    constructor() {
      this.online = navigator.onLine;
      window.addEventListener('online', this.updateOnlineStatus.bind(this));
      window.addEventListener('offline', this.updateOnlineStatus.bind(this));
    }
  
    updateOnlineStatus() {
      this.online = navigator.onLine;
    }
  
    isOnline() {
      return this.online;
    }
  }
  
  export const networkMonitor = new NetworkMonitor();
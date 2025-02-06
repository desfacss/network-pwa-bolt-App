import { networkMonitor } from '../../../services/networkMonitor';

export class SyncQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  async add(operation) {
    this.queue.push(operation);
    if (!this.processing && networkMonitor.isOnline()) {
      await this.process();
    }
  }

  async process() {
    if (this.queue.length === 0 || !networkMonitor.isOnline()) return;

    this.processing = true;
    const operation = this.queue.shift();

    try {
      await operation();
    } catch (error) {
      console.error('Sync failed:', error);
      this.queue.unshift(operation); // requeue if failed
    }

    this.processing = false;
    await this.process(); // process next operation if any
  }
}

export const syncQueue = new SyncQueue();
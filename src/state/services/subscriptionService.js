// services/realtime/subscriptionService.js
/**
 * Real-time subscription service using Supabase
 */
import { supabase } from 'configs/SupabaseConfig';
import { indexedDB } from '../cache/indexedDB';

const subscriptions = new Map();

async function subscribe(table, filter, callback) {
    const subscription = supabase
        .from(table)
        .on('*', async (payload) => {
            // Cache the update
            await indexedDB.set('records', `${table}-${payload.new.id}`, payload.new);
            // Trigger callback
            callback(payload);
        })
        .subscribe();

    subscriptions.set(table, subscription);
}

function unsubscribe(table) {
    const subscription = subscriptions.get(table);
    if (subscription) {
        supabase.removeSubscription(subscription);
        subscriptions.delete(table);
    }
}

export { subscribe, unsubscribe };

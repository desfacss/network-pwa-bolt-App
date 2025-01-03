// Example function to fetch and store configuration
import { indexedDB } from '../services/cache/indexedDB';
import { supabase } from '../services/api/supabase';

async function fetchAndPersistConfig(configKey) {
  try {
    // Check local storage first
    const localConfig = await indexedDB.get('configs', configKey);
    
    // Fetch server's last updated timestamp
    const { data: { lastUpdated } } = await supabase
      .from('view_config')
      .select('lastUpdated')
      .eq('configKey', configKey)
      .single();

    // If local data doesn't exist or is outdated, fetch new data
    if (!localConfig || (localConfig.lastUpdated < lastUpdated)) {
      const { data: configData } = await supabase
        .from('view_config')
        .select('config')
        .eq('configKey', configKey)
        .single();

      if (configData) {
        await indexedDB.set('configs', configKey, {
          ...configData.config,
          lastUpdated: new Date(lastUpdated).getTime() // Convert to milliseconds
        });
      }
    }

    return localConfig ? localConfig : await indexedDB.get('configs', configKey);
  } catch (error) {
    console.error('Error fetching or persisting config:', error);
    return null;
  }
}



// Example usage in a component or hook
import { useEffect, useState } from 'react';
import { fetchAndPersistConfig } from './configFetcher';

const useConfig = (configKey) => {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const loadConfig = async () => {
      const fetchedConfig = await fetchAndPersistConfig(configKey);
      setConfig(fetchedConfig);
    };
    loadConfig();
  }, [configKey]);

  return config;
};



// EITHER 
// Pseudo-code for a background update check
function scheduleConfigUpdate() {
    setInterval(async () => {
      for (const configKey of ['globalConfig', 'formSchema', 'uiSchema']) {
        await fetchAndPersistConfig(configKey);
      }
    }, 30 * 24 * 60 * 60 * 1000); // 30 days in milliseconds
  }


//   OR 
// Setup real-time subscription from supabase
supabase
  .from('view_config')
  .on('*', async (payload) => {
    if (payload.eventType === 'UPDATE') {
      await fetchAndPersistConfig(payload.new.configKey);
    }
  })
  .subscribe();


//   Wen configurations should be cleared (e.g., on a specific user action or logout), clear the relevant IndexedDB stores:
  async function clearLocalConfig(configKey) {
    try {
      await indexedDB.delete('configs', configKey);
    } catch (error) {
      console.error('Error clearing local config:', error);
    }
  }
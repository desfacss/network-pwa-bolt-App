src/
├── components/
│   ├── DynamicTable/
│   │   └── index.jsx
│   ├── layout/
│   │   └── ModalManager.js
│   └── notifications/
│       └── ToastManager.js
├── features/
│   └── grid/
│       ├── components/
│       │   ├── AdvancedFilters.js
│       │   └── CustomViews.js
│       └── hooks/
│           ├── useGridExport.js
│           └── useGridImport.js
├── forms/
│   ├── hooks/
│   │   └── useFormState.js
│   └── components/
│       └── DynamicForm.js
├── hooks/
│   ├── usePerformanceMonitor.js
│   ├── useRecords.js
│   └── useViewConfig.js
├── services/
│   ├── api/
│   │   └── supabase.js
│   ├── analytics/
│   │   ├── eventTracking.js
│   │   ├── userActivity.js
│   │   └── errorReporting.js
│   ├── cache/
│   │   └── indexedDB.js
│   ├── offline/
│   │   ├── syncQueue.js
│   │   ├── conflictResolution.js
│   │   └── networkMonitor.js
│   ├── realtime/
│   │   └── subscriptionService.js
│   └── security/
│       └── tokenManager.js

├── state/
│   ├── stores/
│   │   ├── dataStore.js
│   │   ├── userStore.js
│   │   ├── viewConfigStore.js
│   │   └── workflowStore.js
│   └── hooks/
│       ├── useData.js
│       ├── useUsers.js
│       ├── useViewConfig.js
│       └── useWorkflowConfig.js
├── sync/
│   └── dataMerge.js***
├── types/
│   └── index.js
├── utils/
│   ├── performance/
│   │   ├── lazyLoader.js
│   │   └── virtualList.js
│   └── storage/
│       └── indexedDB.js***
└── services/
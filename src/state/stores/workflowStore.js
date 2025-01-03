import { create } from 'zustand';

const useWorkflowConfigStore = create((set) => ({
    workflowConfig: null,
    setWorkflowConfig: (config) => set({ workflowConfig: config }),
}));

export default useWorkflowConfigStore;

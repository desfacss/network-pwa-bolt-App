// # forms/hooks/useFormState.js
// /**
//  * Custom hook for managing form state with persistence
//  */
// import { useState, useCallback } from 'react';
// import { indexedDB } from '../../services/cache/indexedDB';

// export const useFormState = (formId) => {
//   const [formData, setFormData] = useState({});
//   const [errors, setErrors] = useState({});
//   const [isDirty, setIsDirty] = useState(false);

//   const loadSavedState = useCallback(async () => {
//     const saved = await indexedDB.get('formDrafts', formId);
//     if (saved) {
//       setFormData(saved.data);
//       setIsDirty(true);
//     }
//   }, [formId]);

//   const updateField = useCallback(async (field, value) => {
//     const newData = { ...formData, [field]: value };
//     setFormData(newData);
//     setIsDirty(true);
    
//     // Save draft
//     await indexedDB.set('formDrafts', formId, newData);
//   }, [formData, formId]);

//   const validate = useCallback((rules) => {
//     const newErrors = {};
//     Object.keys(rules).forEach(field => {
//       const value = formData[field];
//       const fieldRules = rules[field];
      
//       if (fieldRules.required && !value) {
//         newErrors[field] = 'This field is required';
//       }
//       // Add more validation rules as needed
//     });
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   }, [formData]);

//   return {
//     formData,
//     errors,
//     isDirty,
//     updateField,
//     validate,
//     loadSavedState
//   };
// };

// forms/hooks/useFormState.js
/**
 * Custom hook for managing form state with persistence
 */
import { useState, useCallback } from 'react';
import { indexedDB } from '../../services/cache/indexedDB';

export const useFormState = (formId) => {
  // State for form data, errors, and dirty state
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  // Load saved form state from IndexedDB when component mounts
  const loadSavedState = useCallback(async () => {
    try {
      const saved = await indexedDB.get('formDrafts', formId);
      if (saved) {
        setFormData(saved.data);
        setIsDirty(true);
      }
    } catch (error) {
      console.error('Error loading form state:', error);
    }
  }, [formId]);

  // Update form field and save draft to IndexedDB
  const updateField = useCallback(async (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    setIsDirty(true);
    
    try {
      await indexedDB.set('formDrafts', formId, newData);
    } catch (error) {
      console.error('Error saving form draft:', error);
    }
  }, [formData, formId]);

  // Validate form based on provided rules
  const validate = useCallback((rules) => {
    const newErrors = {};
    Object.keys(rules).forEach(field => {
      const value = formData[field];
      const fieldRules = rules[field];
      
      if (fieldRules.required && !value) {
        newErrors[field] = 'This field is required';
      }
      // Add more validation rules as needed
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  return {
    formData,
    errors,
    isDirty,
    updateField,
    validate,
    loadSavedState
  };
};

// # forms/components/DynamicForm.js
/**
 * Dynamic form component with validation and state management
 */
import React, { useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button } from 'antd';
import { useFormState } from '../hooks/useFormState';

const fieldComponents = {
  text: Input,
  select: Select,
  date: DatePicker,
  // Add more field types as needed
};

export const DynamicForm = ({ 
  formId, 
  fields, 
  onSubmit,
  validationRules = {} 
}) => {
  const { 
    formData, 
    errors, 
    isDirty, 
    updateField, 
    validate, 
    loadSavedState 
  } = useFormState(formId);

  useEffect(() => {
    loadSavedState();
  }, [loadSavedState]);

  const handleSubmit = async () => {
    if (validate(validationRules)) {
      await onSubmit(formData);
    }
  };

  return (
    <Form layout="vertical">
      {fields.map(field => {
        const Component = fieldComponents[field.type];
        return (
          <Form.Item
            key={field.name}
            label={field.label}
            validateStatus={errors[field.name] ? 'error' : ''}
            help={errors[field.name]}
          >
            <Component
              value={formData[field.name]}
              onChange={value => updateField(field.name, value)}
              {...field.props}
            />
          </Form.Item>
        );
      })}
      <Button 
        type="primary" 
        onClick={handleSubmit}
        disabled={!isDirty}
      >
        Submit
      </Button>
    </Form>
  );
};

// # components/layout/ModalManager.js
/**
 * Global modal management system
 */
import React from 'react';
import { Modal } from 'antd';
import create from 'zustand';

const useModalStore = create((set) => ({
  modals: {},
  openModal: (id, config) => 
    set(state => ({
      modals: { ...state.modals, [id]: { ...config, visible: true } }
    })),
  closeModal: (id) =>
    set(state => ({
      modals: { ...state.modals, [id]: { ...state.modals[id], visible: false } }
    })),
}));

export const ModalManager = () => {
  const modals = useModalStore(state => state.modals);
  const closeModal = useModalStore(state => state.closeModal);

  return Object.entries(modals).map(([id, config]) => (
    <Modal
      key={id}
      visible={config.visible}
      onCancel={() => closeModal(id)}
      {...config}
    >
      {config.content}
    </Modal>
  ));
};

export const useModal = () => {
  const openModal = useModalStore(state => state.openModal);
  const closeModal = useModalStore(state => state.closeModal);
  
  return { openModal, closeModal };
};

// # components/notifications/ToastManager.js
/**
 * Global toast notification system
 */
import React from 'react';
import { notification } from 'antd';
import create from 'zustand';

const useToastStore = create((set) => ({
  notifications: [],
  addNotification: (config) =>
    set(state => ({
      notifications: [...state.notifications, { id: Date.now(), ...config }]
    })),
  removeNotification: (id) =>
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    })),
}));

export const ToastManager = () => {
  const notifications = useToastStore(state => state.notifications);
  const removeNotification = useToastStore(state => state.removeNotification);

  React.useEffect(() => {
    notifications.forEach(({ id, type, message, description }) => {
      notification[type]({
        message,
        description,
        onClose: () => removeNotification(id),
      });
    });
  }, [notifications, removeNotification]);

  return null;
};

export const useToast = () => {
  const addNotification = useToastStore(state => state.addNotification);
  
  return {
    success: (message, description) => 
      addNotification({ type: 'success', message, description }),
    error: (message, description) => 
      addNotification({ type: 'error', message, description }),
    warning: (message, description) => 
      addNotification({ type: 'warning', message, description }),
    info: (message, description) => 
      addNotification({ type: 'info', message, description }),
  };
};

// // # features/grid/components/AdvancedFilters.js
// /**
//  * Advanced filtering component for data grids
//  */
// import React, { useState } from 'react';
// import { Form, Input, Select, Button, Space } from 'antd';
// import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

// const operators = {
//   string: ['equals', 'contains', 'startsWith', 'endsWith'],
//   number: ['equals', 'greaterThan', 'lessThan', 'between'],
//   date: ['equals', 'before', 'after', 'between'],
// };

// export const AdvancedFilters = ({ columns, onApply }) => {
//   const [filters, setFilters] = useState([]);

//   const addFilter = () => {
//     setFilters([...filters, { field: '', operator: '', value: '' }]);
//   };

//   const removeFilter = (index) => {
//     setFilters(filters.filter((_, i) => i !== index));
//   };

//   const updateFilter = (index, key, value) => {
//     const newFilters = [...filters];
//     newFilters[index] = { ...newFilters[index], [key]: value };
//     setFilters(newFilters);
//   };

//   const handleApply = () => {
//     onApply(filters);
//   };

//   return (
//     <Form layout="vertical">
//       {filters.map((filter, index) => (
//         <Space key={index} align="baseline">
//           <Form.Item label="Field">
//             <Select
//               value={filter.field}
//               onChange={value => updateFilter(index, 'field', value)}
//             >
//               {columns.map(col => (
//                 <Select.Option key={col.key} value={col.key}>
//                   {col.title}
//                 </Select.Option>
//               ))}
//             </Select>
//           </Form.Item>
          
//           <Form.Item label="Operator">
//             <Select
//               value={filter.operator}
//               onChange={value => updateFilter(index, 'operator', value)}
//             >
//               {operators[columns.find(c => c.key === filter.field)?.type || 'string']
//                 .map(op => (
//                   <Select.Option key={op} value={op}>
//                     {op}
//                   </Select.Option>
//                 ))}
//             </Select>
//           </Form.Item>
          
//           <Form.Item label="Value">
//             <Input
//               value={filter.value}
//               onChange={e => updateFilter(index, 'value', e.target.value)}
//             />
//           </Form.Item>
          
//           <MinusCircleOutlined onClick={() => removeFilter(index)} />
//         </Space>
//       ))}
      
//       <Form.Item>
//         <Button type="dashed" onClick={addFilter} icon={<PlusOutlined />}>
//           Add Filter
//         </Button>
//       </Form.Item>
      
//       <Form.Item>
//         <Button type="primary" onClick={handleApply}>
//           Apply Filters
//         </Button>
//       </Form.Item>
//     </Form>
//   );
// };

// features/grid/components/AdvancedFilters.js
/**
 * Advanced filtering component for data grids
 */
import React, { useState } from 'react';
import { Form, Input, Select, Button, Space } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

// Define operators for different data types
const operators = {
  string: ['equals', 'contains', 'startsWith', 'endsWith'],
  number: ['equals', 'greaterThan', 'lessThan', 'between'],
  date: ['equals', 'before', 'after', 'between'],
};

export const AdvancedFilters = ({ columns = [], onApply = () => {} }) => {
  // State to hold current filters
  const [filters, setFilters] = useState([]);

  // Function to add a new filter
  const addFilter = () => {
    setFilters([...filters, { field: '', operator: '', value: '' }]);
  };

  // Function to remove a filter
  const removeFilter = (index) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  // Function to update a filter
  const updateFilter = (index, key, value) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], [key]: value };
    setFilters(newFilters);
  };

  // Handle applying filters
  const handleApply = () => {
    try {
      onApply(filters);
    } catch (error) {
      console.error('Error applying filters:', error);
    }
  };

  return (
    <Form layout="vertical">
      {filters.map((filter, index) => (
        <Space key={index} align="baseline">
          <Form.Item label="Field">
            <Select
              value={filter.field}
              onChange={value => updateFilter(index, 'field', value)}
            >
              {columns.map(col => (
                <Select.Option key={col.key} value={col.key}>
                  {col.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item label="Operator">
            <Select
              value={filter.operator}
              onChange={value => updateFilter(index, 'operator', value)}
            >
              {operators[columns.find(c => c.key === filter.field)?.type || 'string']
                .map(op => (
                  <Select.Option key={op} value={op}>
                    {op}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
          
          <Form.Item label="Value">
            <Input
              value={filter.value}
              onChange={e => updateFilter(index, 'value', e.target.value)}
            />
          </Form.Item>
          
          <MinusCircleOutlined onClick={() => removeFilter(index)} />
        </Space>
      ))}
      
      <Form.Item>
        <Button type="dashed" onClick={addFilter} icon={<PlusOutlined />}>
          Add Filter
        </Button>
      </Form.Item>
      
      <Form.Item>
        <Button type="primary" onClick={handleApply}>
          Apply Filters
        </Button>
      </Form.Item>
    </Form>
  );
};

// # features/grid/hooks/useGridExport.js
/**
 * Hook for handling grid data export
 */
import { useCallback } from 'react';
import * as XLSX from 'xlsx';

export const useGridExport = () => {
  const exportToExcel = useCallback((data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  }, []);

  const exportToCsv = useCallback((data, filename) => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).join(',')
    ).join('\n');
    
    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
  }, []);

  return {
    exportToExcel,
    exportToCsv
  };
};

// // # features/grid/components/CustomViews.js
// /**
//  * Component for managing custom grid views
//  */
// import React, { useState, useEffect } from 'react';
// import { Select, Button, Modal, Form, Input } from 'antd';
// import { useViewConfigStore } from '../../../state/stores/viewConfigStore';

// export const CustomViews = ({ tableId, onViewChange }) => {
//   const [views, setViews] = useState([]);
//   const [currentView, setCurrentView] = useState(null);
//   const [isModalVisible, setIsModalVisible] = useState(false);
  
//   const { getConfig, setConfig } = useViewConfigStore();
  
//   useEffect(() => {
//     // Load saved views
//     const savedViews = getConfig(tableId)?.views || [];
//     setViews(savedViews);
//   }, [tableId, getConfig]);

//   const handleSaveView = (values) => {
//     const newView = {
//       id: Date.now().toString(),
//       name: values.name,
//       config: currentView
//     };
    
//     const updatedViews = [...views, newView];
//     setViews(updatedViews);
//     setConfig(tableId, { views: updatedViews });
//     setIsModalVisible(false);
//   };

//   return (
//     <>
//       <Select
//         style={{ width: 200 }}
//         value={currentView?.id}
//         onChange={(viewId) => {
//           const view = views.find(v => v.id === viewId);
//           setCurrentView(view);
//           onViewChange(view.config);
//         }}
//       >
//         {views.map(view => (
//           <Select.Option key={view.id} value={view.id}>
//             {view.name}
//           </Select.Option>
//         ))}
//       </Select>

//       <Button onClick={() => setIsModalVisible(true)}>
//         Save Current View
//       </Button>

//       <Modal
//         title="Save View"
//         visible={isModalVisible}
//         onCancel={() => setIsModalVisible(false)}
//         footer={null}
//       >
//         <Form onFinish={handleSaveView}>
//           <Form.Item
//             name="name"
//             rules={[{ required: true, message: 'Please input view name!' }]}
//           >
//             <Input placeholder="View Name" />
//           </Form.Item>
//           <Form.Item>
//             <Button type="primary" htmlType="submit">
//               Save
//             </Button>
//           </Form.Item>
//         </Form>
//       </Modal>
//     </>
//   );
// };

// features/grid/components/CustomViews.js
/**
 * Component for managing custom grid views
 */
import React, { useState, useEffect } from 'react';
import { Select, Button, Modal, Form, Input } from 'antd';
import { useViewConfigStore } from '../../../state/stores/viewConfigStore';

export const CustomViews = ({ tableId, onViewChange }) => {
  if (!tableId || typeof tableId !== 'string') {
    throw new Error('CustomViews requires a valid tableId as a string.');
  }

  // State for managing views, current view, and modal visibility
  const [views, setViews] = useState([]);
  const [currentView, setCurrentView] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // Hooks from Zustand store for view configurations
  const { getConfig, setConfig } = useViewConfigStore();
  
  // Load saved views when component mounts or tableId changes
  useEffect(() => {
    const savedViews = getConfig(tableId)?.views || [];
    setViews(savedViews);
  }, [tableId, getConfig]);

  // Save new view configuration
  const handleSaveView = (values) => {
    const newView = {
      id: Date.now().toString(),
      name: values.name,
      config: currentView
    };
    
    const updatedViews = [...views, newView];
    setViews(updatedViews);
    
    try {
      setConfig(tableId, { views: updatedViews });
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error saving view:', error);
    }
  };

  return (
    <>
      <Select
        style={{ width: 200 }}
        value={currentView?.id}
        onChange={(viewId) => {
          const view = views.find(v => v.id === viewId);
          setCurrentView(view);
          onViewChange(view.config);
        }}
      >
        {views.map(view => (
          <Select.Option key={view.id} value={view.id}>
            {view.name}
          </Select.Option>
        ))}
      </Select>

      <Button onClick={() => setIsModalVisible(true)}>
        Save Current View
      </Button>

      <Modal
        title="Save View"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleSaveView}>
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Please input view name!' }]}
          >
            <Input placeholder="View Name" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
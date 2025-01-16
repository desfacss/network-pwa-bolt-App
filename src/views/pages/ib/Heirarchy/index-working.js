// ib_category_heirarchy.js
import React, { useState, useEffect } from 'react';
import { supabase } from 'configs/SupabaseConfig';
import { Tree, Input, Button, Checkbox, Select, Form, message } from 'antd';
import { DndProvider, useDrop, useDrag } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const { Option } = Select;

// Function to convert tree structure to flat array for treeData
function treeToData(tree) {
  return tree.map(node => ({
    key: node.id,
    title: node.category_name,
    children: node.children ? treeToData(node.children) : undefined
  }));
}

// Define renderTreeNodes outside of any component
function renderTreeNodes(data, editingCategory, setEditingCategory, handleSave, categories) {
  return data.map(item => ({
    key: item.id,
    title: renderNodeTitle(item, editingCategory, setEditingCategory, handleSave, categories),
    children: item.children ? renderTreeNodes(item.children, editingCategory, setEditingCategory, handleSave, categories) : undefined
  }));
}

const NodeTitle = ({ item, editingCategory, setEditingCategory, handleSave, categories }) => {
  const handleEdit = () => setEditingCategory({...item});

  const handleChange = (event, field) => {
    setEditingCategory(prev => ({...prev, [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value}));
  };

  const handleParentChange = (value) => {
    setEditingCategory(prev => ({...prev, parent_category_id: value === 'null' ? null : value}));
  };

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'category',
    item: { id: item.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [item]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'category',
    drop: (draggedItem) => {
      if (draggedItem.id !== item.id) {
        console.log('Dropped', draggedItem.id, 'on', item.id);
        // Implement logic to update parent_id in the database here
        // For example:
        // updateCategory({ id: draggedItem.id, parent_category_id: item.id });
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }), [item]);

  if (editingCategory && editingCategory.id === item.id) {
    return (
      <Form>
        <Form.Item label="Name">
          <Input value={editingCategory.category_name} onChange={(e) => handleChange(e, 'category_name')} />
        </Form.Item>
        <Form.Item label="Main Category">
          <Checkbox checked={editingCategory.is_main_category} onChange={(e) => handleChange(e, 'is_main_category')} />
        </Form.Item>
        <Form.Item label="Parent">
          <Select onChange={handleParentChange} value={editingCategory.parent_category_id || 'null'}>
            <Option value="null">No Parent</Option>
            {categories.map(c => <Option key={c.id} value={c.id}>{c.category_name}</Option>)}
          </Select>
        </Form.Item>
        <Form.Item label="Description">
          <Input.TextArea value={editingCategory.description} onChange={(e) => handleChange(e, 'description')} />
        </Form.Item>
        <Button onClick={handleSave}>Save</Button>
      </Form>
    );
  } else {
    return (
      <div ref={node => drag(drop(node))}>
        {item.category_name} 
        <Button onClick={handleEdit}>Edit</Button>
      </div>
    );
  }
};

const renderNodeTitle = (item, editingCategory, setEditingCategory, handleSave, categories) => (
  <NodeTitle 
    item={item} 
    editingCategory={editingCategory}
    setEditingCategory={setEditingCategory}
    handleSave={handleSave}
    categories={categories}
  />
);

const IB_Category_Hierarchy = () => {
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('ib_categories').select('*').order('created_at');
    if (error) console.error('Error fetching categories:', error);
    else setCategories(buildTree(data));
  };

  const buildTree = (data, parentId = null) => {
    return data
      .filter(category => category.parent_category_id === parentId)
      .map(category => ({
        ...category,
        children: buildTree(data, category.id)
      }));
  };

  const updateCategory = async (category) => {
    const { error } = await supabase.from('ib_categories').update(category).eq('id', category.id);
    if (error) {
      message.error('Failed to update category: ' + error.message);
    } else {
      message.success('Category updated successfully');
      fetchCategories(); // Refresh categories after update
    }
  };

  const handleSave = async () => {
    if (editingCategory) {
      await updateCategory(editingCategory);
      setEditingCategory(null);
    }
  };

  // Convert tree structure to treeData for Antd Tree component
  const treeData = renderTreeNodes(categories, editingCategory, setEditingCategory, handleSave, categories);

  return (
    <DndProvider backend={HTML5Backend}>
      <Tree 
        treeData={treeData}
        showLine
      />
    </DndProvider>
  );
};

export default IB_Category_Hierarchy;
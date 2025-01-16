// ib_category_heirarchy.js
import React, { useState, useEffect } from 'react';
import { supabase } from 'configs/SupabaseConfig';
import { Tree, Input, Button, Checkbox, Select, Form, message } from 'antd';
import { DndProvider, useDrop, useDrag } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const { TreeNode } = Tree;

// Function to convert tree structure to flat array for treeData
function treeToData(tree) {
  return tree.map(node => ({
    key: node.id,
    title: node.category_name,
    children: node.children ? treeToData(node.children) : undefined
  }));
}

// Define renderTreeNodes outside of any component
function renderTreeNodes(data, editingCategory, setEditingCategory, handleSave, setCategories) {
  return data?.map(item => ({
    key: item.id,
    title: renderNodeTitle(item, editingCategory, setEditingCategory, handleSave, data, setCategories),
    children: item.children ? renderTreeNodes(item.children, editingCategory, setEditingCategory, handleSave, setCategories) : undefined
  }));
}

const NodeTitle = ({ item, editingCategory, setEditingCategory, handleSave, categories, setCategories }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setEditingCategory({...item});
    setIsEditing(true);
  };

  const handleChange = (event, field) => {
    setEditingCategory(prev => ({...prev, [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value}));
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
        const newCategories = updateParentCategory(categories, draggedItem.id, item.id);
        setCategories(newCategories);
        updateCategoryInDB({ id: draggedItem.id, parent_category_id: item.id });
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }), [item, categories]);

  if (isEditing && editingCategory && editingCategory.id === item.id) {
    return (
      <Form>
        <Form.Item label="Name">
          <Input value={editingCategory.category_name} onChange={(e) => handleChange(e, 'category_name')} />
        </Form.Item>
        <Form.Item label="Main Category">
          <Checkbox checked={editingCategory.is_main_category} onChange={(e) => handleChange(e, 'is_main_category')} />
        </Form.Item>
        <Form.Item label="Description">
          <Input.TextArea value={editingCategory.description} onChange={(e) => handleChange(e, 'description')} />
        </Form.Item>
        <Button onClick={handleSave}>Save</Button>
        <Button onClick={() => { setIsEditing(false); setEditingCategory(null); }}>Cancel</Button>
      </Form>
    );
  } else {
    return (
      <div ref={node => drag(drop(node))} style={{ opacity: isDragging ? 0.5 : 1 }}>
        {item.category_name} 
        <Button onClick={handleEdit}>Edit</Button>
      </div>
    );
  }
};

const renderNodeTitle = (item, editingCategory, setEditingCategory, handleSave, categories, setCategories) => (
  <NodeTitle 
    item={item} 
    editingCategory={editingCategory}
    setEditingCategory={setEditingCategory}
    handleSave={handleSave}
    categories={categories}
    setCategories={setCategories}
  />
);

const updateParentCategory = (categories, childId, newParentId) => {
  return categories.map(category => {
    if (category.id === childId) {
      return { ...category, parent_category_id: newParentId };
    }
    if (category.children) {
      return { ...category, children: updateParentCategory(category.children, childId, newParentId) };
    }
    return category;
  });
};

const updateCategoryInDB = async (category) => {
  try {
    const { error } = await supabase.from('ib_categories').update({ parent_category_id: category.parent_category_id }).eq('id', category.id);
    if (error) {
      message.error('Failed to update category parent: ' + error.message);
    } else {
      message.success('Category parent updated successfully');
    }
  } catch (error) {
    message.error('An error occurred while updating: ' + error.message);
  }
};

const IB_Category_Hierarchy = () => {
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('ib_categories').select('*').order('created_at');
      if (error) {
        console.error('Error fetching categories:', error);
        message.error('Failed to fetch categories: ' + error.message);
      } else {
        setCategories(buildTree(data));
      }
    } catch (error) {
      console.error('Error in fetchCategories:', error);
      message.error('An error occurred while fetching categories.');
    }
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
    try {
      const { error } = await supabase.from('ib_categories').update({
        category_name: category.category_name,
        is_main_category: category.is_main_category,
        description: category.description
      }).eq('id', category.id);
      if (error) {
        message.error('Failed to update category: ' + error.message);
      } else {
        message.success('Category updated successfully');
        fetchCategories(); // Refresh categories after update
      }
    } catch (error) {
      message.error('An error occurred while updating: ' + error.message);
    }
  };

  const handleSave = async () => {
    if (editingCategory) {
      await updateCategory(editingCategory);
      setEditingCategory(null);
    }
  };

  // Convert tree structure to treeData for Antd Tree component
  const treeData = renderTreeNodes(categories, editingCategory, setEditingCategory, handleSave, setCategories);

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

// ib_category_heirarchy.js
import React, { useState, useEffect } from 'react';
import { supabase } from 'configs/SupabaseConfig';
import { Tree, Input, Button, Checkbox, Select, Form, message, Popconfirm } from 'antd';
import { DndProvider, useDrop, useDrag } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

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
function renderTreeNodes(data, editingCategory, setEditingCategory, handleSave, setCategories, handleDelete, fetchCategories) {
  return data?.map(item => ({
    key: item.id,
    title: renderNodeTitle(item, editingCategory, setEditingCategory, handleSave, data, setCategories, handleDelete, fetchCategories),
    children: item.children ? renderTreeNodes(item.children, editingCategory, setEditingCategory, handleSave, setCategories, handleDelete, fetchCategories) : undefined
  }));
}

const NodeTitle = ({ item, editingCategory, setEditingCategory, handleSave, categories, setCategories, handleDelete, fetchCategories }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setEditingCategory({ ...item });
    setIsEditing(true);
  };

  const handleChange = (event, field) => {
    setEditingCategory(prev => ({ ...prev, [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));
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
        updateCategoryInDB({ id: draggedItem.id, parent_category_id: item.id }, fetchCategories);
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
        {item?.category_name}
        <Button onClick={handleEdit} size="small" type="dashed" shape='circle'><EditOutlined /></Button>
        <Popconfirm
          title={`Are you sure to delete "${item?.category_name}" category?`}
          onConfirm={() => { handleDelete(item?.id) }}
          onCancel={() => { }}
        >
          <Button danger size="small" type="dashed" shape='circle'><DeleteOutlined /></Button>
        </Popconfirm>
      </div>
    );
  }
};

const renderNodeTitle = (item, editingCategory, setEditingCategory, handleSave, categories, setCategories, handleDelete, fetchCategories) => (
  <NodeTitle
    item={item}
    editingCategory={editingCategory}
    setEditingCategory={setEditingCategory}
    handleSave={handleSave}
    categories={categories}
    setCategories={setCategories}
    handleDelete={handleDelete}
    fetchCategories={fetchCategories}
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

const updateCategoryInDB = async (category, fetchCategories) => {
  try {
    const { error } = await supabase.from('ib_categories').update({ parent_category_id: category.parent_category_id }).eq('id', category.id);
    if (error) {
      message.error('Failed to update category parent: ' + error.message);
    } else {
      fetchCategories()
      message.success('Category parent updated successfully');
    }
  } catch (error) {
    message.error('An error occurred while updating: ' + error.message);
  }
};

const IB_Category_Hierarchy = () => {
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryParent, setNewCategoryParent] = useState(null); // Store parent ID for new category


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
        console.log("categories", data);
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

  const handleAddCategory = async () => {
    if (newCategoryName.trim() === '') {
      message.error('Category name cannot be empty.');
      return;
    }

    try {
      const { error } = await supabase.from('ib_categories').insert([
        {
          category_name: newCategoryName,
          parent_category_id: newCategoryParent, // Use selected parent ID
          description: '',  // Or provide a default description
          is_main_category: false, // Or handle this field appropriately
          // id: uuidv4() // Generate unique ID
        }
      ]);

      if (error) {
        message.error('Failed to add category: ' + error.message);
      } else {
        message.success('Category added successfully');
        setNewCategoryName(''); // Clear input field
        setNewCategoryParent(null); // Reset parent selection
        fetchCategories(); // Refresh categories
      }
    } catch (error) {
      message.error('An error occurred while adding: ' + error.message);
    }
  };

  // const handleDelete = async (categoryId) => {
  //   try {
  //     const { error } = await supabase.from('ib_categories').delete().eq('id', categoryId);
  //     if (error) {
  //       message.error('Failed to delete category: ' + error.message);
  //     } else {
  //       message.success('Category deleted successfully');
  //       fetchCategories(); // Refresh categories
  //     }
  //   } catch (error) {
  //     message.error('An error occurred while deleting: ' + error.message);
  //   }
  // };
  const handleDelete = async (categoryId) => {
    try {
      // 1. Delete subcategories first
      const { error: subcategoryError } = await supabase
        .from('ib_categories')
        .delete()
        .eq('parent_category_id', categoryId);

      if (subcategoryError) {
        message.error('Failed to delete subcategories: ' + subcategoryError.message);
        return; // Stop if subcategory deletion fails
      }

      // 2. Then delete the main category
      const { error: mainCategoryError } = await supabase
        .from('ib_categories')
        .delete()
        .eq('id', categoryId);

      if (mainCategoryError) {
        message.error('Failed to delete category: ' + mainCategoryError.message);
        return; // Stop if main category deletion fails
      }

      message.success('Category and subcategories deleted successfully');
      fetchCategories(); // Refresh categories

    } catch (error) {
      message.error('An error occurred while deleting: ' + error.message);
    }
  };

  // Convert tree structure to treeData for Antd Tree component
  const treeData = renderTreeNodes(categories, editingCategory, setEditingCategory, handleSave, setCategories, handleDelete, fetchCategories);
  const parentCategoryOptions = categories.map(cat => (
    <Select.Option key={cat.id} value={cat.id}>  {/* Key prop is important */}
      {cat.category_name}
    </Select.Option>
  ));
  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h2>Add New Category</h2>
        <Input
          placeholder="Category Name"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <Select
          placeholder="Select Parent Category"
          value={newCategoryParent}
          onChange={setNewCategoryParent}
          style={{ width: '100%', marginTop: '10px' }}
        >
          <Select.Option key="null" value={null}>No Parent</Select.Option> {/* Key for null option */}
          {parentCategoryOptions} {/* Render the array of Select.Option components */}
        </Select>
        <Button type="primary" onClick={handleAddCategory} style={{ marginTop: '10px' }}>Add Category</Button> {/* Added margin top */}
      </div>
      <Tree
        treeData={treeData}
        showLine //draggable
      />
    </DndProvider>
  );
};

export default IB_Category_Hierarchy;

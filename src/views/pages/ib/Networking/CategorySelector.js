import React, { useState, useEffect } from "react";
import { Modal, Select, Input, Button, message } from "antd";
import { supabase } from "api/supabaseClient";
import { useSelector } from "react-redux";

const { Option } = Select;

const buildTree = (data, parentId = null) => {
    return data
        .filter(category => category.parent_category_id === parentId)
        .map(category => ({
            ...category,
            children: buildTree(data, category.id),
        }));
};

const CategorySelector = ({ visible, onClose, chatId }) => {
    const [categories, setCategories] = useState([]);
    const [treeData, setTreeData] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const { session } = useSelector((state) => state.auth);

    useEffect(() => {
        const fetchCategories = async () => {
            const { data, error } = await supabase
                .from("ib_categories")
                .select("*")
                .order("category_name", { ascending: true });

            if (error) {
                message.error("Failed to load categories");
            } else {
                setCategories(data);
                setTreeData(buildTree(data)); // Transform categories into a tree
            }
        };

        fetchCategories();
    }, []);

    // Fetch existing chat data if chatId is provided
    useEffect(() => {
        if (!chatId) return;

        const fetchChatData = async () => {
            const { data, error } = await supabase
                .from("ib_posts")
                .select("*")
                .eq("id", chatId)
                .single();

            if (error) {
                message.error("Failed to load chat details");
            } else {
                setTitle(data?.title);
                setDescription(data?.details?.description || "");
                setSelectedCategories([data?.details?.category_id, ...(data?.details?.tags || [])].filter(Boolean));
            }
        };

        fetchChatData();
    }, [chatId]);

    const handleSelectChange = (value, level) => {
        const newSelected = [...selectedCategories];
        newSelected[level] = value;
        setSelectedCategories(newSelected.slice(0, level + 1)); // Remove extra selections
    };

    const getChildren = (parentId) => {
        return categories.filter(cat => cat.parent_category_id === parentId);
    };

    const handleSubmit = async () => {
        if (!title?.trim()) {
            return message.error("Name is required");
        }
        if (selectedCategories.length === 0) {
            return message.error("Please select at least one category");
        }

        const categoryId = selectedCategories[0];
        const tags = selectedCategories.slice(1);
        const userId = session?.user?.id;

        if (chatId) {
            // Update existing chat
            const { data, error } = await supabase
                .from("ib_posts")
                .update({
                    title,
                    details: { description, category_id: categoryId, tags },
                })
                .eq("id", chatId);

            if (error) {
                message.error("Failed to update chat");
            } else {
                message.success("Chat updated successfully");
                onClose(); // Close modal
            }
        } else {
            // Insert new chat
            const { data, error } = await supabase
                .from("ib_posts")
                .insert([
                    {
                        title,
                        details: { description, category_id: categoryId, tags },
                        created_by: userId,
                    },
                ]);

            if (error) {
                message.error("Failed to submit");
            } else {
                message.success("Submitted successfully");
                setSelectedCategories([]);
                setTitle("");
                setDescription("");
                onClose(); // Close modal
            }
        }
    };

    return (
        <Modal
            title={chatId ? "Edit Post" : "Create Post"}
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={handleSubmit}>
                    {chatId ? "Update" : "Submit"}
                </Button>,
            ]}
        >


            {/* <h3>Select Categories</h3> */}

            <Select
                style={{ width: "100%", marginBottom: 10 }}
                onChange={(value) => handleSelectChange(value, 0)}
                placeholder="Select category"
                value={selectedCategories[0] || undefined}
            >
                {treeData?.map((opt) => (
                    <Option key={opt.id} value={opt.id}>
                        {opt.category_name}
                    </Option>
                ))}
            </Select>

            {/* Render cascading selects for child categories */}
            {selectedCategories?.map((selected, index) => {
                const options = getChildren(selected);
                if (options.length > 0) {
                    return (
                        <Select
                            key={index + 1}
                            style={{ width: "100%", marginBottom: 10 }}
                            value={selectedCategories[index + 1] || undefined}
                            onChange={(value) => handleSelectChange(value, index + 1)}
                            placeholder="Select sub-category"
                        >
                            {options?.map((opt) => (
                                <Option key={opt.id} value={opt.id}>
                                    {opt.category_name}
                                </Option>
                            ))}
                        </Select>
                    );
                }
                return null;
            })}

            <Input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ marginBottom: 10 }}
            />
            <Input.TextArea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                style={{ marginBottom: 10 }}
            />

        </Modal>
    );
};

export default CategorySelector;

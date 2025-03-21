import React, { useState, useEffect } from "react";
import { Modal, Select, Input, Button, message, Drawer, Form, Mentions } from "antd";
import { supabase } from "configs/SupabaseConfig";

const { Option } = Select;

const buildTree = (data, parentId = null) => {
    return data
        .filter(category => category.parent_category_id === parentId)
        .map(category => ({
            ...category,
            children: buildTree(data, category.id),
        }));
};

export const CategorySelector = ({ visible, onClose, chatId, channel_id, form, onSubmit, isSubmitting, session }) => {
    const [categories, setCategories] = useState([]);
    const [treeData, setTreeData] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [description, setDescription] = useState("");
    const [idToNameMap, setIdToNameMap] = useState(new Map());

    const fetchCategories = async () => {
        const { data, error } = await supabase
            .from("ib_categories")
            .select("*")
            .order("category_name", { ascending: true });

        if (error) {
            message.error("Failed to load categories");
        } else {
            setCategories(data);
            const tree = buildTree(data);
            setTreeData(tree);

            const map = new Map();
            const buildMap = (categories) => {
                categories.forEach(cat => {
                    map.set(cat.id, cat.category_name);
                    if (cat.children) buildMap(cat.children);
                });
            };
            buildMap(tree);
            setIdToNameMap(map);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (!chatId) {
            form.resetFields();
            setSelectedCategories([]);
            setDescription("");
            return;
        }

        const fetchChatData = async () => {
            const { data, error } = await supabase
                .from("channel_posts")
                .select("*")
                .eq("id", chatId)
                .single();

            if (error) {
                message.error("Failed to load post details");
            } else {
                form.setFieldsValue({ message: data.message });
                setDescription(data.details?.description || "");
                const tagsToEdit = [
                    ...(data.details?.category_id ? [data.details.category_id] : []),
                    ...(data.details?.tags || [])
                ];
                setSelectedCategories(tagsToEdit);
            }
        };

        fetchChatData();
    }, [chatId, form]);

    const handleSelectChange = (value, level) => {
        const newSelected = [...selectedCategories];
        newSelected[level] = value;
        // Keep only selections up to the current level + 1
        setSelectedCategories(newSelected.slice(0, level + 1));
    };

    const getChildren = (parentId) => {
        return categories.filter(cat => cat.parent_category_id === parentId);
    };

    const handleSubmit = async () => {
        if (!session?.user?.id) return;

        try {
            await form.validateFields();
            if (selectedCategories.length < 2) {
                message.error("Please select at least 2 categories/tags");
                return;
            }

            const categoryId = selectedCategories[0];
            const tags = selectedCategories.slice(1);
            const values = form.getFieldsValue();

            const newMessage = {
                message: values.message,
                user_id: session.user.id,
                channel_id: channel_id,
                details: {
                    description,
                    category_id: categoryId,
                    tags,
                },
            };

            if (chatId) {
                const { data, error } = await supabase
                    .from('channel_posts')
                    .update({
                        message: newMessage.message,
                        details: newMessage.details,
                    })
                    .eq('id', chatId)
                    .select('*');

                if (error) throw error;
                onSubmit(data[0], true);
                message.success("Message updated successfully");
            } else {
                const { data, error } = await supabase
                    .from('channel_posts')
                    .insert([newMessage])
                    .select('*, user:users!channel_posts_user_id_fkey(user_name), channel:channels(slug), reply_count:channel_post_messages(count)')
                    .single();

                if (error) throw error;
                onSubmit({ ...data, reply_count: data.reply_count[0]?.count || 0 }, false);
                message.success("Message posted successfully");
            }

            onClose();
        } catch (err) {
            console.error("Error:", err);
            message.error("Failed to save message");
        }
    };

    return (
        <Drawer
            title={chatId ? "Edit Post" : "Create Post"}
            open={visible}
            onClose={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    onClick={handleSubmit}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                >
                    {chatId ? "Update" : "Submit"}
                </Button>,
            ]}
            width={"90%"}
        >
            <Form form={form} layout="vertical">


                {/* Dynamic Category Selection */}
                {Array.from({ length: Math.max(2, selectedCategories.length) }).map((_, index) => {
                    const options = index === 0 ? treeData : getChildren(selectedCategories[index - 1]);
                    // Only show the Select if there are options or if it's the first two (minimum required)
                    if (options.length > 0 || index < 2) {
                        return (
                            <Select
                                key={index}
                                style={{ width: "100%", marginBottom: 10 }}
                                onChange={(value) => handleSelectChange(value, index)}
                                placeholder={`Select ${index === 0 ? 'main category' : 'sub-category'}`}
                                value={selectedCategories[index] || undefined}
                                showSearch
                                optionFilterProp="children"
                                disabled={index > 0 && !selectedCategories[index - 1]}
                            >
                                {options.map(opt => (
                                    <Option key={opt.id} value={opt.id}>
                                        {opt.category_name}
                                    </Option>
                                ))}
                            </Select>
                        );
                    }
                    return null;
                })}
                <Form.Item
                    name="message"
                    rules={[{ required: true, message: 'Please write your message' }]}
                >
                    <Mentions
                        rows={2}
                        prefix={['@']}
                        placeholder="Write your message"
                        style={{
                            border: 'none',
                            padding: 0,
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#333333 #ccceee',
                        }}
                    />
                </Form.Item>
                {/* <Input.TextArea
                    placeholder="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    style={{ marginBottom: 10 }}
                /> */}
            </Form>
        </Drawer>
    );
};

export default CategorySelector;
// import React, { useState, useEffect } from "react";
// import { Drawer, Select, Input, Button, message, Form, Mentions, Tag } from "antd";
// import { supabase } from "configs/SupabaseConfig";

// const { Option } = Select;

// const buildTree = (data, parentId = null) => {
//     return data
//         .filter(category => category.parent_category_id === parentId)
//         .map(category => ({
//             ...category,
//             children: buildTree(data, category.id),
//         }));
// };

// export const CategorySelector = ({ visible, onClose, chatId, channel_id, form, onSubmit, isSubmitting, session }) => {
//     const [categories, setCategories] = useState([]);
//     const [treeData, setTreeData] = useState([]);
//     const [selectedCategories, setSelectedCategories] = useState([]); // Array of UUIDs (pre-existing)
//     const [pendingTags, setPendingTags] = useState([]); // Array of { level, name, parentId }
//     const [description, setDescription] = useState("");
//     const [idToNameMap, setIdToNameMap] = useState(new Map());

//     const fetchCategories = async () => {
//         const { data, error } = await supabase
//             .from("ib_categories")
//             .select("*")
//             .order("category_name", { ascending: true });

//         if (error) {
//             message.error("Failed to load categories");
//         } else {
//             setCategories(data);
//             const tree = buildTree(data);
//             setTreeData(tree);

//             const map = new Map();
//             const buildMap = (categories) => {
//                 categories.forEach(cat => {
//                     map.set(cat.id, cat.category_name);
//                     if (cat.children) buildMap(cat.children);
//                 });
//             };
//             buildMap(tree);
//             setIdToNameMap(map);
//         }
//     };

//     useEffect(() => {
//         fetchCategories();
//     }, []);

//     useEffect(() => {
//         if (!chatId) {
//             form.resetFields();
//             setSelectedCategories([]);
//             setPendingTags([]);
//             setDescription("");
//             return;
//         }

//         const fetchChatData = async () => {
//             const { data, error } = await supabase
//                 .from("channel_posts")
//                 .select("*")
//                 .eq("id", chatId)
//                 .single();

//             if (error) {
//                 message.error("Failed to load post details");
//             } else {
//                 form.setFieldsValue({ message: data.message });
//                 setDescription(data.details?.description || "");
//                 const tagsToEdit = [
//                     ...(data.details?.category_id ? [data.details.category_id] : []),
//                     ...(data.details?.tags || []),
//                 ];
//                 setSelectedCategories(tagsToEdit);
//                 setPendingTags([]); // No pending tags for existing posts
//             }
//         };

//         fetchChatData();
//     }, [chatId, form, idToNameMap]);

//     const getChildren = (parentId) => {
//         return categories.filter(cat => cat.parent_category_id === parentId);
//     };

//     const handleSelectChange = (value, level) => {
//         const newSelected = [...selectedCategories.slice(0, level)];
//         newSelected[level] = value;
//         setSelectedCategories(newSelected);
//         setPendingTags(pendingTags.filter(tag => tag.level < level)); // Clear lower-level pending tags
//     };

//     const handleCustomTagChange = (value, level) => {
//         if (!value || pendingTags.some(tag => tag.name === value && tag.level === level)) return;

//         const parentId = level > 0 ? selectedCategories[level - 1] : null;
//         const newTag = { level, name: value, parentId };
//         setPendingTags([...pendingTags.filter(tag => tag.level < level), newTag]);
//         setSelectedCategories([...selectedCategories.slice(0, level)]);
//     };

//     const handleTagClose = (tagIdOrName) => {
//         if (idToNameMap.has(tagIdOrName)) {
//             setSelectedCategories(selectedCategories.filter(id => id !== tagIdOrName));
//         } else {
//             setPendingTags(pendingTags.filter(tag => tag.name !== tagIdOrName));
//         }
//     };

//     const handleSubmit = async () => {
//         if (!session?.user?.id) return;

//         try {
//             await form.validateFields();
//             if (selectedCategories.length < 1) {
//                 message.error("Please select at least one category");
//                 return;
//             }

//             // Save pending tags to ib_categories sequentially
//             const finalCategories = [...selectedCategories];
//             for (const tag of pendingTags.sort((a, b) => a.level - b.level)) { // Sort by level for parent-child order
//                 const parentId = tag.parentId || (tag.level > 0 ? finalCategories[tag.level - 1] : null);
//                 const { data, error } = await supabase
//                     .from("ib_categories")
//                     .insert([
//                         {
//                             category_name: tag.name,
//                             is_main_category: false, // Always false since level 0 is fixed
//                             parent_category_id: parentId,
//                             description: null, // Optional field
//                             is_approved: false,
//                             created_at: new Date().toISOString(), // Explicitly set for consistency
//                             updated_at: new Date().toISOString(),
//                         },
//                     ])
//                     .select("id")
//                     .single();

//                 if (error) throw new Error(`Failed to save tag ${tag.name}: ${error.message}`);
//                 finalCategories[tag.level] = data.id;
//                 setIdToNameMap(prev => new Map(prev).set(data.id, tag.name)); // Update map for display
//             }

//             const categoryId = finalCategories[0];
//             const tags = finalCategories.slice(1);
//             const values = form.getFieldsValue();

//             const newMessage = {
//                 message: values.message,
//                 user_id: session.user.id,
//                 channel_id: channel_id,
//                 details: {
//                     description,
//                     category_id: categoryId,
//                     tags: tags.length > 0 ? tags : undefined,
//                 },
//             };

//             if (chatId) {
//                 const { data, error } = await supabase
//                     .from("channel_posts")
//                     .update({
//                         message: newMessage.message,
//                         details: newMessage.details,
//                     })
//                     .eq("id", chatId)
//                     .select("*");

//                 if (error) throw error;
//                 onSubmit(data[0], true);
//                 message.success("Message updated successfully");
//             } else {
//                 const { data, error } = await supabase
//                     .from("channel_posts")
//                     .insert([newMessage])
//                     .select("*, user:users!channel_posts_user_id_fkey(user_name), channel:channels(slug), reply_count:channel_post_messages(count)")
//                     .single();

//                 if (error) throw error;
//                 onSubmit({ ...data, reply_count: data.reply_count[0]?.count || 0 }, false);
//                 message.success("Message posted successfully");
//             }

//             setPendingTags([]);
//             fetchCategories(); // Refresh categories for future use
//             onClose();
//         } catch (err) {
//             console.error("Error:", err);
//             message.error("Failed to save message");
//         }
//     };

//     const renderLevel = (level) => {
//         if (level === 0) {
//             return (
//                 <Select
//                     key={level}
//                     style={{ width: "100%", marginBottom: 8 }}
//                     onChange={(value) => handleSelectChange(value, level)}
//                     placeholder="Select main category"
//                     value={selectedCategories[level] || undefined}
//                     showSearch
//                     optionFilterProp="children"
//                     size="large"
//                 >
//                     {treeData.map(opt => (
//                         <Option key={opt.id} value={opt.id}>
//                             {opt.category_name}
//                         </Option>
//                     ))}
//                 </Select>
//             );
//         }

//         if (!selectedCategories[level - 1]) return null;

//         const options = getChildren(selectedCategories[level - 1]);
//         const hasOptions = options.length > 0;
//         const hasPendingTagAtThisLevel = pendingTags.some(tag => tag.level === level);

//         if (hasOptions && !hasPendingTagAtThisLevel) {
//             return (
//                 <Select
//                     key={level}
//                     style={{ width: "100%", marginBottom: 8 }}
//                     onChange={(value) => handleSelectChange(value, level)}
//                     placeholder={`Select level ${level + 1} category`}
//                     value={selectedCategories[level] || undefined}
//                     showSearch
//                     optionFilterProp="children"
//                     size="large"
//                 >
//                     {options.map(opt => (
//                         <Option key={opt.id} value={opt.id}>
//                             {opt.category_name}
//                         </Option>
//                     ))}
//                 </Select>
//             );
//         }

//         return (
//             <Input
//                 key={level}
//                 style={{ width: "100%", marginBottom: 8 }}
//                 placeholder={`Add a level ${level + 1} tag`}
//                 onChange={(e) => handleCustomTagChange(e.target.value, level)}
//                 size="large"
//                 allowClear
//                 value={pendingTags.find(tag => tag.level === level)?.name || ""}
//             />
//         );
//     };

//     return (
//         <Drawer
//             title={chatId ? "Edit Post" : "Create Post"}
//             open={visible}
//             onClose={onClose}
//             placement="bottom"
//             height="85%"
//             footer={[
//                 <Button key="cancel" onClick={onClose} style={{ width: "48%", marginRight: "4%" }} size="large">
//                     Cancel
//                 </Button>,
//                 <Button
//                     key="submit"
//                     type="primary"
//                     onClick={handleSubmit}
//                     loading={isSubmitting}
//                     disabled={isSubmitting}
//                     style={{ width: "48%" }}
//                     size="large"
//                 >
//                     {chatId ? "Update" : "Submit"}
//                 </Button>,
//             ]}
//             footerStyle={{ display: "flex", justifyContent: "space-between", padding: "10px" }}
//             bodyStyle={{ padding: "10px" }}
//         >
//             <Form
//                 form={form}
//                 layout="vertical"
//                 onKeyDown={(e) => {
//                     if (e.key === "Enter") e.preventDefault();
//                 }}
//             >
//                 {renderLevel(0)}
//                 {renderLevel(1)}
//                 {renderLevel(2)}

//                 <div style={{ marginBottom: 8, overflowX: "auto", whiteSpace: "nowrap" }}>
//                     {selectedCategories.map(id => (
//                         <Tag
//                             key={id}
//                             closable
//                             onClose={() => handleTagClose(id)}
//                             color="blue"
//                             style={{ margin: "2px" }}
//                         >
//                             {idToNameMap.get(id)}
//                         </Tag>
//                     ))}
//                     {pendingTags.map(tag => (
//                         <Tag
//                             key={tag.name}
//                             closable
//                             onClose={() => handleTagClose(tag.name)}
//                             color="gray"
//                             style={{ margin: "2px" }}
//                         >
//                             {tag.name}
//                         </Tag>
//                     ))}
//                 </div>

//                 <Form.Item
//                     name="message"
//                     rules={[{ required: true, message: "Please write your message" }]}
//                 >
//                     <Mentions
//                         rows={3}
//                         prefix={["@"]}
//                         placeholder="Write your message"
//                         style={{
//                             width: "100%",
//                             border: "none",
//                             padding: 0,
//                             scrollbarWidth: "thin",
//                             scrollbarColor: "#333333 #ccceee",
//                         }}
//                     />
//                 </Form.Item>
//             </Form>
//         </Drawer>
//     );
// };

// export default CategorySelector;




import React, { useState, useEffect } from "react";
import { Drawer, Select, Input, Button, message, Form, Mentions, Tag } from "antd";
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
    const [submitting, setSubmitting] = useState(false);
    const [treeData, setTreeData] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]); // Array of UUIDs (pre-existing)
    const [pendingTags, setPendingTags] = useState([]); // Array of { level, name, parentId }
    const [description, setDescription] = useState("");
    const [idToNameMap, setIdToNameMap] = useState(new Map());

    const fetchCategories = async () => {
        const { data, error } = await supabase
            .from("ib_categories")
            .select("*")
            .eq("is_approved", true) // Only fetch approved categories
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
            setPendingTags([]);
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
                    ...(data.details?.tags || []),
                ];
                setSelectedCategories(tagsToEdit);
                setPendingTags([]); // No pending tags for existing posts

                // Update idToNameMap with all tags (approved or not) from the post
                const { data: tagData, error: tagError } = await supabase
                    .from("ib_categories")
                    .select("id, category_name")
                    .in("id", tagsToEdit);
                if (!tagError) {
                    setIdToNameMap(prev => {
                        const newMap = new Map(prev);
                        tagData.forEach(tag => newMap.set(tag.id, tag.category_name));
                        return newMap;
                    });
                }
            }
        };

        fetchChatData();
    }, [chatId, form]);

    const getChildren = (parentId) => {
        return categories.filter(cat => cat.parent_category_id === parentId);
    };

    const handleSelectChange = (value, level) => {
        const newSelected = [...selectedCategories.slice(0, level)];
        newSelected[level] = value;
        setSelectedCategories(newSelected);
        setPendingTags(pendingTags.filter(tag => tag.level < level)); // Clear lower-level pending tags
    };

    const handleCustomTagChange = (value, level) => {
        if (!value || pendingTags.some(tag => tag.name === value && tag.level === level)) return;

        const parentId = level > 0 ? selectedCategories[level - 1] : null;
        const newTag = { level, name: value, parentId };
        setPendingTags([...pendingTags.filter(tag => tag.level < level), newTag]);
        setSelectedCategories([...selectedCategories.slice(0, level)]);
    };

    const handleTagClose = (tagIdOrName) => {
        if (idToNameMap.has(tagIdOrName)) {
            setSelectedCategories(selectedCategories.filter(id => id !== tagIdOrName));
        } else {
            setPendingTags(pendingTags.filter(tag => tag.name !== tagIdOrName));
        }
    };

    const handleSubmit = async () => {
        if (!session?.user?.id) return;
        setSubmitting(true)
        try {
            await form.validateFields();
            if (selectedCategories.length < 1) {
                message.error("Please select at least one category");
                return;
            }

            // Save pending tags to ib_categories sequentially
            const finalCategories = [...selectedCategories];
            for (const tag of pendingTags.sort((a, b) => a.level - b.level)) {
                const parentId = tag.parentId || (tag.level > 0 ? finalCategories[tag.level - 1] : null);
                const { data, error } = await supabase
                    .from("ib_categories")
                    .insert([
                        {
                            category_name: tag.name,
                            is_main_category: false,
                            parent_category_id: parentId,
                            description: null,
                            is_approved: false, // Custom tags start unapproved
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        },
                    ])
                    .select("id")
                    .single();

                if (error) throw new Error(`Failed to save tag ${tag.name}: ${error.message}`);
                finalCategories[tag.level] = data.id;
                setIdToNameMap(prev => new Map(prev).set(data.id, tag.name));
            }

            const categoryId = finalCategories[0];
            const tags = finalCategories.slice(1);
            const values = form.getFieldsValue();

            const newMessage = {
                message: values.message,
                user_id: session.user.id,
                channel_id: channel_id,
                details: {
                    description,
                    category_id: categoryId,
                    tags: tags.length > 0 ? tags : undefined,
                },
            };

            if (chatId) {
                const { data, error } = await supabase
                    .from("channel_posts")
                    .update({
                        message: newMessage.message,
                        details: newMessage.details,
                    })
                    .eq("id", chatId)
                    .select("*");

                if (error) throw error;
                onSubmit(data[0], true);
                message.success("Message updated successfully");
            } else {
                const { data, error } = await supabase
                    .from("channel_posts")
                    .insert([newMessage])
                    .select("*, user:users!channel_posts_user_id_fkey(user_name), channel:channels(slug), reply_count:channel_post_messages(count)")
                    .single();

                if (error) throw error;
                onSubmit({ ...data, reply_count: data.reply_count[0]?.count || 0 }, false);
                message.success("Message posted successfully");
            }

            setPendingTags([]);
            window.location.reload();
            // fetchCategories(); // Refresh approved categories
            // onClose();
        } catch (err) {
            console.error("Error:", err);
            message.error("Failed to save message");
        }
        setSubmitting(false)
    };

    const renderLevel = (level) => {
        if (level === 0) {
            return (
                <Select
                    key={level}
                    style={{ width: "100%", marginBottom: 8 }}
                    onChange={(value) => handleSelectChange(value, level)}
                    placeholder="Select main category"
                    value={selectedCategories[level] || undefined}
                    showSearch
                    optionFilterProp="children"
                    size="large"
                >
                    {treeData.map(opt => (
                        <Option key={opt.id} value={opt.id}>
                            {opt.category_name}
                        </Option>
                    ))}
                </Select>
            );
        }

        if (!selectedCategories[level - 1]) return null;

        const options = getChildren(selectedCategories[level - 1]);
        const hasOptions = options.length > 0;
        const hasPendingTagAtThisLevel = pendingTags.some(tag => tag.level === level);

        if (hasOptions && !hasPendingTagAtThisLevel) {
            return (
                <Select
                    key={level}
                    style={{ width: "100%", marginBottom: 8 }}
                    onChange={(value) => handleSelectChange(value, level)}
                    placeholder={`Select level ${level + 1} category`}
                    value={selectedCategories[level] || undefined}
                    showSearch
                    optionFilterProp="children"
                    size="large"
                >
                    {options.map(opt => (
                        <Option key={opt.id} value={opt.id}>
                            {opt.category_name}
                        </Option>
                    ))}
                </Select>
            );
        }

        return (
            <Input
                key={level}
                style={{ width: "100%", marginBottom: 8 }}
                placeholder={`Add a level ${level + 1} tag`}
                onChange={(e) => handleCustomTagChange(e.target.value, level)}
                size="large"
                allowClear
                value={pendingTags.find(tag => tag.level === level)?.name || ""}
            />
        );
    };

    return (
        <Drawer
            title={chatId ? "Edit Post" : "Create Post"}
            open={visible}
            onClose={onClose}
            placement="bottom"
            height="85%"
            footer={[
                <Button key="cancel" onClick={onClose} loading={submitting} style={{ width: "48%", marginRight: "4%" }} size="large">
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    onClick={handleSubmit}
                    loading={submitting || isSubmitting}
                    disabled={isSubmitting}
                    style={{ width: "48%" }}
                    size="large"
                >
                    {chatId ? "Update" : "Submit"}
                </Button>,
            ]}
        // footerStyle={{ display: "flex", justifyContent: "space-between", padding: "10px" }}
        // bodyStyle={{ padding: "10px" }}
        >
            <Form
                form={form}
                layout="vertical"
                onKeyDown={(e) => {
                    if (e.key === "Enter") e.preventDefault();
                }}
            >
                {renderLevel(0)}
                {renderLevel(1)}
                {renderLevel(2)}

                <div style={{ marginBottom: 8, overflowX: "auto", whiteSpace: "nowrap" }}>
                    {selectedCategories.map(id => (
                        <Tag
                            key={id}
                            closable
                            onClose={() => handleTagClose(id)}
                            // color="blue"
                            style={{ margin: "2px" }}
                        >
                            {idToNameMap.get(id)}
                        </Tag>
                    ))}
                    {pendingTags.map(tag => (
                        <Tag
                            key={tag.name}
                            closable
                            onClose={() => handleTagClose(tag.name)}
                            // color="gray"
                            style={{ margin: "2px" }}
                        >
                            {tag.name}
                        </Tag>
                    ))}
                </div>

                <Form.Item
                    name="message"
                    rules={[{ required: true, message: "Please write your message" }]}
                >
                    <Mentions
                        rows={3}
                        prefix={["@"]}
                        placeholder="Write your message"
                        style={{
                            width: "100%",
                            // border: "none",
                            padding: 0,
                            scrollbarWidth: "thin",
                            scrollbarColor: "#333333 #ccceee",
                        }}
                    />
                </Form.Item>
            </Form>
        </Drawer>
    );
};

export default CategorySelector;
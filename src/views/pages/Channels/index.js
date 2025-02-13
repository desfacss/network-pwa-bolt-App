import React, { useState, useEffect } from 'react';
import { Tabs, Input, Button, List, message, Card, Tag, Select, Checkbox, Form, Upload, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined, UploadOutlined, EyeOutlined } from '@ant-design/icons';
import { supabase } from 'api/supabaseClient';
import { useSelector } from 'react-redux';
import ForumComment from './Comments';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const Channels = () => {
    const [channels, setChannels] = useState([]);
    const [activeTab, setActiveTab] = useState(null);
    const [messages, setMessages] = useState({});
    const [newMessage, setNewMessage] = useState('');
    const [newChannelSlug, setNewChannelSlug] = useState('');

    const { session } = useSelector((state) => state.auth);
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [imageUrl, setImageUrl] = useState(''); // State for uploaded image URL
    const [fileList, setFileList] = useState([]); // State for uploaded file
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    const [parentCategories, setParentCategories] = useState([]);
    const [childCategories, setChildCategories] = useState({}); // Store child categories by parent ID
    const [selectedParentCategory, setSelectedParentCategory] = useState(null);

    useEffect(() => {
        fetchCategories();
        fetchChannels()
    }, []);

    const fetchChannels = async () => {
        const { data, error } = await supabase.from('channels').select('*');
        if (error) {
            console.error('Error fetching channels:', error);
            message.error("Failed to load channels.");
        } else {
            setChannels(data);
            if (data.length > 0) {
                setActiveTab(data[0].slug); // Set initial active tab
            }
        }
    };

    const fetchMessages = async (channelSlug) => {
        const channel = channels.find(c => c.slug === channelSlug);
        if (!channel) return;

        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('channel_id', channel.id)
            .order('inserted_at');

        if (error) {
            console.error('Error fetching messages:', error);
            message.error("Failed to load messages.");
        } else {
            setMessages({ ...messages, [channelSlug]: data });
        }
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
    };

    const handleAddChannel = async () => {
        if (!newChannelSlug) return;
        const { error } = await supabase.from('channels').insert([{ slug: newChannelSlug, created_by: session?.user?.id, organization_id: session?.user?.organization?.id }]); // Replace with user and org id
        if (error) {
            console.error("Error creating channel:", error);
            message.error("Failed to create channel.");
        } else {
            setNewChannelSlug('');
            fetchChannels();
        }
    };

    const handleDeleteChannel = async (channelId) => {
        const { error } = await supabase.from('channels').delete().eq('id', channelId);
        if (error) {
            console.error("Error deleting channel:", error);
            message.error("Failed to delete channel.");
        } else {
            fetchChannels();
            setActiveTab(channels.length > 1 ? channels[0].slug : null); // Set active tab to another channel or null if no channels left.
            setMessages({}); // Clear messages when channel is deleted.
        }

    }

    // const fetchCategories = async () => {
    //     const { data, error } = await supabase.from('ib_categories').select('*');
    //     if (error) {
    //         console.error('Error fetching categories:', error);
    //         message.error("Failed to load categories.");
    //     } else {
    //         setCategories(data);
    //     }
    // };

    const fetchCategories = async () => {
        const { data, error } = await supabase.from('ib_categories').select('*');
        if (error) {
            console.error('Error fetching categories:', error);
            message.error("Failed to load categories.");
        } else {
            // Separate parent and child categories
            const parents = data.filter(cat => cat.parent_category_id === null);
            const children = data.filter(cat => cat.parent_category_id !== null);

            setParentCategories(parents);
            // Organize child categories by parent ID
            const childCategoriesByParent = children.reduce((acc, cat) => {
                if (!acc[cat.parent_category_id]) {
                    acc[cat.parent_category_id] = [];
                }
                acc[cat.parent_category_id].push(cat);
                return acc;
            }, {});
            setChildCategories(childCategoriesByParent);
            setCategories(data); // Keep all categories for tag display
        }
    };

    const handleParentCategoryChange = (value) => {
        setSelectedParentCategory(value);
        setSelectedCategories([value]); // Start with the selected parent
    };

    const handleCategoryChange = (values) => {
        setSelectedCategories(values);
    };

    // const handleCategoryChange = (values) => {
    //     setSelectedCategories(values);
    // };

    const handleAddMessage = async () => {
        if (!newMessage || !activeTab) return;

        const channel = channels.find(c => c.slug === activeTab);
        if (!channel) return;

        const categoryIds = selectedCategories.map(cat => cat.value); // Extract IDs

        const { error } = await supabase.from('messages').insert([
            {
                message: newMessage,
                user_id: session?.user?.id,
                channel_id: channel.id,
                category_ids: categoryIds, // Store category IDs
                image_url: imageUrl, // store the image url
            },
        ]);

        if (error) {
            console.error('Error adding message:', error);
            message.error("Failed to add message.");
        } else {
            setNewMessage('');
            setSelectedCategories([]); // Clear selected categories
            setImageUrl(''); // Clear Image url
            setFileList([]);
            fetchMessages(activeTab);
        }
    };

    const handleDeleteMessage = async (messageId, channelSlug) => {
        const { error } = await supabase.from('messages').delete().eq('id', messageId);

        if (error) {
            console.error("Error deleting message:", error)
            message.error("Failed to delete message.");
        } else {
            fetchMessages(channelSlug);
        }
    };

    // ... (Other functions)

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    const handleImageChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    const handlePreview = async file => {
        if (!file.url && !file.preview) {
            setPreviewImage(file.thumbUrl);
            setPreviewVisible(true);
        } else {
            setPreviewImage(file.url || file.preview);
            setPreviewVisible(true);
        }
        setPreviewTitle(file.name || 'preview');
    };

    const handleUpload = async ({ file }) => {
        try {
            const { data, error } = await supabase.storage
                .from('your-bucket-name') // Replace with your bucket name
                .upload(`${session?.user?.id}/${file.name}`, file, {
                    contentType: file.type,
                });

            if (error) {
                console.error('Error uploading image:', error);
                message.error('Failed to upload image.');
                return;
            }

            const publicUrl = `${supabase.storageUrl}/object/public/${'your-bucket-name'}/${data.path}`; // Construct public URL
            setImageUrl(publicUrl);
            message.success('Image uploaded successfully!');

        } catch (error) {
            console.error('Error during upload:', error);
            message.error('An error occurred during upload.');
        }
    };

    const handleCancel = () => setPreviewVisible(false);

    return (
        <Card>
            <ForumComment />
            <Tabs activeKey={activeTab} onChange={handleTabChange}>
                {channels.map((channel) => (
                    <TabPane tab={channel.slug} key={channel.slug}>
                        <List
                            dataSource={messages[channel.slug] || []}
                            renderItem={(messageItem) => (
                                <List.Item
                                    actions={[
                                        <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDeleteMessage(messageItem.id, channel.slug)} />,
                                    ]}
                                >
                                    {messageItem.message}
                                    {messageItem.category_ids && messageItem.category_ids.map(categoryId => {
                                        const category = categories.find(cat => cat.id === categoryId);
                                        return category ? <Tag key={categoryId}>{category.category_name}</Tag> : null;
                                    })}
                                    {messageItem.image_url && (
                                        <Card
                                            style={{ marginTop: 16 }}
                                            cover={<img alt="example" src={messageItem.image_url} />}
                                        >
                                            <Card.Meta description={messageItem.message} />
                                        </Card>
                                    )}
                                </List.Item>
                            )}
                        />

                        {/* <Form.Item label="Categories">
                            <Select
                                mode="multiple"
                                style={{ width: '100%' }}
                                placeholder="Select Categories"
                                onChange={handleCategoryChange}
                                options={categories.map(category => ({
                                    value: category.id, // Use category ID as value
                                    label: category.category_name,
                                }))}
                            />
                        </Form.Item> */}

                        <Form.Item label="Parent Category">
                            <Select
                                style={{ width: '100%' }}
                                placeholder="Select Parent Category"
                                onChange={handleParentCategoryChange}
                                value={selectedParentCategory} // Important: Bind the value
                            >
                                {parentCategories.map(category => (
                                    <Option key={category.id} value={category.id}>
                                        {category.category_name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item label="Categories">
                            <Select
                                mode="multiple"
                                style={{ width: '100%' }}
                                placeholder="Select Categories"
                                onChange={handleCategoryChange}
                                value={selectedCategories} // Bind selectedCategories
                                options={[
                                    ...(selectedParentCategory ? childCategories[selectedParentCategory]?.map(cat => ({
                                        value: cat.id,
                                        label: cat.category_name,
                                    })) : []),
                                    ...parentCategories.map(category => ({
                                        value: category.id,
                                        label: category.category_name,
                                    })),
                                ]}
                            />
                        </Form.Item>

                        <TextArea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Enter your message"
                            onPressEnter={handleAddMessage}
                            autoSize={{ minRows: 1, maxRows: 3 }}
                        />

                        {/* <Upload
                            action={handleUpload}
                            listType="picture-card"
                            fileList={fileList}
                            onChange={handleImageChange}
                            onPreview={handlePreview}
                        >
                            {fileList.length >= 1 ? null : uploadButton}
                        </Upload> */}
                        <Modal
                            visible={previewVisible}
                            title={previewTitle}
                            footer={null}
                            onCancel={handleCancel}
                        >
                            <img alt="example" style={{ width: '100%' }} src={previewImage} />
                        </Modal>


                        <Button type="primary" onClick={handleAddMessage} style={{ marginTop: "10px" }}>
                            Send
                        </Button>
                    </TabPane>
                ))}
            </Tabs>

            <h2>Add New Channel</h2>
            <Input
                placeholder="New channel slug"
                value={newChannelSlug}
                onChange={(e) => setNewChannelSlug(e.target.value)}
            />
            <Button type="primary" onClick={handleAddChannel} icon={<PlusOutlined />} style={{ marginTop: "10px" }}>
                Add Channel
            </Button>

            <h2>Delete Channel</h2>
            <select onChange={(e) => handleDeleteChannel(e.target.value)}>
                <option value="">Select a Channel</option>
                {channels.map((channel) => (
                    <option key={channel.id} value={channel.id}>{channel.slug}</option>
                ))}
            </select>

        </Card>
    );
};

export default Channels;
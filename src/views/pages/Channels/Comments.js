import React, { useEffect, useState } from 'react';
import { Card, Avatar, Form, Button, List, Input, Cascader, Tag, Mentions, Flex, Drawer, Popconfirm, message, Empty, ConfigProvider, theme } from 'antd';
import { UserOutlined, MessageOutlined, DeleteOutlined, RocketOutlined, CloseOutlined, SendOutlined } from '@ant-design/icons';
import './styles.css';
import { supabase } from 'api/supabaseClient';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const { Option } = Mentions;


// Function to fetch and build tag hierarchy
const buildTagHierarchy = async () => {
    const { data, error } = await supabase
        .from('ib_categories')
        .select('id, category_name, parent_category_id');

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }

    // Create a map for easy lookup of parent-child relationships
    const categoryMap = new Map(data.map(category => [category.id, { ...category, children: [] }]));

    // Build the hierarchy
    const rootCategories = [];
    for (let category of data) {
        if (category.parent_category_id === null) {
            rootCategories.push(categoryMap.get(category.id));
        } else if (categoryMap.has(category.parent_category_id)) {
            categoryMap.get(category.parent_category_id).children.push(categoryMap.get(category.id));
        }
    }

    // Convert to the format expected by Cascader
    const convertToCascaderFormat = (category) => ({
        value: category.id,
        label: category.category_name,
        children: category.children.map(convertToCascaderFormat)
    });

    return rootCategories.map(convertToCascaderFormat);
};

const NewPostForm = ({ form, onSubmit, tags, setTags }) => {
    const [mentionUsers] = useState([ /* ... your mentionUsers data */]);

    const [tagHierarchy, setTagHierarchy] = useState([]);
    const [idToNameMap, setIdToNameMap] = useState(new Map());

    useEffect(() => {
        const loadHierarchy = async () => {
            const hierarchy = await buildTagHierarchy();
            setTagHierarchy(hierarchy);
            const map = new Map();
            function buildMap(categories) {
                categories.forEach(cat => {
                    map.set(cat.value, cat.label);
                    if (cat.children) buildMap(cat.children);
                });
            }
            buildMap(hierarchy);
            setIdToNameMap(map);
        };
        loadHierarchy();
    }, []);

    const handleCascaderChange = (value) => {
        if (value && value.length > 0) {
            setTags(value.map(id => ({ id, name: idToNameMap.get(id) })));
        } else {
            setTags([]);
        }
    };

    return (
        <Form
            form={form}
            onFinish={onSubmit}
            layout="vertical"
            style={{
                background: 'transparent', // Let ConfigProvider handle background
                // padding: 8, // Minimal padding for sleekness
                borderRadius: 4, // Subtle rounding
                // maxWidth: 400, // Keep it compact
            }}
        >
            {/* Single Control with Light Pastel Purple Background */}
            {/* Single Control with Light Pastel Purple Background */}
            <div style={{
                background: '#ccceee', // Light pastel purple
                borderRadius: 4,
                overflow: 'hidden',
                border: '1px solid #D8BFD8', // Subtle purple border
            }}>
                <Flex gap={8} align="center" style={{ padding: 8, width: '100%' }}>
                    {/* Message Input (taking most of the space, left-aligned) */}
                    <Form.Item
                        name="message"
                        rules={[{ required: true, message: 'Please write your message' }]}
                        style={{ flex: 1, margin: 0 }} // Take remaining space, no margins
                    >
                        <Mentions
                            rows={2} // Reduce rows for compactness
                            prefix={['@']}
                            placeholder="Write your message (use @ to mention users)"
                            style={{
                                // background: 'transparent', // Match light purple background
                                border: 'none', // No borders for sleekness
                                // color: '#4B0082', // Darker purple text
                                padding: 0, // Remove padding to align tightly
                                // Custom scrollbar styling
                                '::-webkit-scrollbar': {
                                    width: '4px', // Slim scrollbar
                                },
                                '::-webkit-scrollbar-track': {
                                    background: '#ccceee', // Light pastel purple to match background
                                    borderRadius: '2px', // Rounded corners
                                },
                                '::-webkit-scrollbar-thumb': {
                                    background: '#D8BFD8', // Light purple for thumb, matching tag/border color
                                    borderRadius: '2px', // Rounded corners
                                    '&:hover': {
                                        background: '#C0C0C0', // Slightly darker on hover for interactivity
                                    },
                                },
                                // Fallback for Firefox
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#D8BFD8 #ccceee',
                            }}
                        >
                            {mentionUsers?.map((user) => (
                                <Option key={user.id} value={user.id}>
                                    {user.display}
                                </Option>
                            ))}
                        </Mentions>
                    </Form.Item>

                    {/* Circular "Post Message" Button (right-aligned, same line) */}
                    <Button
                        type="primary"
                        htmlType="submit"
                        shape="circle" // Makes the button circular
                        icon={<SendOutlined />} // Paper airplane icon for "Post Message"
                        style={{
                            background: '#9370DB', // Medium purple
                            border: 'none',
                            fontSize: 16, // Adjust icon size if needed
                            padding: 8, // Ensure the circle is compact
                            height: 40, // Match height with input for consistency
                            width: 40, // Match width for a perfect circle
                        }}
                    />
                </Flex>

                {/* Tag Selection and Display in the same field, below the input and button */}
                <Flex gap={4} align="center" style={{ padding: '0 8px 8px', flexWrap: 'wrap' }}>
                    <Cascader
                        options={tagHierarchy}
                        onChange={handleCascaderChange}
                        placeholder="Add tags"
                        style={{
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            color: '#4B0082',
                            marginBottom: 4,
                        }}
                        showSearch
                        dropdownStyle={{ background: '#ccceee', color: '#4B0082' }} // Light purple dropdown
                    />
                    {/* {tags.map((tag) => (
                        <Tag
                            key={tag.id}
                            closable
                            onClose={() => setTags(tags.filter((t) => t.id !== tag.id))}
                            style={{
                                background: '#D8BFD8', // Light purple for tags
                                color: '#4B0082',
                                borderRadius: 2,
                                marginBottom: 4,
                                fontSize: 12, // Smaller text for compactness
                            }}
                            closeIcon={<CloseOutlined style={{ color: '#9370DB', fontSize: 10 }} />}
                        >
                            {tag.name}
                        </Tag>
                    ))} */}
                </Flex>
            </div>
        </Form>
    );
};
// const NewPostForm = ({ form, onSubmit, tags, setTags }) => {
//     const [mentionUsers] = useState([ /* ... your mentionUsers data */]);

//     const [tagHierarchy, setTagHierarchy] = useState([]);
//     const [idToNameMap, setIdToNameMap] = useState(new Map());

//     useEffect(() => {
//         const loadHierarchy = async () => {
//             const hierarchy = await buildTagHierarchy();
//             setTagHierarchy(hierarchy);
//             // Building a map of ID to name for easy lookup
//             const map = new Map();
//             function buildMap(categories) {
//                 categories.forEach(cat => {
//                     map.set(cat.value, cat.label);
//                     if (cat.children) buildMap(cat.children);
//                 });
//             }
//             buildMap(hierarchy);
//             setIdToNameMap(map);
//         };
//         loadHierarchy();
//     }, []);

//     // useEffect(() => {
//     //     const loadHierarchy = async () => {
//     //         const hierarchy = await buildTagHierarchy();
//     //         setTagHierarchy(hierarchy);
//     //     };
//     //     loadHierarchy();
//     // }, []);

//     // const handleCascaderChange = (value) => {
//     //     if (value && value.length > 0) {
//     //         setTags(value);
//     //     } else {
//     //         setTags([]);
//     //     }
//     // };
//     const handleCascaderChange = (value) => {
//         if (value && value.length > 0) {
//             // Convert ID array to names array for display
//             setTags(value.map(id => ({ id, name: idToNameMap.get(id) })));
//         } else {
//             setTags([]);
//         }
//     };

//     return (
//         <Form form={form} onFinish={onSubmit}>
//             <Form.Item
//                 name="message"
//                 rules={[{ required: true, message: 'Please write your message' }]}
//             >
//                 <Mentions
//                     rows={4}
//                     prefix={['@']}
//                     placeholder="Write your message (use @ to mention users)"
//                 >
//                     {mentionUsers?.map((user) => (
//                         <Option key={user.id} value={user.id}>
//                             {user.display}
//                         </Option>
//                     ))}
//                 </Mentions>
//             </Form.Item>

//             <Form.Item label="Add Tags">
//                 <Flex gap={8}>
//                     <Cascader
//                         options={tagHierarchy}
//                         onChange={handleCascaderChange}
//                         placeholder="Hierarchical tags"
//                         style={{ width: 200 }}
//                         showSearch
//                     />
//                     {/* <Input
//                         placeholder="Free-form tags"
//                         onPressEnter={(e) => {
//                             const target = e.target;
//                             const newTag = target.value.trim();
//                             if (newTag) {
//                                 setTags([...tags, newTag]);
//                                 target.value = '';
//                             }
//                         }}
//                     /> */}
//                 </Flex>
//             </Form.Item>

//             <div style={{ marginTop: 16 }}>
//                 {/* {tags.map((tag) => (
//                     <Tag
//                         key={tag}
//                         closable
//                         onClose={() => setTags(tags.filter((t) => t !== tag))}
//                         style={{ marginBottom: 8 }}
//                     >
//                         {tag}
//                     </Tag>
//                 ))} */}
//                 {tags.map((tag) => (
//                     <Tag
//                         key={tag.id}
//                         closable
//                         onClose={() => setTags(tags.filter((t) => t.id !== tag.id))}
//                         style={{ marginBottom: 8 }}
//                     >
//                         {tag.name}
//                     </Tag>
//                 ))}
//             </div>

//             <Form.Item style={{ marginTop: 24 }}>
//                 <Button type="primary" htmlType="submit">
//                     Post Message
//                 </Button>
//             </Form.Item>
//         </Form>
//     );
// };

const ForumComment = ({ channel_id }) => {
    const [form] = Form.useForm();
    const [tags, setTags] = useState([]);
    const [messages, setMessages] = useState([]);
    const [mentionUsers] = useState([
        { id: '1', display: 'Alice' },
        { id: '2', display: 'Bob' },
    ]);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const { session } = useSelector((state) => state.auth);
    const [idToNameMap, setIdToNameMap] = useState(new Map());
    const [searchText, setSearchText] = useState("");
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // Fetch messages on component mount or when channel_id changes
        const fetchMessages = async () => {
            if (channel_id) {
                const { data, error } = await supabase
                    .from('channel_posts')
                    .select('*, user:users(user_name),channel:channels(slug),reply_count:channel_post_messages(count)')
                    .eq('channel_id', channel_id)
                    .order('inserted_at', { ascending: false });

                if (error) {
                    console.error("Error fetching messages:", error);
                } else {
                    console.log("gh", data);
                    // If we haven't loaded the hierarchy yet, do it now
                    if (idToNameMap.size === 0) {
                        const hierarchy = await buildTagHierarchy();
                        const map = new Map();
                        function buildMap(categories) {
                            categories.forEach(cat => {
                                map?.set(cat?.value, cat?.label);
                                if (cat?.children) buildMap(cat?.children);
                            });
                        }
                        buildMap(hierarchy);
                        setIdToNameMap(map);
                    }
                    // setMessages(data || []);
                    // Process data to include reply_count
                    const processedData = data?.map(item => ({
                        ...item,
                        reply_count: item?.reply_count[0]?.count || 0, // Default to 0 if no replies
                    }));
                    setMessages(processedData || []);
                }
            }
        };

        fetchMessages();
    }, [channel_id]);

    const handleSubmit = async (values) => {
        if (!session?.user?.id) return;

        const firstTag = tags?.length > 0 ? tags[0] : null;
        const otherTags = tags?.slice(1);

        const newMessage = {
            message: values.message,
            user_id: session?.user?.id,
            channel_id: channel_id,
            details: {
                tags: otherTags?.map(tag => tag?.id),
                category_id: firstTag?.id,
            },
        };

        try {
            const { data, error } = await supabase
                .from('channel_posts')
                .insert([newMessage]).select('*');
            console.log("tt", data);
            if (error) {
                console.error("Error inserting message:", error);
            } else {
                // Fetch the newly inserted message (it will have the correct timestamp and ID)
                const { data: insertedMessage } = await supabase
                    .from('channel_posts')
                    .select('*, user:users(user_name)')
                    .eq('id', data[0].id) // Use the ID from the insert response
                    .single(); // Expecting only one result

                if (insertedMessage) {

                    setMessages([insertedMessage, ...messages]); // Add the fetched message to state
                    form.resetFields();
                    setTags([]);
                } else {
                    console.error("Failed to fetch inserted message")
                }



            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCascaderChange = (value) => {
        if (value && value.length > 0) {
            setTags(value); // Directly set the value array as tags
        } else {
            setTags([]); // Clear tags if selection is cleared
        }
    };

    const [filteredMessages, setFilteredMessages] = useState([]);

    useEffect(() => {
        const filterMessages = (text) => {
            const lowerCaseSearchText = text.toLowerCase();
            return messages.filter(message => {
                const userName = message.user?.user_name?.toLowerCase() || '';
                const messageContent = message.message?.toLowerCase() || '';
                const tags = message.details?.tags?.map(tag => idToNameMap?.get(tag) || tag).join(' ').toLowerCase() || '';
                const category = idToNameMap.get(message?.details?.category_id)?.toLowerCase() || message.details?.category_id?.toLowerCase() || '';
                return userName.includes(lowerCaseSearchText) ||
                    messageContent.includes(lowerCaseSearchText) ||
                    tags.includes(lowerCaseSearchText) ||
                    category.includes(lowerCaseSearchText);
            });
        };

        setFilteredMessages(filterMessages(searchText));
    }, [searchText, messages, idToNameMap]);

    const handleDelete = async (messageId) => {
        try {
            const { error } = await supabase
                .from('channel_posts')
                .delete()
                .eq('id', messageId);

            if (error) {
                console.error("Error deleting message:", error);
                message.error("Failed to delete message."); // Ant Design message
            } else {
                setMessages(messages.filter(msg => msg.id !== messageId)); // Optimistic update
                message.success("Message deleted successfully."); // Ant Design message
            }
        } catch (err) {
            console.error(err);
            message.error("An error occurred."); // Ant Design message
        }
    };

    const formatMessage = (text) => {
        const words = text.split(' ');
        const boldWords = words.slice(0, 5).join(' '); // First 5 words bold
        const restWords = words.slice(5).join(' ');
        return (
            <span>
                <strong>{boldWords}</strong> {restWords}
            </span>
        );
    };
    return (
        <div className="forum-container"> {/* Main container */}
            <div className="message-list">
                {/* <Card title={<><MessageOutlined /> New Post</>} style={{ marginTop: 24 }}> */}
                <ConfigProvider
                    theme={{
                        algorithm: theme.defaultAlgorithm, // Use AntD's default light theme
                        token: {
                            // colorPrimary: '#9370DB', // Medium purple for buttons and accents
                            // colorBgContainer: '#ccceee', // Light pastel purple background
                            // colorBgBase: '#ccceee', // Consistent light purple base
                            // colorText: '#4B0082', // Darker purple for text (e.g., Indigo)
                            colorBorder: '#D8BFD8', // Light purple border for subtle contrast
                            borderRadius: 4, // Subtle rounded corners
                            fontFamily: 'Inter, sans-serif', // Modern font
                        },
                    }}
                >

                    <NewPostForm form={form} onSubmit={handleSubmit} tags={tags} setTags={setTags} />
                </ConfigProvider>
                {/* </Card> */}
                <div style={{ marginBottom: 16 }}>
                    <Input
                        placeholder="Search by user name, message or tag"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
                {filteredMessages?.length > 0 ?
                    <List
                        dataSource={filteredMessages}
                        renderItem={(item) => (
                            <Card
                                style={{
                                    marginBottom: 16,
                                    borderRadius: 10,
                                    background: '#fff',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                                    padding: '16px',
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                    border: '1px solid #f0f0f0',
                                }}
                                bodyStyle={{ padding: 0 }}
                                hoverable
                            >
                                {/* Row 1: Message and Reply Controls */}
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '14px',
                                        marginBottom: 14,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8, // Space between reply count and reply button
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 28,
                                                height: 28,
                                                background: '#ccceee',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 700,
                                                fontSize: 14,
                                                color: '#9370DB',
                                                cursor: 'pointer',
                                                transition: 'background 0.2s ease',
                                            }}
                                            onClick={() => navigate(`/app/networking/${item.id}`)}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = '#D8BFD8')}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = '#ccceee')}
                                        >
                                            {item?.reply_count}
                                        </div>
                                        {/* <Button
                                            type="link"
                                            onClick={() => navigate(`/app/networking/${item?.id}`)}
                                            style={{
                                                padding: 0,
                                                fontSize: 13,
                                                color: '#9370DB',
                                                fontWeight: 500,
                                                height: 'auto', // Remove default button height
                                                lineHeight: 1, // Align with reply count
                                            }}
                                        >
                                            Reply
                                        </Button> */}
                                    </div>
                                    <div
                                        style={{
                                            flex: 1,
                                            color: '#333',
                                            fontSize: 14.5,
                                            lineHeight: 1.5,
                                            wordBreak: 'break-word',
                                        }}
                                    >
                                        {formatMessage(item?.message)}
                                        <Button
                                            type="link"
                                            onClick={() => navigate(`/app/networking/${item?.id}`)}
                                            style={{
                                                padding: 0,
                                                fontSize: 13,
                                                color: '#9370DB',
                                                fontWeight: 500,
                                                height: 'auto', // Remove default button height
                                                lineHeight: 1, // Align with reply count
                                            }}
                                        >
                                            Reply
                                        </Button>
                                    </div>
                                </div>

                                {/* Row 2: Username, Tags (center-aligned), Timestamp */}
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        paddingBottom: 10,
                                        borderBottom: '1px solid #f5f5f5',
                                    }}
                                >
                                    {/* Left: Avatar and Username */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                        {/* <Avatar
                                            icon={<UserOutlined />}
                                            size={36}
                                            style={{
                                                backgroundColor: '#333',
                                                border: '2px solid #ccceee',
                                            }}
                                        /> */}
                                        <div style={{ minWidth: 0 }}>
                                            <span
                                                style={{
                                                    fontWeight: 600,
                                                    color: '#333eee',
                                                    fontSize: 15,
                                                }}
                                            >
                                                {item?.user?.user_name}
                                            </span>
                                            {/* <div
                                                style={{
                                                    fontSize: 11,
                                                    color: '#999',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                            {new Date(item?.inserted_at).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}{' '}
                                            ·{' '}
                                            {new Date(item?.inserted_at).toLocaleDateString([], {
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </div> */}
                                        </div>
                                    </div>

                                    {/* Center: Tags */}
                                    <div
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
                                            gap: 6,
                                            padding: '0 10px',
                                        }}
                                    >
                                        {item?.details?.category_id && (
                                            <Tag
                                                style={{
                                                    borderRadius: 12,
                                                    background: '#ccceee',
                                                    color: '#333eee',
                                                    fontSize: 12,
                                                    padding: '2px 8px',
                                                    border: 'none',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {idToNameMap.get(item?.details?.category_id) || item?.details?.category_id}
                                            </Tag>
                                        )}
                                        {item?.details?.tags?.map((tag) => (
                                            <Tag
                                                key={tag}
                                                style={{
                                                    borderRadius: 12,
                                                    background: '#ccceee',
                                                    color: '#333eee',
                                                    fontSize: 12,
                                                    padding: '2px 8px',
                                                    border: 'none',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {idToNameMap?.get(tag) || tag}
                                            </Tag>
                                        ))}
                                    </div>

                                    {/* Right: Timestamp */}
                                    <span
                                        style={{
                                            fontSize: 12,
                                            color: '#888',
                                            fontStyle: 'italic',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {new Date(item?.inserted_at).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}{' '}
                                        ·{' '}
                                        {new Date(item?.inserted_at).toLocaleDateString([], {
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </span>
                                </div>

                                {/* Delete Button (if authorized) */}
                                {(session?.user?.role_type === 'superadmin' || session?.user?.id === item.user_id) && (
                                    <Popconfirm
                                        title="Are you sure to delete this message?"
                                        onConfirm={() => handleDelete(item?.id)}
                                        okText="Yes"
                                        cancelText="No"
                                        placement="topRight"
                                    >
                                        <DeleteOutlined
                                            style={{
                                                position: 'absolute',
                                                top: 16,
                                                right: 16,
                                                cursor: 'pointer',
                                                color: '#ff4d4f',
                                                fontSize: 18,
                                                transition: 'color 0.2s ease',
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.color = '#ff7875')}
                                            onMouseLeave={(e) => (e.currentTarget.style.color = '#ff4d4f')}
                                        />
                                    </Popconfirm>
                                )}
                            </Card>
                        )}
                    />
                    :
                    <>
                        {/* <>Start posting your message for everyone in the group to interact!</> */}
                        <Empty
                            image={<RocketOutlined style={{ fontSize: '48px', color: '#40a9ff' }} />}
                            imageStyle={{
                                height: 70,
                            }}
                            description={
                                <span>
                                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Welcome to the {messages[0]?.channel?.slug} Group!</span><br />
                                    This space is ready for your team's conversations and updates.  Start by sharing a message or even just a quick "hello!".  Let's get this rolling!
                                </span>
                            }
                        >
                            {/* <div style={{ marginTop: 16 }}>
                                <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
                                    Tip: Try typing a message below and pressing Enter to get started.
                                </span>
                            </div> */}
                        </Empty>
                    </>

                }
            </div>
            {/* <div className="new-post-container">
                <Card title={<>Register for Stream</>} style={{ marginTop: 24 }}>

                </Card>
            </div> */}
            <Drawer
                title="New Post"
                placement="bottom"
                closable={true}
                onClose={() => setIsDrawerVisible(false)}
                visible={isDrawerVisible}
                style={{ padding: 0 }}
            >
                <Card style={{ border: 'none', padding: 0 }}>{/* Card inside Drawer */}
                    <Form form={form} onFinish={handleSubmit}>
                        <NewPostForm form={form} onSubmit={handleSubmit} tags={tags} setTags={setTags} />
                        {/* ... (Form content - Mentions, Tags, etc.) */}
                    </Form>
                </Card>
            </Drawer>

            {/* Floating Button (for smaller screens) */}
            {/* {isMobile && <div className="new-post-button-container">
                <Button
                    type="primary"
                    icon={<MessageOutlined />}
                    onClick={() => setIsDrawerVisible(true)}
                >
                    New Post
                </Button>
            </div>} */}
        </div >
    );
};

export default ForumComment;
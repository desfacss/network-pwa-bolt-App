// // import React, { useState, useEffect } from 'react';
// // import { Drawer, Menu, Input, Button, message, Card, Modal, Popconfirm, notification } from 'antd';
// // import { CloseOutlined, PlusOutlined, MenuOutlined } from '@ant-design/icons';
// // import { supabase } from 'configs/SupabaseConfig';
// // import { useSelector } from 'react-redux';
// // import ForumComment from './Comments';
// // import PostMessage from './PostMessage';
// // import { useNavigate } from 'react-router-dom';
// // import { APP_PREFIX_PATH } from 'configs/AppConfig';
// // import PropTypes from 'prop-types';
// // import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// // const useMediaQuery = (query) => {
// //   const [matches, setMatches] = useState(window.matchMedia(query).matches);

// //   React.useEffect(() => {
// //     const media = window.matchMedia(query);
// //     const listener = () => setMatches(media.matches);
// //     media.addListener(listener);
// //     return () => media.removeListener(listener);
// //   }, [query]);

// //   return matches;
// // };

// // const Channels = ({ channelId, isPrivate = false, onChannelChange, onUnreadCountChange }) => {
// //   const { session } = useSelector((state) => state.auth);
// //   const queryClient = useQueryClient();
// //   const navigate = useNavigate();
// //   const isDesktop = useMediaQuery('(min-width: 768px)');
// //   const [searchText, setSearchText] = useState('');
// //   const [editingMessage, setEditingMessage] = useState(null);
// //   const [drawerVisible, setDrawerVisible] = useState(false);
// //   const [isModalVisible, setIsModalVisible] = useState(false);
// //   const [isChannelsDrawerVisible, setIsChannelsDrawerVisible] = useState(false);
// //   const [isMessageDrawerVisible, setIsMessageDrawerVisible] = useState(false);
// //   const [newChannelSlug, setNewChannelSlug] = useState('');

// //   // Fetch channels
// //   const { data: channels = [] } = useQuery({
// //     queryKey: ['channels', isPrivate, channelId],
// //     queryFn: async () => {
// //       const query = supabase
// //         .from('channels')
// //         .select('*')
// //         .order('inserted_at', { ascending: true });

// //       if (isPrivate) {
// //         query.eq('is_public', false); // Fetch private channels
// //       } else if (channelId) {
// //         query.eq('id', channelId); // Fetch specific public channel
// //       }

// //       const { data, error } = await query;
// //       if (error) throw error;
// //       return data;
// //     },
// //     staleTime: 5 * 60 * 1000,
// //   });

// //   // Fetch user names
// //   const { data: userNames = {} } = useQuery({
// //     queryKey: ['userNames', channels],
// //     queryFn: async () => {
// //       const userIds = [...new Set(channels.flatMap(ch => ch.join_requests || []))];
// //       if (userIds.length === 0) return {};

// //       const { data, error } = await supabase
// //         .from('users')
// //         .select('id, user_name')
// //         .in('id', userIds);

// //       if (error) throw error;
// //       return data.reduce((acc, user) => ({ ...acc, [user.id]: user.user_name }), {});
// //     },
// //     enabled: channels.length > 0,
// //     staleTime: 5 * 60 * 1000,
// //   });

// //   // Fetch unread counts
// //   const { data: unreadCounts = {} } = useQuery({
// //     queryKey: ['unreadCounts', session?.user?.id, channelId, isPrivate],
// //     queryFn: async () => {
// //       if (!session?.user?.id) return {};

// //       let channelIds = [];
// //       if (isPrivate) {
// //         const { data: channelData } = await supabase
// //           .from('channels')
// //           .select('id')
// //           .eq('is_public', false);
// //         channelIds = channelData.map(ch => ch.id);
// //       } else {
// //         channelIds = [channelId].filter(Boolean);
// //       }

// //       const { data, error } = await supabase.rpc('get_unread_counts', { user_id: session.user.id });
// //       if (error) throw error;

// //       return data
// //         .filter(row => channelIds.includes(row.channel_id))
// //         .reduce((acc, row) => ({ ...acc, [row.channel_id]: row.unread_count }), {});
// //     },
// //     enabled: !!session?.user?.id,
// //     staleTime: 5 * 60 * 1000,
// //     onSuccess: (data) => {
// //       const totalUnread = Object.values(data).reduce((sum, count) => sum + count, 0);
// //       if (onUnreadCountChange && activeChannel) {
// //         if (isPrivate) {
// //           onUnreadCountChange(data[activeChannel.id] || 0, activeChannel.id);
// //         } else if (!isPrivate && channelId) {
// //           onUnreadCountChange(data[channelId] || 0, channelId);
// //         }
// //       }
// //     },
// //   });

// //   // Active channel
// //   const activeChannel = isPrivate
// //     ? channels.find(c => c.id === channelId) || channels[0]
// //     : channels.find(c => c.id === channelId);

// //   useEffect(() => {
// //     if (activeChannel) {
// //       console.log('Active channel:', activeChannel);
// //       if (onChannelChange) {
// //         onChannelChange(activeChannel);
// //       }
// //     } else {
// //       console.log('No active channel selected', { channels, channelId, isPrivate });
// //     }
// //   }, [activeChannel, onChannelChange]);

// //   // Mutations
// //   const addChannelMutation = useMutation({
// //     mutationFn: async () => {
// //       const { error } = await supabase.from('channels').insert([{
// //         slug: isPrivate ? 'Private' : newChannelSlug,
// //         created_by: session?.user?.id,
// //         organization_id: session?.user?.organization?.id,
// //         is_inbox: isPrivate,
// //       }]);
// //       if (error) throw error;
// //     },
// //     onSuccess: () => {
// //       queryClient.invalidateQueries(['channels']);
// //       setNewChannelSlug('');
// //       setIsModalVisible(false);
// //       message.success('Channel created successfully!');
// //     },
// //     onError: () => message.error('Failed to create channel.'),
// //   });

// //   const deleteChannelMutation = useMutation({
// //     mutationFn: async (channelId) => {
// //       const { error } = await supabase.from('channels').delete().eq('id', channelId);
// //       if (error) throw error;
// //     },
// //     onSuccess: () => {
// //       queryClient.invalidateQueries(['channels']);
// //       message.success('Channel deleted successfully!');
// //     },
// //     onError: () => message.error('Failed to delete channel.'),
// //   });

// //   const approveJoinRequestMutation = useMutation({
// //     mutationFn: async ({ channelId, userId }) => {
// //       const targetChannel = channels.find(c => c.id === channelId);
// //       const newJoinRequests = targetChannel.join_requests.filter(id => id !== userId);

// //       await supabase.from('channels').update({ join_requests: newJoinRequests }).eq('id', channelId);

// //       const { data: user } = await supabase
// //         .from('users')
// //         .select('subscriptions')
// //         .eq('id', userId)
// //         .single();

// //       const newSubscriptions = {
// //         ...user?.subscriptions,
// //         channels: [...(user?.subscriptions?.channels || []), channelId],
// //       };

// //       await supabase.from('users').update({ subscriptions: newSubscriptions }).eq('id', userId);
// //     },
// //     onMutate: async ({ channelId, userId }) => {
// //       await queryClient.cancelQueries(['channels']);
// //       const previousChannels = queryClient.getQueryData(['channels', isPrivate]);
// //       queryClient.setQueryData(['channels', isPrivate], (old) =>
// //         old.map((ch) =>
// //           ch.id === channelId
// //             ? { ...ch, join_requests: ch.join_requests.filter((id) => id !== userId) }
// //             : ch
// //         )
// //       );
// //       return { previousChannels };
// //     },
// //     onError: (err, variables, context) => {
// //       queryClient.setQueryData(['channels', isPrivate], context.previousChannels);
// //       message.error('Failed to approve join request.');
// //     },
// //     onSuccess: (_, { userId }) => {
// //       queryClient.invalidateQueries(['channels']);
// //       notification.success({ message: `${userNames[userId] || 'User'}'s join request approved!` });
// //     },
// //   });

// //   const unsubscribeMutation = useMutation({
// //     mutationFn: async (channelId) => {
// //       const { data: user } = await supabase
// //         .from('users')
// //         .select('subscriptions')
// //         .eq('id', session.user.id)
// //         .single();

// //       const updatedChannels = user?.subscriptions?.channels?.filter(id => id !== channelId) || [];
// //       const newSubscriptions = {
// //         ...user?.subscriptions,
// //         channels: updatedChannels,
// //       };

// //       await supabase
// //         .from('users')
// //         .update({ subscriptions: newSubscriptions })
// //         .eq('id', session.user.id);
// //     },
// //     onSuccess: () => {
// //       queryClient.invalidateQueries(['channels']);
// //       message.success('Unsubscribed from channel successfully!');
// //       window.location.reload();
// //     },
// //     onError: () => message.error('Failed to unsubscribe from channel.'),
// //   });

// //   const handleJoinRequest = async (channelId) => {
// //     const targetChannel = channels.find(c => c.id === channelId);
// //     const { error } = await supabase
// //       .from('channels')
// //       .update({
// //         join_requests: [...(targetChannel.join_requests || []), session.user.id],
// //       })
// //       .eq('id', channelId);

// //     if (error) {
// //       message.error('Failed to request to join channel.');
// //     } else {
// //       message.success('Join request sent!');
// //       queryClient.invalidateQueries(['channels']);
// //     }
// //   };

// //   const renderChannelContent = (targetChannel) => {
// //     if (!targetChannel) {
// //       return <div>No channel selected.</div>;
// //     }

// //     console.log('Rendering channel content:', {
// //       targetChannel,
// //       isSubscribed: session?.user?.subscriptions?.channels?.includes(targetChannel.id),
// //       isCreator: session.user.id === targetChannel.created_by,
// //       isAdmin: session.user.role_type === 'superadmin' || session.user.role_type === 'admin',
// //     });

// //     const isSubscribed = session?.user?.subscriptions?.channels?.includes(targetChannel.id);
// //     const isAuthorized =
// //       isSubscribed ||
// //       session.user.id === targetChannel.created_by ||
// //       session.user.role_type === 'superadmin' ||
// //       session.user.role_type === 'admin';

// //     if (isAuthorized) {
// //       return (
// //         <ForumComment
// //           channel_id={targetChannel.id}
// //           isPrivate={!targetChannel.is_public}
// //           searchText={searchText}
// //           setSearchText={setSearchText}
// //           setDrawerVisible={setDrawerVisible}
// //           setEditingMessage={setEditingMessage}
// //           drawerVisible={drawerVisible}
// //           editingMessage={editingMessage}
// //         />
// //       );
// //     } else if ((targetChannel?.join_requests || []).includes(session.user.id)) {
// //       return <div>Requested to Join</div>;
// //     } else {
// //       return <Button onClick={() => handleJoinRequest(targetChannel.id)}>Request to Join</Button>;
// //     }
// //   };

// //   const renderMenu = () => (
// //     <Menu
// //       selectedKeys={activeChannel ? [activeChannel.slug] : []}
// //       mode="vertical"
// //       onClick={({ key }) => {
// //         const selectedChannel = channels.find(c => c.slug === key);
// //         if (selectedChannel) {
// //           queryClient.setQueryData(['channels', isPrivate], (old) => old);
// //           if (onChannelChange) {
// //             onChannelChange(selectedChannel);
// //           }
// //           setIsChannelsDrawerVisible(false);
// //         }
// //       }}
// //       style={{ width: '100%', border: 'none' }}
// //     >
// //       {channels?.map(channel => (
// //         <Menu.Item key={channel.slug}>
// //           <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
// //             {channel.slug}
// //             {unreadCounts[channel.id] > 0 && (
// //               <span style={{ color: 'red', marginLeft: 8 }}>({unreadCounts[channel.id]})</span>
// //             )}
// //             {(session.user.id === channel.created_by || session?.user?.role_type === 'superadmin' || session?.user?.role_type === 'admin') && (
// //               <Popconfirm
// //                 title={`Are you sure to delete ${channel.slug}?`}
// //                 onConfirm={() => deleteChannelMutation.mutate(channel.id)}
// //                 okText="Yes"
// //                 cancelText="No"
// //               >
// //                 <CloseOutlined style={{ color: 'red', cursor: 'pointer' }} />
// //               </Popconfirm>
// //             )}
// //             {channel.join_requests?.length > 0 &&
// //               (session.user.id === channel.created_by || session?.user?.role_type === 'superadmin' || session?.user?.role_type === 'admin') && (
// //                 <Button
// //                   size="small"
// //                   onClick={() => {
// //                     Modal.info({
// //                       title: 'Join Requests',
// //                       content: (
// //                         <div>
// //                           {channel.join_requests.map(userId => (
// //                             <div key={userId} style={{ marginBottom: 8 }}>
// //                               <Button onClick={() => approveJoinRequestMutation.mutate({ channelId: channel.id, userId })}>
// //                                 Approve
// //                               </Button>{' '}
// //                               For {userNames[userId] || 'Unknown User'}
// //                             </div>
// //                           ))}
// //                         </div>
// //                       ),
// //                     });
// //                   }}
// //                 >
// //                   View Requests
// //                 </Button>
// //               )}
// //           </span>
// //         </Menu.Item>
// //       ))}
// //       {(session?.user?.role_type === 'superadmin' || session?.user?.role_type === 'admin') && (
// //         <Button
// //           type="primary"
// //           icon={<PlusOutlined />}
// //           onClick={() => setIsModalVisible(true)}
// //           style={{ marginTop: 16, width: '100%' }}
// //         >
// //           Add Channel
// //         </Button>
// //       )}
// //     </Menu>
// //   );

// //   return (
// //     <div style={{ padding: 0 }}>
// //       <Card style={{ width: '100%' }}>
// //         <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
// //           {!isPrivate && !isDesktop && session?.user?.features?.feature?.channels && (
// //             <Button
// //               type="primary"
// //               className="fab-button"
// //               shape="circle"
// //               icon={<PlusOutlined />}
// //               onClick={() => {
// //                 setEditingMessage(null);
// //                 setDrawerVisible(true);
// //               }}
// //             />
// //           )}
// //         </div>

// //         <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', width: '100%' }}>
// //           <Input
// //             placeholder="Search by user name, message or tag"
// //             value={searchText}
// //             onChange={e => setSearchText(e.target.value)}
// //             style={{ flex: 1, minWidth: isDesktop ? '48%' : '48%' }}
// //           />
// //           {isPrivate && (
// //             <Button
// //               type="primary"
// //               onClick={() => navigate(`${APP_PREFIX_PATH}/members`)}
// //               style={{ flex: 1, minWidth: isDesktop ? '40%' : '24%' }}
// //             >
// //               Members
// //             </Button>
// //           )}
// //           {!isPrivate && isDesktop && session?.user?.features?.feature?.channels && (
// //             <Button
// //               type="primary"
// //               onClick={() => {
// //                 setEditingMessage(null);
// //                 setDrawerVisible(true);
// //               }}
// //               style={{ flex: 1, minWidth: '8%' }}
// //             >
// //               Add Post
// //             </Button>
// //           )}
// //           {session?.user?.subscriptions?.channels?.includes(activeChannel?.id) && (
// //             <Button
// //               type="default"
// //               onClick={() => unsubscribeMutation.mutate(activeChannel?.id)}
// //               style={{ flex: 1, minWidth: '24%' }}
// //             >
// //               Unsubscribe
// //             </Button>
// //           )}
// //         </div>

// //         {activeChannel?.join_requests?.length > 0 &&
// //           (session?.user?.id === activeChannel.created_by || session?.user?.role_type === 'superadmin' || session?.user?.role_type === 'admin') && (
// //             <Button
// //               type="primary"
// //               size="small"
// //               onClick={() => {
// //                 Modal.info({
// //                   key: activeChannel?.id,
// //                   title: 'Join Requests',
// //                   content: (
// //                     <div>
// //                       {activeChannel?.join_requests?.map(userId => (
// //                         <div key={userId} style={{ marginBottom: 8 }}>
// //                           <Button onClick={() => approveJoinRequestMutation.mutate({ channelId: activeChannel.id, userId })}>
// //                             Approve
// //                           </Button>{' '}
// //                           For {userNames[userId] || 'Unknown User'}
// //                         </div>
// //                       ))}
// //                     </div>
// //                   ),
// //                 });
// //               }}
// //             >
// //               View Requests
// //             </Button>
// //           )}

// //         {isPrivate && (
// //           <Drawer
// //             title="Channels"
// //             placement="right"
// //             onClose={() => setIsChannelsDrawerVisible(false)}
// //             visible={isChannelsDrawerVisible}
// //             width={isDesktop ? 300 : '80%'}
// //           >
// //             {renderMenu()}
// //           </Drawer>
// //         )}

// //         <Drawer
// //           title="New Message"
// //           placement="bottom"
// //           height="100%"
// //           onClose={() => setIsMessageDrawerVisible(false)}
// //           visible={isMessageDrawerVisible}
// //           bodyStyle={{ padding: 0 }}
// //         >
// //           <PostMessage
// //             user_id={session?.user?.id}
// //             receiver_user_id={null}
// //             closeModal={() => setIsMessageDrawerVisible(false)}
// //           />
// //         </Drawer>

// //         {activeChannel && renderChannelContent(activeChannel)}

// //         {!isPrivate && (session?.user?.role_type === 'superadmin' || session?.user?.role_type === 'admin') && (
// //           <Modal
// //             title="Add New Channel"
// //             visible={isModalVisible}
// //             onOk={() => addChannelMutation.mutate()}
// //             onCancel={() => setIsModalVisible(false)}
// //           >
// //             <Input
// //               placeholder="New channel slug"
// //               value={newChannelSlug}
// //               onChange={e => setNewChannelSlug(e.target.value)}
// //             />
// //           </Modal>
// //         )}
// //       </Card>
// //     </div>
// //   );
// // };

// // Channels.propTypes = {
// //   channelId: PropTypes.string,
// //   isPrivate: PropTypes.bool,
// //   onChannelChange: PropTypes.func,
// //   onUnreadCountChange: PropTypes.func,
// // };

// // Channels.defaultProps = {
// //   channelId: '',
// //   isPrivate: false,
// //   onChannelChange: () => {},
// //   onUnreadCountChange: () => {},
// // };

// // export default React.memo(Channels);

// import React, { useState, useEffect } from 'react';
// import { Drawer, Menu, Input, Button, message, Card, Modal, Popconfirm, notification } from 'antd';
// import { CloseOutlined, PlusOutlined, MenuOutlined } from '@ant-design/icons';
// import { supabase } from 'configs/SupabaseConfig';
// import { useSelector } from 'react-redux';
// import ForumComment from './Comments';
// import PostMessage from './PostMessage';
// import { useNavigate } from 'react-router-dom';
// import { APP_PREFIX_PATH } from 'configs/AppConfig';
// import PropTypes from 'prop-types';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// const useMediaQuery = (query) => {
//   const [matches, setMatches] = useState(window.matchMedia(query).matches);

//   React.useEffect(() => {
//     const media = window.matchMedia(query);
//     const listener = () => setMatches(media.matches);
//     media.addListener(listener);
//     return () => media.removeListener(listener);
//   }, [query]);

//   return matches;
// };

// const Channels = ({ channelId, isPrivate = false, onChannelChange, onUnreadCountChange }) => {
//   const { session } = useSelector((state) => state.auth);
//   const queryClient = useQueryClient();
//   const navigate = useNavigate();
//   const isDesktop = useMediaQuery('(min-width: 768px)');
//   const [searchText, setSearchText] = useState('');
//   const [editingMessage, setEditingMessage] = useState(null);
//   const [drawerVisible, setDrawerVisible] = useState(false);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [isChannelsDrawerVisible, setIsChannelsDrawerVisible] = useState(false);
//   const [isMessageDrawerVisible, setIsMessageDrawerVisible] = useState(false);
//   const [newChannelSlug, setNewChannelSlug] = useState('');

//   // Fetch channels
//   const { data: channels = [] } = useQuery({
//     queryKey: ['channels', isPrivate, channelId],
//     queryFn: async () => {
//       const query = supabase
//         .from('channels')
//         .select('*')
//         .order('inserted_at', { ascending: true });

//       if (isPrivate) {
//         query.eq('is_public', false); // Fetch private channels
//       } else if (channelId) {
//         query.eq('id', channelId); // Fetch specific public channel
//       }

//       const { data, error } = await query;
//       if (error) throw error;
//       return data;
//     },
//     staleTime: 5 * 60 * 1000,
//   });

//   // Fetch user names
//   const { data: userNames = {} } = useQuery({
//     queryKey: ['userNames', channels],
//     queryFn: async () => {
//       const userIds = [...new Set(channels.flatMap(ch => ch.join_requests || []))];
//       if (userIds.length === 0) return {};

//       const { data, error } = await supabase
//         .from('users')
//         .select('id, user_name')
//         .in('id', userIds);

//       if (error) throw error;
//       return data.reduce((acc, user) => ({ ...acc, [user.id]: user.user_name }), {});
//     },
//     enabled: channels.length > 0,
//     staleTime: 5 * 60 * 1000,
//   });

//   // Fetch unread counts
//   const { data: unreadCounts = {} } = useQuery({
//     queryKey: ['unreadCounts', session?.user?.id, channelId, isPrivate],
//     queryFn: async () => {
//       if (!session?.user?.id) return {};

//       let channelIds = [];
//       if (isPrivate) {
//         const { data: channelData } = await supabase
//           .from('channels')
//           .select('id')
//           .eq('is_public', false);
//         channelIds = channelData.map(ch => ch.id);
//       } else {
//         channelIds = [channelId].filter(Boolean);
//       }

//       const { data, error } = await supabase.rpc('get_unread_counts', { user_id: session.user.id });
//       if (error) throw error;

//       return data
//         .filter(row => channelIds.includes(row.channel_id))
//         .reduce((acc, row) => ({ ...acc, [row.channel_id]: row.unread_count }), {});
//     },
//     enabled: !!session?.user?.id,
//     staleTime: 5 * 60 * 1000,
//     onSuccess: (data) => {
//       const totalUnread = Object.values(data).reduce((sum, count) => sum + count, 0);
//       if (onUnreadCountChange && activeChannel) {
//         if (isPrivate) {
//           onUnreadCountChange(data[activeChannel.id] || 0, activeChannel.id);
//         } else if (!isPrivate && channelId) {
//           onUnreadCountChange(data[channelId] || 0, channelId);
//         }
//       }
//     },
//   });

//   // Active channel
//   const activeChannel = isPrivate
//     ? channels.find(c => c.id === channelId) || channels[0]
//     : channels.find(c => c.id === channelId);

//   useEffect(() => {
//     if (activeChannel) {
//       console.log('Active channel:', activeChannel);
//       if (onChannelChange) {
//         onChannelChange(activeChannel);
//       }
//     } else {
//       console.log('No active channel selected', { channels, channelId, isPrivate });
//     }
//   }, [activeChannel, onChannelChange]);

//   // Mutations
//   const addChannelMutation = useMutation({
//     mutationFn: async () => {
//       const { error } = await supabase.from('channels').insert([{
//         slug: isPrivate ? 'Private' : newChannelSlug,
//         created_by: session?.user?.id,
//         organization_id: session?.user?.organization?.id,
//         is_inbox: isPrivate,
//       }]);
//       if (error) throw error;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries(['channels']);
//       setNewChannelSlug('');
//       setIsModalVisible(false);
//       message.success('Channel created successfully!');
//     },
//     onError: () => message.error('Failed to create channel.'),
//   });

//   const deleteChannelMutation = useMutation({
//     mutationFn: async (channelId) => {
//       const { error } = await supabase.from('channels').delete().eq('id', channelId);
//       if (error) throw error;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries(['channels']);
//       message.success('Channel deleted successfully!');
//     },
//     onError: () => message.error('Failed to delete channel.'),
//   });

//   const approveJoinRequestMutation = useMutation({
//     mutationFn: async ({ channelId, userId }) => {
//       const targetChannel = channels.find(c => c.id === channelId);
//       const newJoinRequests = targetChannel.join_requests.filter(id => id !== userId);

//       await supabase.from('channels').update({ join_requests: newJoinRequests }).eq('id', channelId);

//       const { data: user } = await supabase
//         .from('users')
//         .select('subscriptions')
//         .eq('id', userId)
//         .single();

//       const newSubscriptions = {
//         ...user?.subscriptions,
//         channels: [...(user?.subscriptions?.channels || []), channelId],
//       };

//       await supabase.from('users').update({ subscriptions: newSubscriptions }).eq('id', userId);
//     },
//     onMutate: async ({ channelId, userId }) => {
//       await queryClient.cancelQueries(['channels']);
//       const previousChannels = queryClient.getQueryData(['channels', isPrivate]);
//       queryClient.setQueryData(['channels', isPrivate], (old) =>
//         old.map((ch) =>
//           ch.id === channelId
//             ? { ...ch, join_requests: ch.join_requests.filter((id) => id !== userId) }
//             : ch
//         )
//       );
//       return { previousChannels };
//     },
//     onError: (err, variables, context) => {
//       queryClient.setQueryData(['channels', isPrivate], context.previousChannels);
//       message.error('Failed to approve join request.');
//     },
//     onSuccess: (_, { userId }) => {
//       queryClient.invalidateQueries(['channels']);
//       notification.success({ message: `${userNames[userId] || 'User'}'s join request approved!` });
//     },
//   });

//   const unsubscribeMutation = useMutation({
//     mutationFn: async (channelId) => {
//       const { data: user } = await supabase
//         .from('users')
//         .select('subscriptions')
//         .eq('id', session.user.id)
//         .single();

//       const updatedChannels = user?.subscriptions?.channels?.filter(id => id !== channelId) || [];
//       const newSubscriptions = {
//         ...user?.subscriptions,
//         channels: updatedChannels,
//       };

//       await supabase
//         .from('users')
//         .update({ subscriptions: newSubscriptions })
//         .eq('id', session.user.id);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries(['channels']);
//       message.success('Unsubscribed from channel successfully!');
//       window.location.reload();
//     },
//     onError: () => message.error('Failed to unsubscribe from channel.'),
//   });

//   const handleJoinRequest = async (channelId) => {
//     const targetChannel = channels.find(c => c.id === channelId);
//     const { error } = await supabase
//       .from('channels')
//       .update({
//         join_requests: [...(targetChannel.join_requests || []), session.user.id],
//       })
//       .eq('id', channelId);

//     if (error) {
//       message.error('Failed to request to join channel.');
//     } else {
//       message.success('Join request sent!');
//       queryClient.invalidateQueries(['channels']);
//     }
//   };

//   const renderChannelContent = (targetChannel) => {
//     if (!targetChannel) {
//       return <div>No channel selected.</div>;
//     }

//     console.log('Rendering channel content:', {
//       targetChannel,
//       isSubscribed: session?.user?.subscriptions?.channels?.includes(targetChannel.id),
//       isCreator: session.user.id === targetChannel.created_by,
//       isAdmin: session.user.role_type === 'superadmin' || session.user.role_type === 'admin',
//     });

//     const isSubscribed = session?.user?.subscriptions?.channels?.includes(targetChannel.id);
//     const isAuthorized =
//       isSubscribed ||
//       session.user.id === targetChannel.created_by ||
//       session.user.role_type === 'superadmin' ||
//       session.user.role_type === 'admin';

//     if (isAuthorized) {
//       return (
//         <ForumComment
//           channel_id={targetChannel.id}
//           isPrivate={!targetChannel.is_public}
//           searchText={searchText}
//           setSearchText={setSearchText}
//           setDrawerVisible={setDrawerVisible}
//           setEditingMessage={setEditingMessage}
//           drawerVisible={drawerVisible}
//           editingMessage={editingMessage}
//         />
//       );
//     } else if ((targetChannel?.join_requests || []).includes(session.user.id)) {
//       return <div>Requested to Join</div>;
//     } else {
//       return <Button onClick={() => handleJoinRequest(targetChannel.id)}>Request to Join</Button>;
//     }
//   };

//   const renderMenu = () => (
//     <Menu
//       selectedKeys={activeChannel ? [activeChannel.slug] : []}
//       mode="vertical"
//       onClick={({ key }) => {
//         const selectedChannel = channels.find(c => c.slug === key);
//         if (selectedChannel) {
//           queryClient.setQueryData(['channels', isPrivate], (old) => old);
//           if (onChannelChange) {
//             onChannelChange(selectedChannel);
//           }
//           setIsChannelsDrawerVisible(false);
//         }
//       }}
//       style={{ width: '100%', border: 'none' }}
//     >
//       {channels?.map(channel => (
//         <Menu.Item key={channel.slug}>
//           <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             {channel.slug}
//             {unreadCounts[channel.id] > 0 && (
//               <span style={{ color: 'red', marginLeft: 8 }}>({unreadCounts[channel.id]})</span>
//             )}
//             {(session.user.id === channel.created_by || session?.user?.role_type === 'superadmin' || session?.user?.role_type === 'admin') && (
//               <Popconfirm
//                 title={`Are you sure to delete ${channel.slug}?`}
//                 onConfirm={() => deleteChannelMutation.mutate(channel.id)}
//                 okText="Yes"
//                 cancelText="No"
//               >
//                 <CloseOutlined style={{ color: 'red', cursor: 'pointer' }} />
//               </Popconfirm>
//             )}
//             {channel.join_requests?.length > 0 &&
//               (session.user.id === channel.created_by || session?.user?.role_type === 'superadmin' || session?.user?.role_type === 'admin') && (
//                 <Button
//                   size="small"
//                   onClick={() => {
//                     Modal.info({
//                       title: 'Join Requests',
//                       content: (
//                         <div>
//                           {channel.join_requests.map(userId => (
//                             <div key={userId} style={{ marginBottom: 8 }}>
//                               <Button onClick={() => approveJoinRequestMutation.mutate({ channelId: channel.id, userId })}>
//                                 Approve
//                               </Button>{' '}
//                               For {userNames[userId] || 'Unknown User'}
//                             </div>
//                           ))}
//                         </div>
//                       ),
//                     });
//                   }}
//                 >
//                   View Requests
//                 </Button>
//               )}
//           </span>
//         </Menu.Item>
//       ))}
//       {(session?.user?.role_type === 'superadmin' || session?.user?.role_type === 'admin') && (
//         <Button
//           type="primary"
//           icon={<PlusOutlined />}
//           onClick={() => setIsModalVisible(true)}
//           style={{ marginTop: 16, width: '100%' }}
//         >
//           Add Channel
//         </Button>
//       )}
//     </Menu>
//   );

//   return (
//     <div style={{ padding: 0 }}>
//       <Card style={{ width: '100%' }}>
//         <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
//           {!isPrivate && !isDesktop && session?.user?.features?.feature?.channels && (
//             <Button
//               type="primary"
//               className="fab-button"
//               shape="circle"
//               icon={<PlusOutlined />}
//               onClick={() => {
//                 setEditingMessage(null);
//                 setDrawerVisible(true);
//               }}
//             />
//           )}
//         </div>

//         <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', width: '100%' }}>
//           <Input
//             placeholder="Search by user name, message or tag"
//             value={searchText}
//             onChange={e => setSearchText(e.target.value)}
//             style={{ flex: 1, minWidth: isDesktop ? '48%' : '48%' }}
//           />
//           {activeChannel?.is_inbox && ( // Changed from isPrivate to activeChannel?.is_inbox
//             <Button
//               type="primary"
//               onClick={() => navigate(`${APP_PREFIX_PATH}/members`)}
//               style={{ flex: 1, minWidth: isDesktop ? '40%' : '24%' }}
//             >
//               Members
//             </Button>
//           )}
//           {!isPrivate && isDesktop && session?.user?.features?.feature?.channels && (
//             <Button
//               type="primary"
//               onClick={() => {
//                 setEditingMessage(null);
//                 setDrawerVisible(true);
//               }}
//               style={{ flex: 1, minWidth: '8%' }}
//             >
//               Add Post
//             </Button>
//           )}
//           {session?.user?.subscriptions?.channels?.includes(activeChannel?.id) && (
//             <Button
//               type="default"
//               onClick={() => unsubscribeMutation.mutate(activeChannel?.id)}
//               style={{ flex: 1, minWidth: '24%' }}
//             >
//               Unsubscribe
//             </Button>
//           )}
//         </div>

//         {activeChannel?.join_requests?.length > 0 &&
//           (session?.user?.id === activeChannel.created_by || session?.user?.role_type === 'superadmin' || session?.user?.role_type === 'admin') && (
//             <Button
//               type="primary"
//               size="small"
//               onClick={() => {
//                 Modal.info({
//                   key: activeChannel?.id,
//                   title: 'Join Requests',
//                   content: (
//                     <div>
//                       {activeChannel?.join_requests?.map(userId => (
//                         <div key={userId} style={{ marginBottom: 8 }}>
//                           <Button onClick={() => approveJoinRequestMutation.mutate({ channelId: activeChannel.id, userId })}>
//                             Approve
//                           </Button>{' '}
//                           For {userNames[userId] || 'Unknown User'}
//                         </div>
//                       ))}
//                     </div>
//                   ),
//                 });
//               }}
//             >
//               View Requests
//             </Button>
//           )}

//         {isPrivate && (
//           <Drawer
//             title="Channels"
//             placement="right"
//             onClose={() => setIsChannelsDrawerVisible(false)}
//             visible={isChannelsDrawerVisible}
//             width={isDesktop ? 300 : '80%'}
//           >
//             {renderMenu()}
//           </Drawer>
//         )}

//         <Drawer
//           title="New Message"
//           placement="bottom"
//           height="100%"
//           onClose={() => setIsMessageDrawerVisible(false)}
//           visible={isMessageDrawerVisible}
//           bodyStyle={{ padding: 0 }}
//         >
//           <PostMessage
//             user_id={session?.user?.id}
//             receiver_user_id={null}
//             closeModal={() => setIsMessageDrawerVisible(false)}
//           />
//         </Drawer>

//         {activeChannel && renderChannelContent(activeChannel)}

//         {!isPrivate && (session?.user?.role_type === 'superadmin' || session?.user?.role_type === 'admin') && (
//           <Modal
//             title="Add New Channel"
//             visible={isModalVisible}
//             onOk={() => addChannelMutation.mutate()}
//             onCancel={() => setIsModalVisible(false)}
//           >
//             <Input
//               placeholder="New channel slug"
//               value={newChannelSlug}
//               onChange={e => setNewChannelSlug(e.target.value)}
//             />
//           </Modal>
//         )}
//       </Card>
//     </div>
//   );
// };

// Channels.propTypes = {
//   channelId: PropTypes.string,
//   isPrivate: PropTypes.bool,
//   onChannelChange: PropTypes.func,
//   onUnreadCountChange: PropTypes.func,
// };

// Channels.defaultProps = {
//   channelId: '',
//   isPrivate: false,
//   onChannelChange: () => {},
//   onUnreadCountChange: () => {},
// };

// export default React.memo(Channels);




import React, { useState, useEffect } from 'react';
import { Drawer, Menu, Input, Button, message, Card, Modal, Popconfirm, notification } from 'antd';
import { CloseOutlined, PlusOutlined, MenuOutlined } from '@ant-design/icons';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';
import ForumComment from './Comments';
import PostMessage from './PostMessage';
import { useNavigate } from 'react-router-dom';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import PropTypes from 'prop-types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(window.matchMedia(query).matches);

  React.useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    media.addListener(listener);
    return () => media.removeListener(listener);
  }, [query]);

  return matches;
};

const Channels = ({ channelId, isPrivate = false, onChannelChange, onUnreadCountChange }) => {
  const { session } = useSelector((state) => state.auth);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [searchText, setSearchText] = useState('');
  const [editingMessage, setEditingMessage] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isChannelsDrawerVisible, setIsChannelsDrawerVisible] = useState(false);
  const [isMessageDrawerVisible, setIsMessageDrawerVisible] = useState(false);
  const [newChannelSlug, setNewChannelSlug] = useState('');

  // Fetch channels
  const { data: channels = [] } = useQuery({
    queryKey: ['channels', isPrivate, channelId],
    queryFn: async () => {
      const query = supabase
        .from('channels')
        .select('*')
        .order('inserted_at', { ascending: true });

      if (isPrivate) {
        query.eq('is_public', false); // Fetch private channels
      } else if (channelId) {
        query.eq('id', channelId); // Fetch specific public channel
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch user names
  const { data: userNames = {} } = useQuery({
    queryKey: ['userNames', channels],
    queryFn: async () => {
      const userIds = [...new Set(channels.flatMap(ch => ch.join_requests || []))];
      if (userIds.length === 0) return {};

      const { data, error } = await supabase
        .from('users')
        .select('id, user_name')
        .in('id', userIds);

      if (error) throw error;
      return data.reduce((acc, user) => ({ ...acc, [user.id]: user.user_name }), {});
    },
    enabled: channels.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch unread counts
  const { data: unreadCounts = {} } = useQuery({
    queryKey: ['unreadCounts', session?.user?.id, channelId, isPrivate],
    queryFn: async () => {
      if (!session?.user?.id) return {};

      let channelIds = [];
      if (isPrivate) {
        const { data: channelData } = await supabase
          .from('channels')
          .select('id')
          .eq('is_public', false);
        channelIds = channelData.map(ch => ch.id);
      } else {
        channelIds = [channelId].filter(Boolean);
      }

      const { data, error } = await supabase.rpc('get_unread_counts', { user_id: session.user.id });
      if (error) throw error;

      return data
        .filter(row => channelIds.includes(row.channel_id))
        .reduce((acc, row) => ({ ...acc, [row.channel_id]: row.unread_count }), {});
    },
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000,
    onSuccess: (data) => {
      const totalUnread = Object.values(data).reduce((sum, count) => sum + count, 0);
      if (onUnreadCountChange && activeChannel) {
        if (isPrivate) {
          onUnreadCountChange(data[activeChannel.id] || 0, activeChannel.id);
        } else if (!isPrivate && channelId) {
          onUnreadCountChange(data[channelId] || 0, channelId);
        }
      }
    },
  });

  // Active channel
  const activeChannel = isPrivate
    ? channels.find(c => c.id === channelId) || channels[0]
    : channels.find(c => c.id === channelId);

  useEffect(() => {
    if (activeChannel) {
      console.log('Active channel:', activeChannel);
      if (onChannelChange) {
        onChannelChange(activeChannel);
      }
    } else {
      console.log('No active channel selected', { channels, channelId, isPrivate });
    }
  }, [activeChannel, onChannelChange]);

  // Mutations
  const addChannelMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('channels').insert([{
        slug: isPrivate ? 'Private' : newChannelSlug,
        created_by: session?.user?.id,
        organization_id: session?.user?.organization?.id,
        is_inbox: isPrivate,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['channels']);
      setNewChannelSlug('');
      setIsModalVisible(false);
      message.success('Channel created successfully!');
    },
    onError: () => message.error('Failed to create channel.'),
  });

  const deleteChannelMutation = useMutation({
    mutationFn: async (channelId) => {
      const { error } = await supabase.from('channels').delete().eq('id', channelId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['channels']);
      message.success('Channel deleted successfully!');
    },
    onError: () => message.error('Failed to delete channel.'),
  });

  const approveJoinRequestMutation = useMutation({
    mutationFn: async ({ channelId, userId }) => {
      const targetChannel = channels.find(c => c.id === channelId);
      const newJoinRequests = targetChannel.join_requests.filter(id => id !== userId);

      await supabase.from('channels').update({ join_requests: newJoinRequests }).eq('id', channelId);

      const { data: user } = await supabase
        .from('users')
        .select('subscriptions')
        .eq('id', userId)
        .single();

      const newSubscriptions = {
        ...user?.subscriptions,
        channels: [...(user?.subscriptions?.channels || []), channelId],
      };

      await supabase.from('users').update({ subscriptions: newSubscriptions }).eq('id', userId);
    },
    onMutate: async ({ channelId, userId }) => {
      await queryClient.cancelQueries(['channels']);
      const previousChannels = queryClient.getQueryData(['channels', isPrivate]);
      queryClient.setQueryData(['channels', isPrivate], (old) =>
        old.map((ch) =>
          ch.id === channelId
            ? { ...ch, join_requests: ch.join_requests.filter((id) => id !== userId) }
            : ch
        )
      );
      return { previousChannels };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['channels', isPrivate], context.previousChannels);
      message.error('Failed to approve join request.');
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries(['channels']);
      notification.success({ message: `${userNames[userId] || 'User'}'s join request approved!` });
    },
  });

  const unsubscribeMutation = useMutation({
    mutationFn: async (channelId) => {
      const { data: user } = await supabase
        .from('users')
        .select('subscriptions')
        .eq('id', session.user.id)
        .single();

      const updatedChannels = user?.subscriptions?.channels?.filter(id => id !== channelId) || [];
      const newSubscriptions = {
        ...user?.subscriptions,
        channels: updatedChannels,
      };

      await supabase
        .from('users')
        .update({ subscriptions: newSubscriptions })
        .eq('id', session.user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['channels']);
      message.success('Unsubscribed from channel successfully!');
      window.location.reload();
    },
    onError: () => message.error('Failed to unsubscribe from channel.'),
  });

  const handleJoinRequest = async (channelId) => {
    const targetChannel = channels.find(c => c.id === channelId);
    const { error } = await supabase
      .from('channels')
      .update({
        join_requests: [...(targetChannel.join_requests || []), session.user.id],
      })
      .eq('id', channelId);

    if (error) {
      message.error('Failed to request to join channel.');
    } else {
      message.success('Join request sent!');
      queryClient.invalidateQueries(['channels']);
    }
  };

  const renderChannelContent = (targetChannel) => {
    if (!targetChannel) {
      return <div>No channel selected.</div>;
    }

    console.log('Rendering channel content:', {
      targetChannel,
      isSubscribed: session?.user?.subscriptions?.channels?.includes(targetChannel.id),
      isCreator: session.user.id === targetChannel.created_by,
      isAdmin: session.user.role_type === 'superadmin' || session.user.role_type === 'admin',
    });

    const isSubscribed = session?.user?.subscriptions?.channels?.includes(targetChannel.id);
    const isAuthorized =
      isSubscribed || !isPrivate ||
      session.user.id === targetChannel.created_by ||
      session.user.role_type === 'superadmin' ||
      session.user.role_type === 'admin';

    if (isAuthorized) {
      return (
        <ForumComment
          channel_id={targetChannel.id}
          isPrivate={!targetChannel.is_public}
          isInbox={targetChannel.is_inbox} // Added isInbox prop
          searchText={searchText}
          setSearchText={setSearchText}
          setDrawerVisible={setDrawerVisible}
          setEditingMessage={setEditingMessage}
          drawerVisible={drawerVisible}
          editingMessage={editingMessage}
        />
      );
    } else if ((targetChannel?.join_requests || []).includes(session.user.id)) {
      return <div>Requested to Join</div>;
    } else {
      return <Button onClick={() => handleJoinRequest(targetChannel.id)}>Request to Join</Button>;
    }
  };

  const renderMenu = () => (
    <Menu
      selectedKeys={activeChannel ? [activeChannel.slug] : []}
      mode="vertical"
      onClick={({ key }) => {
        const selectedChannel = channels.find(c => c.slug === key);
        if (selectedChannel) {
          queryClient.setQueryData(['channels', isPrivate], (old) => old);
          if (onChannelChange) {
            onChannelChange(selectedChannel);
          }
          setIsChannelsDrawerVisible(false);
        }
      }}
      style={{ width: '100%', border: 'none' }}
    >
      {channels?.map(channel => (
        <Menu.Item key={channel.slug}>
          <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {channel.slug}
            {unreadCounts[channel.id] > 0 && (
              <span style={{ color: 'red', marginLeft: 8 }}>({unreadCounts[channel.id]})</span>
            )}
            {(session.user.id === channel.created_by || session?.user?.role_type === 'superadmin' || session?.user?.role_type === 'admin') && (
              <Popconfirm
                title={`Are you sure to delete ${channel.slug}?`}
                onConfirm={() => deleteChannelMutation.mutate(channel.id)}
                okText="Yes"
                cancelText="No"
              >
                <CloseOutlined style={{ color: 'red', cursor: 'pointer' }} />
              </Popconfirm>
            )}
            {channel.join_requests?.length > 0 &&
              (session.user.id === channel.created_by || session?.user?.role_type === 'superadmin' || session?.user?.role_type === 'admin') && (
                <Button
                  size="small"
                  onClick={() => {
                    Modal.info({
                      title: 'Join Requests',
                      content: (
                        <div>
                          {channel.join_requests.map(userId => (
                            <div key={userId} style={{ marginBottom: 8 }}>
                              <Button onClick={() => approveJoinRequestMutation.mutate({ channelId: channel.id, userId })}>
                                Approve
                              </Button>{' '}
                              For {userNames[userId] || 'Unknown User'}
                            </div>
                          ))}
                        </div>
                      ),
                    });
                  }}
                >
                  View Requests
                </Button>
              )}
          </span>
        </Menu.Item>
      ))}
      {(session?.user?.role_type === 'superadmin' || session?.user?.role_type === 'admin') && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
          style={{ marginTop: 16, width: '100%' }}
        >
          Add Channel
        </Button>
      )}
    </Menu>
  );

  return (
    <div style={{ padding: 0 }}>
      <Card style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
          {!isPrivate && !isDesktop && session?.user?.features?.feature?.channels && (
            <Button
              type="primary"
              className="fab-button"
              shape="circle"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingMessage(null);
                setDrawerVisible(true);
              }}
            />
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', width: '100%' }}>
          <Input
            placeholder="Search by user name, message or tag"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ flex: 1, minWidth: isDesktop ? '48%' : '48%' }}
          />
          {activeChannel?.is_inbox && (
            <Button
              type="primary"
              onClick={() => navigate(`${APP_PREFIX_PATH}/members`)}
              style={{ flex: 1, minWidth: isDesktop ? '40%' : '24%' }}
            >
              Members
            </Button>
          )}
          {!isPrivate && isDesktop && session?.user?.features?.feature?.channels && (
            <Button
              type="primary"
              onClick={() => {
                setEditingMessage(null);
                setDrawerVisible(true);
              }}
              style={{ flex: 1, minWidth: '8%' }}
            >
              Add Post
            </Button>
          )}
          {session?.user?.subscriptions?.channels?.includes(activeChannel?.id) && (
            <Button
              type="default"
              onClick={() => unsubscribeMutation.mutate(activeChannel?.id)}
              style={{ flex: 1, minWidth: '24%' }}
            >
              Unsubscribe
            </Button>
          )}
        </div>

        {activeChannel?.join_requests?.length > 0 &&
          (session?.user?.id === activeChannel.created_by || session?.user?.role_type === 'superadmin' || session?.user?.role_type === 'admin') && (
            <Button
              type="primary"
              size="small"
              onClick={() => {
                Modal.info({
                  key: activeChannel?.id,
                  title: 'Join Requests',
                  content: (
                    <div>
                      {activeChannel?.join_requests?.map(userId => (
                        <div key={userId} style={{ marginBottom: 8 }}>
                          <Button onClick={() => approveJoinRequestMutation.mutate({ channelId: activeChannel.id, userId })}>
                            Approve
                          </Button>{' '}
                          For {userNames[userId] || 'Unknown User'}
                        </div>
                      ))}
                    </div>
                  ),
                });
              }}
            >
              View Requests
            </Button>
          )}

        {isPrivate && (
          <Drawer
            title="Channels"
            placement="right"
            onClose={() => setIsChannelsDrawerVisible(false)}
            visible={isChannelsDrawerVisible}
            width={isDesktop ? 300 : '80%'}
          >
            {renderMenu()}
          </Drawer>
        )}

        <Drawer
          title="New Message"
          placement="bottom"
          height="100%"
          onClose={() => setIsMessageDrawerVisible(false)}
          visible={isMessageDrawerVisible}
          bodyStyle={{ padding: 0 }}
        >
          <PostMessage
            user_id={session?.user?.id}
            receiver_user_id={null}
            closeModal={() => setIsMessageDrawerVisible(false)}
          />
        </Drawer>

        {activeChannel && renderChannelContent(activeChannel)}

        {!isPrivate && (session?.user?.role_type === 'superadmin' || session?.user?.role_type === 'admin') && (
          <Modal
            title="Add New Channel"
            visible={isModalVisible}
            onOk={() => addChannelMutation.mutate()}
            onCancel={() => setIsModalVisible(false)}
          >
            <Input
              placeholder="New channel slug"
              value={newChannelSlug}
              onChange={e => setNewChannelSlug(e.target.value)}
            />
          </Modal>
        )}
      </Card>
    </div>
  );
};

Channels.propTypes = {
  channelId: PropTypes.string,
  isPrivate: PropTypes.bool,
  onChannelChange: PropTypes.func,
  onUnreadCountChange: PropTypes.func,
};

Channels.defaultProps = {
  channelId: '',
  isPrivate: false,
  onChannelChange: () => {},
  onUnreadCountChange: () => {},
};

export default React.memo(Channels);
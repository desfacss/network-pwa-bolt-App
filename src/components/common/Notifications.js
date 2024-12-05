import React, { useState, useEffect } from 'react';
import { Modal, Button, Badge, List } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';

const Notifications = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const { session } = useSelector((state) => state.auth);

    const fetchNotifications = async () => {
        setLoading(true);

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .or(
                `type.eq.public,` +
                `locations.cs.{${session?.user?.location?.id}},` +
                `users.cs.{${session?.user?.id}}`
            )
            // .gte('expiry', new Date().toISOString().split('T')[0]);
            .gte('expiry', new Date().toISOString())
            .lte('start', new Date().toISOString());

        if (error) {
            console.error('Error fetching notifications:', error);
        } else {
            console.log("notifications", data);
            setNotifications(data);
        }

        setLoading(false);
    };

    useEffect(() => {
        if (session) {
            fetchNotifications();
        }
    }, [session]);

    return (
        <>
            <Badge count={notifications.length}>
                <BellOutlined style={{ fontSize: '24px' }} onClick={openModal} />
            </Badge>
            <Modal
                title="Notifications"
                open={isModalOpen}
                onCancel={closeModal}
                footer={null}
            >
                <List
                    loading={loading}
                    dataSource={notifications}
                    renderItem={item => (
                        <List.Item>
                            <List.Item.Meta
                                title={item.title}
                                description={item.message}
                            />
                        </List.Item>
                    )}
                />
            </Modal>
        </>
    );
};

export default Notifications;

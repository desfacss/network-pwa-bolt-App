import React, { useEffect, useState } from 'react';
import { Button } from 'antd';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { supabase } from 'configs/SupabaseConfig'; // Assuming you have Supabase configured
import { APP_PREFIX_PATH } from 'configs/AppConfig'

function LivePollHeaderButton() {
    const { session } = useSelector((state) => state.auth);
    const roleType = session?.user?.role_type;
    const userId = session?.user?.id;
    const navigate = useNavigate();

    const [activeSession, setActiveSession] = useState(null);
    const [isParticipant, setIsParticipant] = useState(false);

    useEffect(() => {
        const fetchActiveSession = async () => {
            const { data, error } = await supabase
                .from('live_sessions')
                .select('*')
                .eq('is_live', true)
                .order('created_at', { ascending: false })
                .limit(1);

            if (error) {
                console.error('Error fetching active session:', error);
            } else if (data && data.length > 0) {
                setActiveSession(data[0]);
                setIsParticipant(data[0].participants?.includes(userId));
            } else {
                setActiveSession(null);
                setIsParticipant(false);
            }
        };

        fetchActiveSession();

        const interval = setInterval(fetchActiveSession, 5000); // Check every 5 seconds
        return () => clearInterval(interval); // Cleanup
    }, [userId]);

    const handleClick = () => {
        navigate(`${APP_PREFIX_PATH}/live`);
    };

    if (roleType === 'admin' || roleType === 'superadmin') {
        return (
            <Button onClick={handleClick} style={{ marginTop: '4px' }}>
                Start Live Poll
            </Button>
        );
    } else if (activeSession) {
        return (
            <Button onClick={handleClick} style={{ marginTop: '4px' }}>
                Join Session
            </Button>
        );
    } else {
        return null; // Don't show the button if no active session or already participant
    }
}

export default LivePollHeaderButton;
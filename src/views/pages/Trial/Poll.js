import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';

function LivePoll() {
    const [sessionId, setSessionId] = useState('');
    const [currentSlide, setCurrentSlide] = useState(1);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isParticipant, setIsParticipant] = useState(false);
    const [activeSession, setActiveSession] = useState(null);

    const { session } = useSelector((state) => state.auth);
    const userId = session?.user?.id;
    const roleType = session?.user?.role_type;

    // Real-time channel subscription
    useEffect(() => {
        console.log("Setting up channel subscription for user:", userId);
        const channel = supabase.channel('poll-room', { debug: true });
        channel
            .on('broadcast', { event: 'move' }, ({ payload }) => {
                console.log("Slide move received:", payload);
                setCurrentSlide(payload?.slide);
            })
            .on('broadcast', { event: 'session_started' }, ({ payload }) => {
                console.log("Session started received:", payload);
                setActiveSession({ id: payload.sessionId, admin_id: payload.adminId, is_live: true });
                setSessionId(payload.sessionId);
                setIsAdmin(userId === payload.adminId);
                if (userId === payload.adminId) setIsParticipant(true);
            })
            .on('broadcast', { event: 'session_ended' }, () => {
                console.log("Session ended received for user:", userId);
                setActiveSession(null);
                setSessionId('');
                setIsAdmin(false);
                setIsParticipant(false);
                setCurrentSlide(1);
            })
            .subscribe((status) => {
                console.log("Channel subscription status for user", userId, ":", status);
                if (status === 'SUBSCRIBED') {
                    console.log("Successfully subscribed to poll-room for user:", userId);
                } else if (status === 'CLOSED' || status === 'ERROR') {
                    console.error("Channel subscription failed for user:", userId, "Status:", status);
                }
            });

        return () => {
            console.log("Cleaning up channel for user:", userId);
            supabase.removeChannel(channel);
        };
    }, [userId]);

    // Fetch active session on mount and periodically check
    useEffect(() => {
        const fetchActiveSession = async () => {
            const { data, error } = await supabase
                .from('live_sessions')
                .select('*')
                .eq('is_live', true)
                .order('created_at', { ascending: false })
                .limit(1);

            if (error) {
                console.error("Error fetching active session:", error);
            } else if (data && data.length > 0) {
                console.log("Fetched active session:", data[0]);
                setActiveSession(data[0]);
                setSessionId(data[0].id);
                setIsAdmin(userId === data[0].admin_id);
                setIsParticipant(data[0].participants?.includes(userId));
            } else {
                console.log("No active session found");
                setActiveSession(null);
                setSessionId('');
                setIsAdmin(false);
                setIsParticipant(false);
            }
        };

        fetchActiveSession();

        // Fallback: Poll every 5 seconds to ensure state sync
        const interval = setInterval(fetchActiveSession, 5000);
        return () => clearInterval(interval);
    }, [userId]);

    const startPoll = async () => {
        const { data, error } = await supabase
            .from('live_sessions')
            .insert([{ admin_id: userId, participants: [userId], is_live: true }])
            .select();
        if (error) {
            console.error("Error starting poll:", error);
            return;
        }
        console.log("Poll started with session:", data[0]);
        setSessionId(data[0]?.id);
        setActiveSession(data[0]);
        setIsAdmin(true);
        setIsParticipant(true);
        const { error: broadcastError } = await supabase.channel('poll-room').send({
            type: 'broadcast',
            event: 'session_started',
            payload: { sessionId: data[0]?.id, adminId: userId }
        });
        if (broadcastError) console.error("Error sending session_started broadcast:", broadcastError);
    };

    const endPoll = async () => {
        const { error } = await supabase
            .from('live_sessions')
            .update({ is_live: false })
            .eq('id', sessionId);
        if (error) {
            console.error("Error ending session:", error);
            return;
        }
        console.log("Session ended by admin:", userId);
        const { error: broadcastError } = await supabase.channel('poll-room').send({
            type: 'broadcast',
            event: 'session_ended'
        });
        if (broadcastError) console.error("Error sending session_ended broadcast:", broadcastError);
        setActiveSession(null);
        setSessionId('');
        setIsAdmin(false);
        setIsParticipant(false);
        setCurrentSlide(1);
    };

    const joinSession = async () => {
        if (activeSession) {
            const { error } = await supabase.rpc('join_session', { session_id: activeSession.id, participant_id: userId });
            if (error) {
                console.error("Error joining session:", error);
            } else {
                console.log("Joined session as participant:", userId);
                setIsParticipant(true);
                setActiveSession((prev) => ({
                    ...prev,
                    participants: [...(prev.participants || []), userId],
                }));
            }
        }
    };

    const exitSession = async () => {
        if (activeSession) {
            const { error } = await supabase.rpc('exit_session', { session_id: activeSession.id, participant_id: userId });
            if (error) {
                console.error("Error exiting session:", error);
            } else {
                console.log("Exited session:", userId);
                setIsParticipant(false);
                setActiveSession((prev) => ({
                    ...prev,
                    participants: (prev.participants || []).filter((id) => id !== userId),
                }));
            }
        }
    };

    const moveSlide = (direction) => {
        const newSlide = direction === 'next' ? Math.min(currentSlide + 1, 3) : Math.max(currentSlide - 1, 1);
        setCurrentSlide(newSlide);
        supabase.channel('poll-room').send({
            type: 'broadcast',
            event: 'move',
            payload: { slide: newSlide }
        });
    };

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            {(roleType === 'admin' || roleType === 'superadmin') ? (
                !activeSession ? (
                    <Button onClick={startPoll}>Start Live Poll</Button>
                ) : isAdmin ? (
                    <Button onClick={endPoll}>End Live Poll</Button>
                ) : null
            ) : activeSession ? (
                isParticipant ? (
                    <Button onClick={exitSession}>Exit Session</Button>
                ) : (
                    <Button onClick={joinSession}>Join Session</Button>
                )
            ) : (
                <p>No active sessions.</p>
            )}

            {activeSession && isParticipant ? (
                <>
                    {(roleType === 'admin' || roleType === 'superadmin') && isAdmin ? (
                        <>
                            <h2>Current Slide: {currentSlide}</h2>
                            <div>
                                <Button onClick={() => moveSlide('prev')} disabled={currentSlide === 1}>Prev</Button>
                                <Button onClick={() => moveSlide('next')} disabled={currentSlide === 3}>Next</Button>
                            </div>
                        </>
                    ) : (
                        <div style={{ fontSize: '48px', margin: '20px 0' }}>
                            Slide {currentSlide}
                        </div>
                    )}
                </>
            ) : (
                (roleType === 'admin' || roleType === 'superadmin') ? (
                    !activeSession && <p>No active sessions yet. Start one!</p>
                ) : (
                    !activeSession && <p>No active sessions.</p>
                )
            )}
        </div>
    );
}

export default LivePoll;
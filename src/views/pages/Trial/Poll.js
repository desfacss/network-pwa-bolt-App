import React, { useState, useEffect } from 'react';
import { Button, Input } from 'antd';
import { supabase } from 'api/supabaseClient';
import { useSelector } from 'react-redux';

function LivePoll() {
    const [sessionId, setSessionId] = useState('');
    const [currentSlide, setCurrentSlide] = useState(1);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isParticipant, setIsParticipant] = useState(false);
    const [activeSession, setActiveSession] = useState(null); // Store the active session data

    const { session } = useSelector((state) => state.auth);

    const userId = session?.user?.id
    const roleType = session?.user?.role_type;

    useEffect(() => {
        const channel = supabase.channel('poll-room');
        channel
            .on('broadcast', { event: 'move' }, ({ payload }) => {
                setCurrentSlide(payload?.slide);
            })
            .on('broadcast', { event: 'session_ended' }, () => {
                setActiveSession(null);
                setSessionId('');
                setIsAdmin(false);
                setIsParticipant(false);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        // Fetch active session on mount and whenever the component updates.
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
                setActiveSession(data[0]);
                setSessionId(data[0].id);
                setIsAdmin(userId === data[0].admin_id);
            } else {
                setActiveSession(null);
                setSessionId('');
            }
        };

        fetchActiveSession();
    }, []); // Empty dependency array ensures this runs only on mount and update


    const startPoll = async () => {
        const { data } = await supabase.from('live_sessions').insert([{ admin_id: userId, participants: [userId], is_live: true }]).select();
        setSessionId(data[0]?.id);
        setActiveSession(data[0]); // Update activeSession state
        setIsAdmin(true);
        setIsParticipant(true); // Admin is also a participant
        supabase.channel('poll-room').send({
            type: 'broadcast',
            event: 'start',
            payload: { sessionId: data[0]?.id }
        });
    };

    const endPoll = async () => {
        const { error } = await supabase
            .from('live_sessions')
            .update({ is_live: false })
            .eq('id', sessionId);
        if (error) {
            console.error("Error ending session:", error)
        }
        supabase.channel('poll-room').send({
            type: 'broadcast',
            event: 'session_ended',
        });
        // Directly update the state after successful end poll
        setActiveSession(null);
        setSessionId('');
        setIsAdmin(false);
        setIsParticipant(false);
    };

    const joinSession = async () => {
        if (activeSession) { // Use activeSession from state
            const { error } = await supabase.rpc('join_session', { session_id: activeSession.id, participant_id: userId });
            if (error) {
                console.error("Error joining session:", error);
            } else {
                console.log("Joined session as participant");
                setIsParticipant(true);
            }
        }
    };

    const exitSession = async () => {
        const { error } = await supabase.rpc('exit_session', { session_id: sessionId, participant_id: userId }); // Assuming you have an exit_session RPC
        if (error) {
            console.error("Error exiting session:", error);
        } else {
            console.log("Exited session");
            setIsParticipant(false);
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

    // ... (rest of the component code for moveSlide, return, etc.)

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            {roleType === 'admin' ? ( // Conditionally render based on role
                !activeSession ? (
                    <Button onClick={startPoll}>Start Live Poll</Button>
                ) : isAdmin ? ( // Check isAdmin explicitly
                    <Button onClick={endPoll}>End Live Poll</Button>
                ) : null // Don't show a button if admin but not the one who started the session
            ) : activeSession ? (
                <Button onClick={exitSession}>Exit Session</Button>
            ) : (
                <Button onClick={joinSession}>Join Session</Button>
            )}

            {activeSession ? (
                <>
                    {roleType === 'admin' ?
                        <>
                            <h2>Current Slide: {currentSlide}</h2>
                            {isAdmin && (
                                <div>
                                    <Button onClick={() => moveSlide('prev')} disabled={currentSlide === 1}>Prev</Button>
                                    <Button onClick={() => moveSlide('next')} disabled={currentSlide === 3}>Next</Button>
                                </div>
                            )}
                        </>
                        :
                        <div style={{ fontSize: '48px', margin: '20px 0' }}>
                            Slide {currentSlide}
                        </div>
                    }
                    {/* <Input value={sessionId} readOnly style={{ marginTop: '20px' }} /> */}
                </>
            ) :
                roleType === 'admin' ? <p>No active sessions yet. Start one!</p>
                    : roleType !== 'admin' && <p>No active sessions.</p>
            }
        </div>
    );
}

export default LivePoll;
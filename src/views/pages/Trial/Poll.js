import React, { useState, useEffect } from 'react';
import { Button, Input } from 'antd';
import { createClient } from '@supabase/supabase-js';
import { supabase } from 'api/supabaseClient';


function LivePoll() {
    const [sessionId, setSessionId] = useState('');
    const [currentSlide, setCurrentSlide] = useState(1);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userId, setUserId] = useState(Math.random().toString(36).substring(7)); // Simulated user ID

    useEffect(() => {
        const channel = supabase.channel('poll-room');
        channel
            .on('broadcast', { event: 'move' }, ({ payload }) => {
                setCurrentSlide(payload.slide);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const startPoll = async () => {
        const { data } = await supabase.from('live_sessions').insert([{ admin_id: userId, participants: [userId] }]).select();
        setSessionId(data[0].id);
        setIsAdmin(true);
        supabase.channel('poll-room').send({
            type: 'broadcast',
            event: 'start',
            payload: { sessionId: data[0].id }
        });
    };

    const joinSession = async () => {
        if (sessionId) {
            const { data, error } = await supabase.rpc('join_session', { session_id: sessionId, participant_id: userId });
            if (error) {
                console.error("Error joining session:", error);
            } else {
                console.log("Joined session as participant");
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
            {!sessionId ? (
                <>
                    <Button onClick={startPoll}>Start Live Poll</Button>
                    <Input onChange={(e) => setSessionId(e.target.value)} placeholder="Enter session ID to join" />
                    <Button onClick={joinSession} disabled={!sessionId}>Join Session</Button>
                </>
            ) : (
                <>
                    <h2>Current Slide: {currentSlide}</h2>
                    <div style={{ fontSize: '48px', margin: '20px 0' }}>
                        Slide {currentSlide}
                    </div>
                    {isAdmin && (
                        <div>
                            <Button onClick={() => moveSlide('prev')} disabled={currentSlide === 1}>Prev</Button>
                            <Button onClick={() => moveSlide('next')} disabled={currentSlide === 3}>Next</Button>
                        </div>
                    )}
                    <Input value={sessionId} readOnly style={{ marginTop: '20px' }} />
                </>
            )}
        </div>
    );
}

export default LivePoll;
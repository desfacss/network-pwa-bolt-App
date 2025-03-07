import React, { useState, useEffect } from 'react';
import { Button, Input, Checkbox, Radio, InputNumber, Form } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';
import pollQuestions from './PollQuestions.json';

function LivePoll() {
    const [sessionId, setSessionId] = useState('');
    const [currentSlide, setCurrentSlide] = useState(1);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isParticipant, setIsParticipant] = useState(false);
    const [activeSession, setActiveSession] = useState(null);
    const [answers, setAnswers] = useState({});
    const [responseCounts, setResponseCounts] = useState({});
    const [subSectorOptions, setSubSectorOptions] = useState([]);

    const { session } = useSelector((state) => state.auth);
    const userId = session?.user?.id;
    const roleType = session?.user?.role_type;

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
        const newSlide = direction === 'next' ? Math.min(currentSlide + 1, pollQuestions.length) : Math.max(currentSlide - 1, 1);
        setCurrentSlide(newSlide);
        supabase.channel('poll-room').send({
            type: 'broadcast',
            event: 'move',
            payload: { slide: newSlide }
        });
    };

    const handleAnswerChange = (key, value) => {
        setAnswers({ ...answers, [key]: value });

        if (key === 'IndustrySector') {
            updateSubSectorOptions(value);
        }
    };

    const submitAnswer = async () => {
        const { data, error } = await supabase.from('ib_survey').insert([
            { details: { ...answers, created_by: userId } },
        ]).select();
        if (error) {
            console.error('Error submitting answer:', error);
        } else {
            console.log('Answer submitted successfully');
            updateResponseCounts(data[0].id, answers);
        }
    };

    const updateResponseCounts = async (surveyId, answers) => {
        for (const question of pollQuestions) {
            if (question.type === 'radio' || question.type === 'multi-select') {
                const answer = answers[question.key];
                if (question.type === 'multi-select' && answer) {
                    for (const option of answer) {
                        await updateOrInsertResult(surveyId, question.key, option);
                    }
                } else if (answer) {
                    await updateOrInsertResult(surveyId, question.key, answer);
                }
            }
        }
        updateLiveResponseCounts();
    };

    const updateOrInsertResult = async (surveyId, questionKey, answerOption) => {
        const { data, error } = await supabase
            .rpc('update_or_insert_survey_result', {
                _survey_id: surveyId,
                _question_key: questionKey,
                _answer_option: answerOption,
            });
        if (error) {
            console.error("Error updating or inserting result:", error);
        }
    };

    const updateLiveResponseCounts = async () => {
        const counts = {};
        for (const question of pollQuestions) {
            if (question.type === 'radio' || question.type === 'multi-select') {
                counts[question.key] = {};
                const { data, error } = await supabase
                    .from('ib_survey_results')
                    .select('answer_option, response_count')
                    .eq('question_key', question.key);
                if (error) {
                    console.error("Error fetching survey details:", error);
                } else {
                    for (const row of data) {
                        counts[question.key][row.answer_option] = row.response_count;
                    }
                }
            }
        }
        setResponseCounts(counts);
    };

    useEffect(() => {
        if (activeSession) {
            updateLiveResponseCounts();
        }
    }, [activeSession]);

    const updateSubSectorOptions = (selectedIndustries) => {
        if (!selectedIndustries || selectedIndustries.length === 0) {
            setSubSectorOptions([]);
            return;
        }

        const subSectorMap = {
            'Agriculture & ESG': ['Farming', 'Organic Agriculture', 'Agricultural Technology', 'Environmental Consulting', 'Renewable Energy'],
            'Consumer Goods': ['Food and Beverage', 'Apparel and Textiles', 'Home and Personal Care', 'Electronics'],
            'Financial Services': ['Banking', 'Insurance', 'Investment Management', 'FinTech'],
            'IT and Software Services': ['Software Development', 'IT Consulting', 'Cybersecurity', 'Cloud Computing'],
            'Logistics & Transport': ['Freight Transportation', 'Warehousing', 'Supply Chain Management', 'Delivery Services'],
            'Manufacturing': ['Automotive', 'Chemicals', 'Electronics Manufacturing', 'Textile Manufacturing'],
            'Media and Entertainment': ['Film Production', 'Music Production', 'Publishing', 'Digital Media'],
            'Pharma & Healthcare': ['Pharmaceuticals', 'Medical Devices', 'Hospitals', 'Healthcare Services'],
            'Professional Services': ['Consulting', 'Legal Services', 'Accounting', 'Marketing'],
            'Public Administration': ['Government Services', 'Policy Making', 'Public Safety', 'Education'],
            'Real Estate & Construction': ['Residential Real Estate', 'Commercial Real Estate', 'Construction', 'Architecture'],
            'Sales and Distribution': ['Wholesale', 'Retail Distribution', 'Direct Sales', 'E-commerce Distribution'],
            'Tourism and Hospitality': ['Hotels', 'Restaurants', 'Travel Agencies', 'Event Management'],
            'Utility Services': ['Electricity', 'Water', 'Gas', 'Waste Management'],
            'Others': []
        };

        let combinedOptions = [];
        selectedIndustries.forEach((industry) => {
            if (subSectorMap[industry]) {
                combinedOptions = [...combinedOptions, ...subSectorMap[industry]];
            }
        });
        setSubSectorOptions([...new Set(combinedOptions)]);
    };

    const renderQuestion = (question) => {
        if (question.key === 'SubSector') {
            return (
                <Checkbox.Group
                    value={answers[question.key] || []}
                    onChange={(values) => handleAnswerChange(question.key, values)}
                    options={subSectorOptions}
                />
            );
        }
        switch (question.type) {
            case 'text':
                return (
                    <Input
                        placeholder={question.question}
                        value={answers[question.key]}
                        onChange={(e) => handleAnswerChange(question.key, e.target.value)}
                    />
                );
            case 'textarea':
                return (
                    <Input.TextArea
                        placeholder={question.question}
                        value={answers[question.key]}
                        onChange={(e) => handleAnswerChange(question.key, e.target.value)}
                    />
                );
            case 'number':
                return (
                    <InputNumber
                        placeholder={question.question}
                        value={answers[question.key]}
                        onChange={(value) => handleAnswerChange(question.key, value)}
                    />
                );
            case 'radio':
                return (
                    <Radio.Group
                        value={answers[question.key]}
                        onChange={(e) => handleAnswerChange(question.key, e.target.value)}
                    >
                        {question.options.map((option) => (
                            <Radio key={option} value={option}>
                                {option}
                            </Radio>
                        ))}
                    </Radio.Group>
                );
            case 'multi-select':
                return (
                    <Checkbox.Group
                        value={answers[question.key] || []}
                        onChange={(values) => handleAnswerChange(question.key, values)}
                        options={question.options}
                    />
                );
            default:
                return <p>Unsupported question type</p>;
        }
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
                <div>
                    {(roleType === 'admin' || roleType === 'superadmin') && isAdmin ? (
                        <div>
                            <h2>Current Slide: {currentSlide}</h2>
                            <div>
                                <Button onClick={() => moveSlide('prev')} disabled={currentSlide === 1}>Prev</Button>
                                <Button onClick={() => moveSlide('next')} disabled={currentSlide === pollQuestions.length}>Next</Button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ fontSize: '48px', margin: '20px 0' }}>
                            Slide {currentSlide}
                        </div>
                    )}
                    <h2>{pollQuestions[currentSlide - 1]?.question}</h2>
                    {renderQuestion(pollQuestions[currentSlide - 1])}
                    <Button onClick={submitAnswer}>Submit</Button>
                    {responseCounts[pollQuestions[currentSlide - 1]?.key] && (
                        <div>
                            <h3>Response Counts:</h3>
                            <ul>
                                {Object.entries(responseCounts[pollQuestions[currentSlide - 1]?.key]).map(([option, count]) => (
                                    <li key={option}>
                                        {option}: {count}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
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
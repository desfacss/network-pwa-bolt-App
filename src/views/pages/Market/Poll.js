// Poll.js
import React, { useState, useEffect } from 'react';
import { Steps, Button, Radio, message, Card, Space } from 'antd';
import { supabase } from '../config';
// import { supabase } from './supabaseClient';

const { Step } = Steps;

const Poll = () => {
    const [current, setCurrent] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [responses, setResponses] = useState([]);
    const [answers, setAnswers] = useState({});
    const [userId, setUserId] = useState('');

    const login = async () => {
        let { data, error } = await supabase.auth.signInWithPassword({
            email: 'ratedrnagesh28@gmail.com',
            password: 'Test@1234'
        })
        if (data) {
            // setToken(data?.session?.access_token)
            // dispatch(setUser(data))
            console.log("U", data)
        } else {
            console.log(error)
        }
    }
    const getResponses = async () => {
        const user = await supabase.auth.getSession()
        const user_id = user?.data?.session?.user?.id
        // const { user, error } = await supabase.auth.getUser()
        const { data } = await supabase.from('poll_answers').select('*').eq('user_id', user_id);
        // console.log("R", user)
        setResponses((data && data[0]?.response) || {})
    }
    useEffect(() => {
        login()
        fetchQuestions();
        getResponses()
        // fetchUserId();
    }, []);

    const fetchQuestions = async () => {
        // const { data } = await supabase.from('poll_questions').select('*');
        const { data } = await supabase.from('forms').select('*')
            .eq('form_type', 'poll').single();
        setQuestions(data && data?.data_schema);
        getResponses()
    };

    const fetchUserId = async () => {
        // Assuming you have a method to get or create user ID
        const user_id = 'your-user-id'; // Replace with actual user ID logic
        setUserId(user_id);

    };

    const handleNext = async () => {
        const user = await supabase.auth.getSession()
        const user_id = user?.data?.session?.user?.id
        if (current < questions.length && user_id) {
            const question = questions[current];
            const tag = question.tag;
            const answer = answers[tag];

            const { error } = await supabase
                .from('poll_answers')
                // .upsert({ user_id, [tag]: answer }, { onConflict: 'user_id' });
                .upsert({ user_id, response: { ...responses, [tag]: answer } }, { onConflict: 'user_id' });
            if (error) {
                message.error('Failed to save answer.');
            } else {
                message.success('Answer saved successfully.');
                setCurrent(current + 1);
            }
        }
        getResponses()
    };

    const handleAnswerChange = (e, tag) => {
        setAnswers({ ...answers, [tag]: e.target.value });
    };

    return (
        <Card>
            <Button onClick={fetchQuestions}>Get</Button>
            <Steps current={current}>
                {questions?.map((question, index) => (
                    <Step key={index} title={`Question ${index + 1}`} />
                ))}
            </Steps>
            <div className="steps-content">
                {questions && questions[current] && (
                    <div>
                        <h3>{questions[current].question}</h3>
                        <Radio.Group
                            onChange={(e) => handleAnswerChange(e, questions[current].tag)}
                        >
                            {questions[current].options.map((option, idx) => (
                                <p>
                                    <Radio key={idx} value={option}>
                                        {option}
                                    </Radio>
                                </p>
                            ))}
                        </Radio.Group>
                    </div>
                )}
            </div>
            <div className="steps-action">
                {current < questions?.length - 1 && (
                    <Button type="primary" onClick={handleNext}>
                        Next
                    </Button>
                )}
                {current === questions?.length - 1 && (
                    <Button type="primary" onClick={handleNext}>
                        Submit
                    </Button>
                )}
            </div>
        </Card>
    );
};

export default Poll;

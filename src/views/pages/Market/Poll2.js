// Poll.js
import React, { useState, useEffect } from 'react';
import { Steps, Button, Radio, message, Card, Row, Col, Progress } from 'antd';
import { Pie } from '@ant-design/plots';
import { supabase } from 'configs/SupabaseConfig';

const { Step } = Steps;

const Poll2 = () => {
    const [current, setCurrent] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [responses, setResponses] = useState({});
    const [answers, setAnswers] = useState({});
    const [userId, setUserId] = useState('');
    const [optionCounts, setOptionCounts] = useState();



    useEffect(() => {
        // login();
        fetchQuestions();
        getResponses();
        const question = questions[current];
        calculateOptionCounts(question);
    }, [questions, current]);

    // const login = async () => {
    //     const { data, error } = await supabase.auth.signInWithPassword({
    //         // email: 'ratedrnagesh28@gmail.com',
    //         // password: 'Test@1234',
    //         email: 'someone@email.com',
    //         password: 'jgjXViMXIoJYqJKAuBYD',
    //     });
    //     if (data) {
    //         console.log('U', data);
    //     } else {
    //         console.log(error);
    //     }
    // };

    const fetchQuestions = async () => {
        const { data } = await supabase.from('forms').select('*').eq('form_type', 'poll').single();
        setQuestions(data?.data_schema || []);
        getResponses();
    };

    const getResponses = async () => {
        const user = await supabase.auth.getSession();
        const user_id = user?.data?.session?.user?.id;
        const { data } = await supabase.from('poll_answers').select('*').eq('user_id', user_id);

        setResponses((data && data[0]?.response) || {});
    };

    const channel = supabase
        .channel('custum_all_channels')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'poll_answers' }, payload => {
            // console.log('New row inserted:', payload.new)
            // setChat([...chat, payload.new])
            getResponses()
            const question = questions[current];
            calculateOptionCounts(question);
        })
        .subscribe()

    const handleNext = () => {
        setCurrent(current + 1);
        setOptionCounts()
    };

    const handlePrevious = () => {
        setCurrent(current - 1);
        setOptionCounts()
    };

    const handleSubmit = async () => {
        const user = await supabase.auth.getSession();
        const user_id = user?.data?.session?.user?.id;
        if (user_id) {
            const question = questions[current];
            const tag = question.tag;
            const answer = answers[tag];

            const { error } = await supabase
                .from('poll_answers')
                .upsert({ user_id, response: { ...responses, [tag]: answer } }, { onConflict: 'user_id' });

            if (error) {
                message.error('Failed to save answer.');
            } else {
                message.success('Answer saved successfully.');
                getResponses();
                calculateOptionCounts(question);
            }
        }
    };

    const calculateOptionCounts = async (question) => {
        const { data, error } = await supabase
            .from('poll_answers')
            .select('response');

        if (error) {
            message.error('Failed to fetch poll answers.');
            return;
        }
        const counts = {};
        question?.options?.forEach(key => {
            counts[key] = 0;
        });
        data.forEach(({ response }) => {
            const answer = response[question?.tag];
            if (answer) {
                counts[answer] = (counts[answer] || 0) + 1;
            }
        });
        // setOptionCounts(counts);
        // const countArray = Object.keys(counts).map(key => ({ type: key, value: counts[key] }));
        // Step 1: Calculate the total sum of all values
        const total = Object.values(counts).reduce((sum, value) => sum + value, 0);

        // Step 2: Calculate percentage for each key and map to an array of objects
        const countArray = Object.keys(counts).map(key => ({
            type: key,
            percentage: (counts[key] / total) * 100
        }));

        console.log(countArray);
        setOptionCounts(countArray);
        console.log('C', countArray)
    };

    const handleAnswerChange = (e, tag) => {
        setAnswers({ ...answers, [tag]: e.target.value });
    };

    // const config = {
    //     // appendPadding: 10,
    //     radius: 0.76,
    //     data: optionCounts,
    //     angleField: 'value',
    //     colorField: 'type',
    //     label: {
    //         text: 'value',
    //         style: {
    //             fontWeight: 'bold',
    //         },
    //     },
    //     legend: {
    //         color: {
    //             title: false,
    //             position: 'right',
    //             rowPadding: 5,
    //         },
    //     },
    // };

    return (
        <Card>
            {/* <Button onClick={fetchQuestions}>Get</Button> */}
            <Steps current={current}>
                {questions.map((question, index) => (
                    <Step key={index} title={` `} />
                ))}
            </Steps>
            <div className="steps-content">
                {questions[current] && (
                    <div>
                        <h3>{questions[current].question}</h3>
                        <Radio.Group onChange={(e) => handleAnswerChange(e, questions[current].tag)}>
                            {questions[current].options.map((option, idx) => (
                                <p key={idx}>
                                    <Row>
                                        <Col span={12}>
                                            <Radio value={option}>{option}</Radio>
                                        </Col>
                                        {/* <Col span={12}>
                                            {optionCounts && optionCounts?.filter(i => i.type === option)?.map(item => (
                                                <Progress percent={item.percentage} />
                                            ))}
                                        </Col> */}
                                    </Row>
                                    {/* {optionCounts[option] !== undefined && (
                                        <span> - {optionCounts[option]} votes</span>
                                    )} */}
                                </p>
                            ))}
                        </Radio.Group>
                        {/* {optionCounts?.length > 0 && (
                                    <Pie {...config} />
                                )} */}
                        {/* {optionCounts && optionCounts?.map(item => (
                                    <div key={item.type} style={{ marginBottom: '20px' }}>
                                        <p>{item.type}</p>
                                        <Progress percent={item.percentage} />
                                    </div>
                                ))} */}
                    </div>
                )}
            </div>
            <div className="steps-action">
                {current > 0 && (
                    <Button style={{ marginRight: 8 }} onClick={handlePrevious}>
                        Previous
                    </Button>
                )}
                {current < questions.length - 1 && (
                    <Button type="primary" onClick={handleNext}>
                        Next
                    </Button>
                )}
                {questions.length && (
                    <Button type="primary" onClick={handleSubmit}>
                        Submit
                    </Button>
                )}
            </div>
        </Card>
    );
};

export default Poll2;

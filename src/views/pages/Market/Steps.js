import React, { useEffect, useState } from 'react';
import { Steps, Button, message } from 'antd';
// import DynamicForm from './DynamicForm'; // Adjust the import based on your file structure
import DynamicForm from './StepsForms'; // Adjust the import based on your file structure
// import { schemas } from './schemaSteps';
import { supabase } from 'configs/SupabaseConfig';
import { useNavigate } from 'react-router-dom';

const { Step } = Steps;

const MultiStepForm = ({ schemas, update }) => {
    const [userId, setUserId] = useState()
    const [enums, setEnums] = useState()
    const [message, setMessage] = useState(false)
    const [messageAbort, setMessageAbort] = useState(false)
    const [current, setCurrent] = useState(0);
    const [initialValues, setInitialValues] = useState()

    const navigate = useNavigate();

    const getInfo = async () => {
        // console.log('user_id', userId, schemas, current)
        const { data, error } = await supabase.from(schemas[current]?.table).select("*").eq('user_id', userId);
        if (error) {
            return console.log("Error 1", error.message);
        }
        // console.log("data", data, data && data[0] && data[0][schemas[current]?.column])
        if (data && data[0] && data[0][schemas[current]?.column] !== null) {
            const values = data[0][schemas[current]?.column];
            if (current < schemas.length) {
                if (update) {
                    const modifiedArray = data?.map(item => ({
                        // ...item,
                        ...item[schemas[current]?.column],
                        id: item?.id,
                        [schemas[current]?.column]: undefined
                    }));
                    setInitialValues(modifiedArray)
                    // // console.log("DF", modifiedArray)
                    // // setInitialValues(values)
                    // // form.setFieldsValue(values);
                }
                else {
                    next();
                }
            } else {
                setMessage(true)
            }
        }
    };

    useEffect(() => {
        const getUser = async () => {
            supabase.auth.getSession().then(async ({ data: { session } }) => {
                console.log("U", session.user)
                setUserId(session?.user?.id)
            })
        }
        const getEnums = async () => {
            let { data, error } = await supabase.from('enum').select('*')
            if (data) {
                setEnums(data)
            }
        }
        getUser()
        getEnums()
    }, [current])

    useEffect(() => {
        if (userId && schemas) {
            getInfo()
        }
    }, [current, userId, schemas])


    const next = () => {
        setCurrent(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // adds smooth scrolling to top
    };

    const prev = () => {
        setCurrent(current - 1);
    };


    const onFinish = async (values) => {
        for (let key in values) {
            const value = values[key];
            console.log("V", value)
            const id = value?.id
            delete value?.id
            if (schemas[current]?.table === 'businesses') {
                if (update && id) {
                    const { data, error } = await supabase.from(schemas[current]?.table)
                        .upsert([
                            {
                                id: id,
                                user_id: userId,
                                [schemas[current]?.column]: value // Send each value separately
                            },
                        ], { onConflict: 'id' });
                    if (error) {
                        return console.log("Error", error);
                    }
                } else {
                    const { data, error } = await supabase.from(schemas[current]?.table)
                        .insert([
                            {
                                user_id: userId,
                                [schemas[current]?.column]: value // Send each value separately
                            },
                        ]);
                    if (error) {
                        return console.log("Error", error);
                    }
                }
            } else {
                const { data, error } = await supabase.from(schemas[current]?.table)
                    .upsert([
                        {
                            user_id: userId,
                            [schemas[current]?.column]: value // Send each value separately
                        },
                    ], { onConflict: 'user_id' });
                if (error) {
                    return console.log("Error", error);
                }
            }
        }
        if (current < schemas.length - 1) {
            next();
        } else {
            setMessage(true)
        }
    };
    const backHome = () => {
        // supabase.auth.signOut();
        navigate('/survey');
        // navigate('/app');
        setMessage(false)
        setMessageAbort(false)
    }

    const signIn = () => {
        // supabase.auth.signOut();
        navigate('/survey/login');
        setMessage(false)
        setMessageAbort(false)
    }

    return (
        <div>
            {(message || messageAbort) ?
                (<h3>
                    <h1>Thanks for Participating in the Survey!</h1>
                    {message &&
                        <>
                            <p>
                                We'll inform you once the survey statistics become available, and we'll also notify you if you've chosen to participate in networking opportunities.
                            </p>
                        </>
                    }
                    {messageAbort &&
                        <p>
                            You can complete the survey at your convenience using password-free <a onClick={signIn}>Sign In</a> to update the information anytime
                        </p>
                    }
                    <br />
                    <p>
                        Thanks,
                    </p>
                    <p>
                        KNBA - IBCN 2025 Team
                    </p>
                    <Button onClick={backHome} type='primary'>
                        Back To Home
                    </Button>
                </h3>)
                : (<>
                    {schemas && <>
                        <h3>{schemas[current]?.title}</h3>
                        <p>{schemas[current]?.description}</p>
                    </>}
                    <div className="steps-content">
                        {schemas && <DynamicForm setMessageAbort={setMessageAbort} enums={enums} schema={schemas[current]} initialValues={update && initialValues} onFinish={onFinish} lastStep={current === schemas.length - 1} firstStep={current === 0} prev={prev} />}
                    </div>
                    {/* <Button >
                        Save Draft & Continue Later
                    </Button> */}
                </>)
            }
        </div>
    );
};

// This function is creating schemas array from forms table and giving to multistep form
const App = ({ formType, update }) => {
    const [schemas, setSchemas] = useState([]);
    // const [schemas,setSchemas]=useState()

    useEffect(() => {
        const getForms = async () => {
            const { data, error } = await supabase.from('forms').select('*')
            if (data) {

                // Function to find the data by name
                const findDataByName = (name) => {
                    return data?.find(item => item.name === name);
                };

                // Function to build the new array following the next_step chain
                const buildDataArray = (formType) => {
                    const result = [];
                    let currentData = findDataByName(formType);

                    while (currentData) {
                        result.push(currentData?.data);
                        currentData = currentData.next_step ? findDataByName(currentData.next_step) : null;
                    }

                    return result;
                };

                // Initialize the processed data
                const newData = buildDataArray(formType);
                setSchemas(newData);
            }
        }
        getForms()
    }, [])

    return (
        <>
            {schemas &&
                <div style={{ padding: '24px' }}>
                    <MultiStepForm schemas={schemas} update={update} />
                </div>
            }
        </>
    )
};

export default App;

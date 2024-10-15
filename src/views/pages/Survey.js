import { useNavigate } from 'react-router-dom'
import React, { useEffect, useState } from "react";
import { Button, Divider } from "antd";
import IBCNLayout from 'components/layout-components/IBCNLayout';
// import { update } from 'lodash';
import { supabase } from 'configs/SupabaseConfig';

const Survey = (props) => {
    const [loggedin, setLoggedin] = useState(false)
    const navigate = useNavigate();

    const handleNavigate = () => {
        if (loggedin) {
            navigate('/survey/update_survey');
        } else {
            navigate('/survey/register');
        }
    };

    const getUser = async () => {
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session?.user?.id) {
                setLoggedin(true)
            }
            let { data, error } = await supabase.from('members').select('*').eq('user_id', session?.user?.id)
            if (data.length === 0) {
                console.log("first")
                navigate('/survey/register2');
            }
        });
    };

    const signOut = () => {
        supabase.auth.signOut()
        // window.location.reload()
        navigate('/survey/register')

    }
    const signIn = () => {
        supabase.auth.signOut()
        navigate('/survey/login')
    }

    useEffect(() => {
        getUser()
    }, [])

    return (
        <>
            <h1>TimeTrack</h1>
            <p>
                The Nagarathar community has a robust history of entrepreneurial success in finance, trade, and various business ventures, characterized by sharp business acumen, philanthropy, and adaptability. To uphold this legacy and in the context of newer business models and emerging opportunities, it's crucial to understand the entrepreneurship and business landscape within our community, as well as the aspirations of our members.
            </p>
            <h3>Purpose of the Survey:</h3>
            <ul>
                <li><p><strong>Comprehensive Business Insight:</strong> Gather & publish a snapshot of entrepreneurship and business activity within the Nagarathar community today.</p></li>
                <li><p><strong>Identify Aspirations:</strong> Gauge the entrepreneurial aspirations and interests of the next generation across verticals.</p></li>
                <li><p><strong>Networking Opportunities:</strong> Help foster collaboration and growth through various networking opportunities.</p></li>
                <li><p><strong>Support Planning:</strong> Align activities of IBCN, KNBA, NCC, NBC, NBIG, NEU, and other orgs to better support our community.</p></li>
            </ul>
            <h3>Your Participation:</h3>
            <ul>
                <li><p><strong>Optional Information:</strong> Providing business names and all contact information is optional.</p></li>
                <li><p><strong>Confidentiality:</strong> All responses are confidential and used solely for statistical publication.</p></li>
                <li><p><strong>Business Directory / Networking:</strong> You can opt-in or opt-out to participate in networking opportunities.</p></li>
            </ul>

            <div className="mt-4">
                <Button onClick={handleNavigate} type='primary'>
                    {loggedin ? 'Update' : 'Start'} Survey
                </Button>
                {!loggedin ?
                    <p className='pt-2'>
                        If you are already registered, <a onClick={signIn} >Login here...</a>
                    </p>
                    :
                    <p className='pt-2'>
                        New User, click here to <a onClick={signOut}>Register Here...</a>
                    </p>
                }
                {/* <br></br> */}
            </div>
            <Divider />
            <footer>Developed by Claritiz Innovations</footer>
        </>
    );
};

export default Survey;

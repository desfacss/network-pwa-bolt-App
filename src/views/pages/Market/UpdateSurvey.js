import IBCNLayout from 'components/layout-components/IBCNLayout'
import { supabase } from 'configs/SupabaseConfig';
import { registrationType } from 'constants/registrationType';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import App from './Steps';

const UpdateSurvey = () => {

    const [formType, setFormType] = useState();
    const navigate = useNavigate();
    const getUserType = async () => {
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            // if (session?.user?.id) {
            //     // navigate('/')
            // }
            if (session?.user?.id) {
                let { data, error } = await supabase.from('members').select('*').eq('user_id', session?.user?.id)
                if (data) {
                    const type = data[0]?.reg_info?.registrationType;
                    console.log("session", session, data)
                    setFormType(registrationType[type]);
                }
                if (error) {
                    console.log(error)
                }
            }
        });
    };

    useEffect(() => {
        getUserType();
    }, []);

    return (
        // <IBCNLayout>
        <>
            {formType ?
                (
                    <App formType={formType} update={true} />
                ) :
                (<>Login / Register</>)
            }
        </>
        // </IBCNLayout>
    )
}

export default UpdateSurvey
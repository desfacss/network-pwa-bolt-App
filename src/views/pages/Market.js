import React, { useEffect, useState } from 'react'
// import { createClient } from '@supabase/supabase-js'
import { Button, Card, Checkbox, Input, Space } from 'antd'
import Registration from './Registration'
import { setUser } from 'store/slices/positionsSlice'
import { useDispatch, useSelector } from 'react-redux'
import BusinessForm from './BusinessForm'
import DynamicForm from './Market/Dform'
// import Survey from './Market/Survey'
import App from './Market/Steps'
import { supabase } from 'configs/SupabaseConfig'

const Market = () => {
    const [text, setText] = useState('')
    const [chat, setChat] = useState()
    const [token, setToken] = useState('')
    const [checked, setChecked] = useState(false);

    const handleCheckboxChange = () => {
        setChecked(!checked);
    };

    const dispatch = useDispatch();
    const { user } = useSelector(
        (state) => state?.positions
    );
    // const supabaseUrl = 'https://ilhpsnitewtlcrjbptyw.supabase.co'
    // const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsaHBzbml0ZXd0bGNyamJwdHl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc1ODYxMzUsImV4cCI6MjAzMzE2MjEzNX0.qPJXvkzv8IEPDFL6gDfSceDoeh6mSg4lle2-KoOKx3U'
    // // const supabaseUrl = 'https://jajhcjrhuxezzmffvsnz.supabase.co'
    // // const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphamhjanJodXhlenptZmZ2c256Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTcwNzYxNzEsImV4cCI6MjAzMjY1MjE3MX0.sf0UQBAYVueKmJKyVmdPhB3B1CeoxpGIFY-zQK-NQho'
    // // const supabaseUrl = 'https://niheqfksbohfoelyklai.supabase.co'
    // // const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5paGVxZmtzYm9oZm9lbHlrbGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODExMjIyMDAsImV4cCI6MTk5NjY5ODIwMH0.yF4isNGsvxYMuZmwTr6Fk8CP0FZ7uajYGOK3tGIFrOM'
    // const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const signUp = async () => {
        let { data, error } = await supabase.auth.signUp({
            email: 'someone@email.com',
            password: 'jgjXViMXIoJYqJKAuBYD',
            options: { data: { email_confirmed_at: new Date().toISOString() } }
        })
        console.log("SU", data, error)
    }

    const login = async () => {
        let { data, error } = await supabase.auth.signInWithPassword({
            email: 'ratedrnagesh28@gmail.com',
            password: 'Test@1234'
        })
        if (data) {
            setToken(data?.session?.access_token)
            dispatch(setUser(data))
            console.log(data)
        } else {
            console.log(error)
        }
    }

    const get = async () => {
        // supabase.auth.setAuth(token)
        const info = await supabase.auth.getSession();
        console.log("User", info)
        let { data, error } = await supabase
            .from('chats')
            .select('*')
            // .eq('users', user?.id)
            .contains('users', [user?.id])
            .order('created_at', { ascending: true })

        // const { data, error } = await supabase.from('countries').select('*')

        const ses = await supabase.auth.getSession()
        // console.log("SU", countries, error=)
        if (data) {
            console.log("SC", data)
            setChat(data)
        }
    }

    const send = async () => {
        if (text !== "") {
            let { data, error } = await supabase
                .from('posts')
                .insert([
                    {
                        name: checked ? 'ravi' : 'ganesh',
                        owner_id: '26a9ae6c-b0b1-41dd-a1b7-44fb1d12b894',
                        client_id: '808c6e87-add0-416d-8590-6b07fe50e23e',
                        message: text
                    },
                ])
            // const ses = await supabase.auth.getSession()
            setText('')
            // console.log("SC", data, error)
        }
    }
    const channel = supabase
        .channel('custum_all_channels')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, payload => {
            console.log('New row inserted:', payload.new)
            // setChat([...chat, payload.new])
            get()
        })
        .subscribe()

    useEffect(() => {
        get()
        console.log("SB", supabase)
    }, [supabase])

    useEffect(() => {
        console.log("U", user)
    }, [user])
    return (
        <Card>
            {/* {chat && chat.map(post => (
                <div key={post?.id}>
                    <p>{post?.name}: {post?.message}</p>
                </div>
            ))}
            <Checkbox checked={checked} onChange={handleCheckboxChange} />
            <Input onChange={(e) => setText(e.target.value)} value={text} />
            <Button onClick={send}>Send</Button>
            <Button onClick={signUp}>+</Button> */}
            {/* <DynamicForm /> */}
            {/* <Survey /> */}
            <App formType={'ind_reg'} />
            <Button onClick={login}>Login</Button>
            <Button onClick={get}>Get</Button>
            {/* <Registration /> */}
            {/* <BusinessForm /> */}
        </Card>
    )
}

export default Market
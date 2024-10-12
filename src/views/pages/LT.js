import { Button, Card } from 'antd'
import { supabase } from 'configs/SupabaseConfig';
import React from 'react'
import { store } from 'store';
import { removeSession } from 'store/slices/authSlice';
import FacebookHashtagFeed from './Market/FacebookPosts';
import SocialMediaPosts from './Market/Posts';
// import { store } from '../store';

const LT = () => {
    const signOut = async () => {
        supabase.auth.signOut()
        store.dispatch(removeSession());
        // let { data, error } = await supabase.auth.signInWithOAuth({
        //     provider: 'google'
        // })
    }
    const oAuth = async () => {
        // supabase.auth.signOut()
        // store.dispatch(removeSession());
        let { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google'
        })
    }
    return (
        <Card>
            <Button
            // onClick={oAuth}
            >
                Google
            </Button>
            <Button
            //  onClick={signOut}
            >
                Sign Out
            </Button>
            {/* <SocialMediaPosts hashtag={'IBCN2025'} /> */}
            <FacebookHashtagFeed />
        </Card>
    )
}

export default LT
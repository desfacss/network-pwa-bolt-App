
import { supabase } from '../supabaseClient'

let loading = false
let email = ''
let userExists = false

const checkUserExists = async () => {
    const { data, error } = await supabase.auth.api.getUserByEmail(email)
    if (data) {
        userExists = true
    } else {
        userExists = false
        alert('Email does not exist. Please sign up first.')
    }
}

const handleLogin = async () => {
    try {
        loading = true
        await checkUserExists()
        if (userExists) {
            const { error } = await supabase.auth.signInWithOtp({ email })
            if (error) throw error
            alert('Check your email for login link!')
        }
    } catch (error) {
        if (error instanceof Error) {
            alert(error.message)
        }
    } finally {
        loading = false
    }
}

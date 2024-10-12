import { Switch } from 'antd'
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { onSwitchTheme } from 'store/slices/themeSlice';

const Theme = () => {
    const dispatch = useDispatch()
    const { currentTheme } = useSelector(state => state.theme)

    const toggleTheme = (isChecked) => {
        const changedTheme = isChecked ? 'dark' : 'light'
        dispatch(onSwitchTheme(changedTheme))
    };
    return (
        <div>Light <Switch checked={currentTheme === 'dark'} onChange={toggleTheme} /> Dark</div>
    )
}

export default Theme
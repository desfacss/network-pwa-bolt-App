import { Card } from 'antd'
import React from 'react'
import { SurveyForm } from 'views/pages/Trial/openRegisterFormNew'
import MobileView from './MobileView'
import LivePoll from './Poll'
import { SelectableTags } from './SelectableTags'

const index = () => {
    return (
        <Card>
            <LivePoll />
            <MobileView />
            <SurveyForm />
            <SelectableTags />
        </Card>
    )
}

export default index
import { Card } from 'antd'
import React from 'react'
import { SurveyForm } from 'views/pages/Trial/openRegisterFormNew'
import MobileView from './MobileView'
import LivePoll from './Poll'
import { SelectableTags } from './Test'

const index = () => {
    return (
        <Card>
            {/* <MobileView />
            <SurveyForm />
            <LivePoll /> */}
            <SelectableTags />
        </Card>
    )
}

export default index
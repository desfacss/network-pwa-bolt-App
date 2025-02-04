import { Card } from 'antd'
import React from 'react'
import LivePoll from './Poll'
// import { SurveyForm } from 'views/pages/Trial/openRegisterFormNew'
// import MobileView from './MobileView'
// import { SelectableTags } from './SelectableTags'

const index = () => {
    return (
        <Card>
            <LivePoll />
            {/* <MobileView />
            <SurveyForm />
            <SelectableTags /> */}
        </Card>
    )
}

export default index
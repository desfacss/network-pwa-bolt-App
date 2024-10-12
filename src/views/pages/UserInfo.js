import React, { useEffect, useState } from 'react';
import { Tabs, Card, Row, Col, Descriptions, Button } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import { useParams } from 'react-router-dom';

const { TabPane } = Tabs;

const UserInfo = () => {
    const { user_id: userId } = useParams();
    console.log("id", userId)
    const [userData, setUserData] = useState();
    const [businessData, setBusinessData] = useState();

    const getInfo = async () => {
        const { data, error } = await supabase.from('members').select("*").eq('user_id', userId);
        console.log("User", data[0]);
        if (error) {
            return console.log("Error", error.message);
        }
        if (data && data[0]) {
            setUserData(data[0]);
        }
    };
    const getBusiness = async () => {
        const { data, error } = await supabase.from('businesses').select("*").eq('user_id', userId);
        console.log("Business", data);
        if (error) {
            return console.log("Error", error.message);
        }
        if (data) {
            setBusinessData(data);
        }
    };

    useEffect(() => {
        if (userId) {
            getInfo();
            getBusiness();
        }
    }, [userId]);

    if (!userData) return null;

    const { reg_info, ind_reg, personal_info, networking } = userData;

    const renderDescriptionItem = (label, value) => {
        return value ? <Descriptions.Item label={label}>{value}</Descriptions.Item> : null;
    };

    return (
        <Card>
            {/* Summary Section */}
            <Card title="">
                <h3>{reg_info?.firstName} {reg_info?.lastName}</h3>
                <p>Individual bio goes here,.. Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet Lorem ipsum </p>
                <Button>+ Business</Button>
            </Card>
            <Card title="Personal Info">
                <Descriptions column={1}>
                    {/* {renderDescriptionItem("First Name", reg_info?.firstName)}
                    {renderDescriptionItem("Last Name", reg_info?.lastName)} */}
                    {renderDescriptionItem("Email", reg_info?.email)}
                    {renderDescriptionItem("Mobile", reg_info?.mobile)}
                    {renderDescriptionItem("Location", personal_info?.location)}
                    {renderDescriptionItem("Native", reg_info?.nativeVillage)}
                    {renderDescriptionItem("Kovil", reg_info?.associatedTemple)}
                    {/* {renderDescriptionItem("User Type", reg_info?.registrationType)} */}
                </Descriptions>
            </Card>
            <Card title="Social Media Links">
                <Descriptions column={1}>
                    {renderDescriptionItem("Twitter", personal_info?.twitter)}
                    {renderDescriptionItem("Facebook", personal_info?.facebook)}
                    {renderDescriptionItem("Instagram", personal_info?.instagram)}
                    {renderDescriptionItem("LinkedIn", personal_info?.linkedin)}
                </Descriptions>
            </Card>
            <Card title="Currently Working">
                <Descriptions column={1}>
                    {renderDescriptionItem("Company Name", ind_reg?.companyName)}
                    {renderDescriptionItem("Position Title", ind_reg?.positionTitle)}
                </Descriptions>
            </Card>
            <Card title="Networking">
                <Descriptions column={1}>
                    {renderDescriptionItem("I Can Offer", networking?.icanoffer?.join(', '))}
                    {renderDescriptionItem("I'm Looking For", networking?.imlookingfor?.join(', '))}
                    {/* {renderDescriptionItem("Specific Interests", networking?.specific_interests)}
                            {renderDescriptionItem("Familiarity with Initiatives", networking?.familiarity_with_initiatives)} */}
                </Descriptions>
            </Card>
            {/* Tabs Section */}
            <Tabs defaultActiveKey="3">
                {/* <TabPane tab="Info" key="1">
                    <Row>
                        <Col span={12}>
                            <Card title="Individual Registration">
                                <Descriptions column={1}>
                                    {renderDescriptionItem("Company Name", ind_reg?.companyName)}
                                    {renderDescriptionItem("Position Title", ind_reg?.positionTitle)}
                                    {renderDescriptionItem("Industry Sector", ind_reg?.industrySector)}
                                    {renderDescriptionItem("Innovation Plans", ind_reg?.innovationPlans)}
                                    {renderDescriptionItem("Growth Needs", ind_reg?.growthNeeds)}
                                </Descriptions>
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card title="Personal Info">
                                <Descriptions column={1}>
                                    {renderDescriptionItem("Location", personal_info?.location)}
                                    {renderDescriptionItem("LinkedIn", personal_info?.linkedin)}
                                </Descriptions>
                            </Card>
                        </Col>
                    </Row>
                </TabPane>

                <TabPane tab="Networking" key="2">
                    <Card title="Networking Details">
                        <Descriptions column={1}>
                            {renderDescriptionItem("I Can Offer", networking?.icanoffer?.join(', '))}
                            {renderDescriptionItem("I'm Looking For", networking?.imlookingfor?.join(', '))}
                            {renderDescriptionItem("Specific Interests", networking?.specific_interests)}
                            {renderDescriptionItem("Familiarity with Initiatives", networking?.familiarity_with_initiatives)}
                        </Descriptions>
                    </Card>
                </TabPane> */}

                {businessData?.map((business, index) => (
                    <TabPane tab={business.info.companyName} key={`business-${index + 3}`}>
                        <Card title={business.info.companyName}>
                            <Descriptions column={1}>
                                {renderDescriptionItem("Position Title", business.info.positionTitle)}
                                {renderDescriptionItem("Industry Sector", business.info.industrySector)}
                                {renderDescriptionItem("Legal Structure", business.info.legalStructure)}
                                {renderDescriptionItem("Innovation Plans", business.info.innovationPlans)}
                                {renderDescriptionItem("Expansion Plans", business.info.expansionPlans)}
                                {renderDescriptionItem("Products/Services", business.info.productsOrServices)}
                                {renderDescriptionItem("Annual Turnover", business.info.annualTurnoverRange)}
                                {renderDescriptionItem("Establishment Year", business.info.establishmentYear)}
                                {renderDescriptionItem("Location", business.info.location)}
                                {renderDescriptionItem("Direct Employment", business.info.directEmployment)}
                                {renderDescriptionItem("Indirect Employment", business.info.indirectEmployment)}
                                {renderDescriptionItem("Nagarathar Involvement", business.info.nagaratharInvolvement)}
                            </Descriptions>
                        </Card>
                    </TabPane>
                ))}
            </Tabs>
        </Card>
    );
};

export default UserInfo;

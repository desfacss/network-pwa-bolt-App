import React, { useEffect, useState } from 'react';
import { Tabs, Card, Row, Col, Descriptions, Button } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import { useParams } from 'react-router-dom';

const { TabPane } = Tabs;

const BusinessInfo = () => {
    const { business_id: businessId } = useParams();
    console.log("id", businessId)

    const [business, setBusiness] = useState();

    // const getInfo = async () => {
    //     const { data, error } = await supabase.from('members').select("*").eq('business_id', businessId);
    //     console.log("Business", data[0]);
    //     if (error) {
    //         return console.log("Error", error.message);
    //     }
    //     if (data && data[0]) {
    //         setBusinessData(data[0]);
    //     }
    // };
    const getBusiness = async () => {
        const { data, error } = await supabase.from('businesses').select("*").eq('id', businessId);
        console.log("Business", data);
        if (error) {
            return console.log("Error", error.message);
        }
        if (data) {
            setBusiness(data[0]);
        }
    };

    useEffect(() => {
        if (businessId) {
            // getInfo();
            getBusiness();
        }
    }, [businessId]);

    if (!business) return null;

    const renderDescriptionItem = (label, value) => {
        return value ? <Descriptions.Item label={label}>{value}</Descriptions.Item> : null;
    };

    return (
        <Card>
            <Descriptions column={1}>
                {renderDescriptionItem("Position Title", business?.info?.positionTitle)}
                {renderDescriptionItem("Industry Sector", business?.info?.industrySector)}
                {renderDescriptionItem("Legal Structure", business?.info?.legalStructure)}
                {renderDescriptionItem("Innovation Plans", business?.info?.innovationPlans)}
                {renderDescriptionItem("Expansion Plans", business?.info?.expansionPlans)}
                {renderDescriptionItem("Products/Services", business?.info?.productsOrServices)}
                {renderDescriptionItem("Annual Turnover", business?.info?.annualTurnoverRange)}
                {renderDescriptionItem("Establishment Year", business?.info?.establishmentYear)}
                {renderDescriptionItem("Location", business?.info?.location)}
                {renderDescriptionItem("Direct Employment", business?.info?.directEmployment)}
                {renderDescriptionItem("Indirect Employment", business?.info?.indirectEmployment)}
                {renderDescriptionItem("Nagarathar Involvement", business?.info?.nagaratharInvolvement)}
            </Descriptions>
        </Card>
    );
};

export default BusinessInfo;

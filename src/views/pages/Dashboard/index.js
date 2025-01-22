import { Card } from "antd";
import { useSelector } from "react-redux";
import Networking from "../ib/Networking";
import DefaultDashboard from "./DefaultDashboard";
import DashboaardUKPE from "./ukpe";

const Dashboaard = () => {
    const { session } = useSelector((state) => state.auth);
    const workspace = session?.user?.organization?.app_settings?.workspace || process.env.REACT_APP_WORKSPACE || 'dev'
    // console.log("workspace", workspace)
    return (
        <Card>
            {workspace === "ukpe" ? (
                <DashboaardUKPE />
            ) : workspace === "ibcn" ? (
                <Networking />
            ) : (
                <DefaultDashboard />
            )}
        </Card>
    );
};

export default Dashboaard;

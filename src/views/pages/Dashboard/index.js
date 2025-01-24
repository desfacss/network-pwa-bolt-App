import { Card } from "antd";
import { REACT_APP_WORKSPACE } from "configs/AppConfig";
import { useSelector } from "react-redux";
import Networking from "../ib/Networking";
import DefaultDashboard from "./DefaultDashboard";
import DashboaardUKPE from "./ukpe";

const Dashboaard = () => {
    const { session } = useSelector((state) => state.auth);
    const workspace = session?.user?.organization?.app_settings?.workspace || REACT_APP_WORKSPACE || 'dev'
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

import { Card } from "antd";
import { REACT_APP_WORKSPACE } from "configs/AppConfig";
import { useSelector } from "react-redux";
import Channels from "../Channels";
import Events from "../ib/Events";
import Networking from "../ib/Networking";
import Schedule from "../ib/Schedule";
import DefaultDashboard from "./DefaultDashboard";
import DashboaardUKPE from "./ukpe";

const Dashboaard = () => {
    const { session } = useSelector((state) => state.auth);
    const workspace = session?.user?.organization?.app_settings?.workspace || REACT_APP_WORKSPACE || 'dev'
    // console.log("workspace", workspace)
    return (
        <>
            {workspace === "ukpe" ? (
                <DashboaardUKPE />
            ) : workspace === "ibcn" ? (
                <Schedule /> //<Channels />//<Networking />
            ) : (
                // <Channels />// 
                <DefaultDashboard />
            )}
        </>
    );
};

export default Dashboaard;

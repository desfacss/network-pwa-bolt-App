
import { REACT_APP_WORKSPACE } from "configs/AppConfig";
import { useSelector } from "react-redux";
import Schedule from "../ib/Schedule";

const Dashboaard = () => {
    const { session } = useSelector((state) => state.auth);
    const workspace = session?.user?.organization?.app_settings?.workspace || REACT_APP_WORKSPACE || 'dev'
    return (
        <>
            {workspace === "ukpe" ? (
                <></>
            ) : workspace === "ibcn" ? (
                <Schedule /> 
            ) : (
                <></>
            )}
        </>
    );
};

export default Dashboaard;

import React from "react";
import OpenRegisterForm from "../../components/OpenRegisterForm";
import CustomHeader from "../landing/Header";
// import IBCNLayout from "components/layout-components/IBCNLayout";

const RegisterTwo = (props) => {
  return (
    <div>
      <CustomHeader title={"Register"} headerHeight={100} />
      <OpenRegisterForm {...props} />
    </div>
  );
};

export default RegisterTwo;

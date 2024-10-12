import React from "react";
import { Row, Col } from "antd";
import { useSelector } from "react-redux";

const backgroundURL = "/img/subscribe3.jpg";
const backgroundStyle = {
	backgroundImage: `url(${backgroundURL})`,
	backgroundRepeat: "no-repeat",
	backgroundSize: "cover",
};

const SurveyLayout = ({ children }) => {
	const theme = useSelector((state) => state.theme.currentTheme);

	return (
		<div className={`h-100 ${theme === "light" ? "bg-white" : ""}`}>
			<Row justify="center" className="align-items-stretch h-100">
				<Col xs={20} sm={20} md={24} lg={16}>
					<div className="container d-flex flex-column justify-content-center h-100">
						<Row justify="center" className="mt-5">
							<Col xs={24} sm={24} md={20} lg={12} xl={18}>
								{children}
							</Col>
						</Row>
					</div>
				</Col>
				<Col xs={0} sm={0} md={0} lg={8} xl={8}>
					<div
						className="d-flex flex-column h-100 px-4"
						// style={backgroundStyle}
						style={{
							...backgroundStyle,
							position: 'fixed', // Fix the position so it floats
							top: 0,            // Aligns the top of the viewport
							right: 0,          // Aligns it to the right side
							height: '100vh',   // Full height of the viewport
							overflowY: 'auto', // Scroll within this column if necessary
							width: '30vw',
						}}
					>
						<div className="text-right">
							<img src="/img/knba.png" alt="logo" style={{ height: '80px' }} />
						</div>
						<Row justify="center">
							<Col xs={0} sm={0} md={0} lg={20}>
								<img
									className="img-fluid mb-5"
									src="/img/others/img-19.png"
									alt=""
								/>
								<div>
									<img src="/img/ibcn.png" alt="logo" style={{ height: '200px' }} />
								</div><br /><br /><br /><br />
								<h1 className="text-white">IBCN 2025 Nagarathar Business Insights Survey</h1>
							</Col>
						</Row>
						<div className="d-flex justify-content-end pb-4">
							<div>
								{/* <a
                  className="text-white"
                  href="https://www.ibcn.com/disclaimer"
                // onClick={(e) => e.preventDefault()}
                >
                  Developed by Claritiz Innovations Pvt Ltd
                </a> */}
							</div>
						</div>
					</div>
				</Col>
			</Row>
		</div>
	);
};

export default SurveyLayout;

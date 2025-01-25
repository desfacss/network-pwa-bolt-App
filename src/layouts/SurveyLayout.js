import React from "react";
import { Row, Col } from "antd";
import { useSelector } from "react-redux";
import { store } from "store";

const backgroundURL = "/img/subscribe3.jpg";
const backgroundStyle = {
	backgroundImage: `url(${backgroundURL})`,
	backgroundRepeat: "no-repeat",
	backgroundSize: "cover",
};

const state = store.getState();

const SurveyLayout = ({ children }) => {
	const theme = useSelector((state) => state.theme.currentTheme);
	const { session, selectedOrganization, selectedUser, defaultOrganization } = useSelector((state) => state.auth);
	const workspace = session?.user?.organization?.app_settings?.workspace || defaultOrganization?.app_settings?.workspace || 'dev';
	const name = session?.user?.organization?.app_settings?.name || defaultOrganization?.app_settings?.name || 'dev';

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
						style={{
							...backgroundStyle,
							position: 'fixed',
							top: 0,
							right: 0,
							height: '100vh',
							overflowY: 'auto',
							width: '30vw',
						}}
					>
						<div className="text-right">
							{/* <img src="/img/knba.png" alt="logo" style={{ height: '80px' }} /> */}
						</div>
						<Row>
							<Col xs={0} sm={0} md={0} lg={20}>
								<div
									style={{
										minHeight: 'calc(100vh - 150px)', // Ensure the content has enough height
										display: 'flex',
										flexDirection: 'column',
										justifyContent: 'center',
									}}
								>
									<img
										className="img-fluid mb-5"
										src="/img/others/img-19.png"
										alt=""
									/>
									<div>
										{/* <img
											// src="/img/ukpe_logo.png"
											src={`/img/${workspace}/logo_light.png`}
											alt={`${workspace}`} style={{ height: '30px' }} /> */}
										<img
											src={`/img/${workspace}/logo_light.png`}
											alt={`${workspace}`}
											style={{ height: '30px' }}
											onError={(e) => {
												e.target.style.display = 'none'; // Hide the image
												e.target.nextSibling.style.display = 'block'; // Show the h1 element
											}}
										/>
										<h1 style={{ display: 'none', fontSize: '20px', margin: 0 }}>{name}</h1>
									</div>
									<br /><br /><br /><br />
									<h3 className="text-white">
										ENGINEERED TODAY FOR TOMORROW AND BEYOND
									</h3>
									<br />
									<p>
										&rdquo;A leading consultant focused in supporting clients to deliver cost
										effective and smart design solutions for their investments on energy networks
										of the future.&rdquo;
									</p>
								</div>
							</Col>
						</Row>
						<div
							className="d-none d-lg-flex flex-column justify-content-end pb-4"
							style={{
								position: 'absolute',
								bottom: '10px',
								width: '100%',
							}}
						>
							<div>
								{/* <span
									className="d-block"
									style={{
										color: 'white',
										textAlign: 'left',
									}}
								>
									Copyright © Claritiz 2024. All rights reserved.
								</span> */}
								<span
									className="d-block"
									style={{
										color: 'white',
										textAlign: 'left',
									}}
								>
									Developed by{' '}
									<a
										href="https://www.claritiz.com"
										target="_blank"
										rel="noopener noreferrer"
										style={{
											color: 'white',
											fontWeight: '600',
										}}
									>
										www.claritiz.com
									</a>
								</span>
							</div>
						</div>
					</div>
				</Col>
			</Row>
		</div>

	);
};

export default SurveyLayout;

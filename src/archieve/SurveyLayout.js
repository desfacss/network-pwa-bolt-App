// import React from "react";
// import { Row, Col } from "antd";
// import { useSelector } from "react-redux";
// import { store } from "store";

// const backgroundURL = "/img/subscribe3.jpg";
// const backgroundStyle = {
// 	backgroundImage: `url(${backgroundURL})`,
// 	backgroundRepeat: "no-repeat",
// 	backgroundSize: "cover",
// };

// const state = store.getState();

// const SurveyLayout = ({ children }) => {
// 	const theme = useSelector((state) => state.theme.currentTheme);
// 	const { session, selectedOrganization, selectedUser, defaultOrganization } = useSelector((state) => state.auth);
// 	const workspace = session?.user?.organization?.app_settings?.workspace || defaultOrganization?.app_settings?.workspace || 'dev';
// 	const name = session?.user?.organization?.app_settings?.name || defaultOrganization?.app_settings?.name || 'dev';

// 	return (
// 		<div className={`h-100 ${theme === "light" ? "bg-white" : ""}`}>
// 			<Row justify="center" className="align-items-stretch h-100">
// 				<Col xs={20} sm={20} md={24} lg={16}>
// 					<div className="container d-flex flex-column justify-content-center h-100">
// 						<Row justify="center" className="mt-5">
// 							<Col xs={24} sm={24} md={20} lg={24} xl={24}>
// 								{children}
// 								{/* TEST */}
// 							</Col>
// 						</Row>
// 					</div>
// 				</Col>
// 				<Col xs={0} sm={0} md={0} lg={8} xl={8}>
// 					<div
// 						className="d-flex flex-column h-100 px-4"
// 						style={{
// 							...backgroundStyle,
// 							position: 'fixed',
// 							top: 0,
// 							right: 0,
// 							height: '100vh',
// 							overflowY: 'auto',
// 							width: '30vw',
// 						}}
// 					>
// 						<div className="text-right">
// 							{/* <img src="/img/knba.png" alt="logo" style={{ height: '80px' }} /> */}
// 						</div>
// 						<Row>
// 							<Col xs={0} sm={0} md={0} lg={20}>
// 								<div
// 									style={{
// 										minHeight: 'calc(100vh - 150px)', // Ensure the content has enough height
// 										display: 'flex',
// 										flexDirection: 'column',
// 										justifyContent: 'center',
// 									}}
// 								>
// 									<img
// 										className="img-fluid mb-5"
// 										src="/img/others/img-19.png"
// 										alt=""
// 									/>
// 									<div>
// 										{/* <img
// 											// src="/img/ukpe_logo.png"
// 											src={`/img/${workspace}/logo_light.png`}
// 											alt={`${workspace}`} style={{ height: '30px' }} /> */}
// 										<img
// 											src={`/img/${workspace}/logo_light.png`}
// 											alt={`${workspace}`}
// 											style={{ height: '30px' }}
// 											onError={(e) => {
// 												e.target.style.display = 'none'; // Hide the image
// 												e.target.nextSibling.style.display = 'block'; // Show the h1 element
// 											}}
// 										/>
// 										<h1 style={{ display: 'none', fontSize: '20px', margin: 0 }}>{name}</h1>
// 									</div>
// 									<br /><br /><br /><br />
// 									<h3 className="text-white">
// 										IBCN 2025, BENGALURU  
// 									</h3>
// 									<br />
// 									<p>
// 										&rdquo;A leading consultant focused in supporting clients to deliver cost
// 										effective and smart design solutions for their investments on energy networks
// 										of the future.&rdquo;
// 									</p>
// 								</div>
// 							</Col>
// 						</Row>
// 						<div
// 							className="d-none d-lg-flex flex-column justify-content-end pb-4"
// 							style={{
// 								position: 'absolute',
// 								bottom: '10px',
// 								width: '100%',
// 							}}
// 						>
// 							<div>
// 								{/* <span
// 									className="d-block"
// 									style={{
// 										color: 'white',
// 										textAlign: 'left',
// 									}}
// 								>
// 									Copyright © Claritiz 2024. All rights reserved.
// 								</span> */}
// 								{/* <span
// 									className="d-block"
// 									style={{
// 										color: 'white',
// 										textAlign: 'left',
// 									}}
// 								>
// 									Developed by{' '}
// 									<a
// 										href="https://www.claritiz.com"
// 										target="_blank"
// 										rel="noopener noreferrer"
// 										style={{
// 											color: 'white',
// 											fontWeight: '600',
// 										}}
// 									>
// 										www.claritiz.com
// 									</a>
// 								</span> */}
// 							</div>
// 						</div>
// 					</div>
// 				</Col>
// 			</Row>
// 		</div>

// 	);
// };

// export default SurveyLayout;




// import React from "react";
// import { Row, Col } from "antd";
// import { useSelector } from "react-redux";

// const backgroundURL = "/img/subscribe3.jpg";
// const backgroundStyle = {
//   backgroundImage: `url(${backgroundURL})`,
//   backgroundRepeat: "no-repeat",
//   backgroundSize: "cover",
//   height: "100vh",
//   width: "100vw",
//   position: "fixed",
//   top: 0,
//   left: 0,
//   zIndex: -1
// };

// const Layout = ({ children }) => {
//   const theme = useSelector((state) => state.theme.currentTheme);

//   return (
//     <div className="h-100">
//       <div style={backgroundStyle}></div>
//       <Row justify="center" align="middle" className="h-100">
//         <Col xs={24} sm={20} md={24} lg={24}>
//           <div 
//             style={{
//               maxWidth: '600px',
//               width: '100%',
//               height: '100%',
//               backgroundColor: theme === "light" ? "white" : "#333",
//               color: theme === "light" ? "black" : "white",
//               display: 'flex',
//               flexDirection: 'column',
//               justifyContent: 'center',
// 			  padding: '30px 40px 60px 40px'
//             }}
//           >
//             {children}
//           </div>
//         </Col>
//       </Row>
//     </div>
//   );
// };

// export default Layout;


// import React from "react";
// import { Row, Col } from "antd";
// import { useSelector } from "react-redux";

// // const backgroundURL = "/img/subscribe3.jpg";
// // const backgroundStyle = {
// //   backgroundImage: `url(${backgroundURL})`,
// //   backgroundRepeat: "no-repeat",
// //   backgroundSize: "cover",
// //   position: "fixed",
// //   top: 0,
// //   left: 0,
// //   width: "100vw",
// //   height: "100vh",
// //   zIndex: -1
// // };

// const backgroundURL = "/img/subscribe3.jpg";
// const backgroundStyle = {
//   position: "fixed",
//   top: 0,
//   left: 0,
//   width: "100vw",
//   height: "100vh",
//   zIndex: -1,
//   backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${backgroundURL})`,
//   backgroundRepeat: "no-repeat",
//   backgroundSize: "cover",
// };

// const Layout = ({ children }) => {
//   const theme = useSelector((state) => state.theme.currentTheme);

//   return (
//     <div className="h-100">
//       <div style={backgroundStyle}></div>
//       <Row justify="center" align="top" className="h-100">
//         <Col xs={24} sm={20} md={24} lg={16}>
//           <div 
//             style={{
//               maxWidth: '768px',
//               width: '100%',
//               minHeight: '100vh', // Ensures at least full viewport height
//               backgroundColor: theme === "light" ? "white" : "#333",
//               color: theme === "light" ? "black" : "white",
//               paddingTop: '30px', // Top padding
//               paddingRight: '40px',
//               paddingBottom: '60px', // Bottom padding
//               paddingLeft: '40px',
//               position: 'relative',
//               zIndex: 1
//             }}
//           >
//             {children}
//           </div>
//         </Col>
//       </Row>
//     </div>
//   );
// };

// export default Layout;



// import React from "react";
// import { Row, Col } from "antd";
// import { useSelector } from "react-redux";
// import { store } from "store";

// // const backgroundURL = "/img/subscribe3.jpg";
// // const backgroundStyle = {
// //   backgroundImage: `url(${backgroundURL})`,
// //   backgroundRepeat: "no-repeat",
// //   backgroundSize: "cover",
// // };

// const state = store.getState();

// const SurveyLayout = ({ children }) => {
//   const theme = useSelector((state) => state.theme.currentTheme);
//   const { session, selectedOrganization, selectedUser, defaultOrganization } = useSelector((state) => state.auth);
//   const workspace = session?.user?.organization?.app_settings?.workspace || defaultOrganization?.app_settings?.workspace || 'dev';
//   const name = session?.user?.organization?.app_settings?.name || defaultOrganization?.app_settings?.name || 'dev';

//   // Determine if it's a mobile device based on screen width
//   const isMobile = window.innerWidth <= 768; // Adjust breakpoint as needed

//   return (
//     <div className={`h-100 ${theme === "light" ? "bg-white" : ""}`}>
//       <Row justify="center" className="align-items-stretch h-100">
//         <Col xs={24} sm={24} md={isMobile ? 24 : 20} lg={isMobile ? 24 : 16}> {/* Conditional width */}
//           <div className="container d-flex flex-column justify-content-center h-100">
//             <Row justify="center" >
//               <Col xs={24} sm={24} md={20} lg={24} xl={24}>
//                 {children}
//               </Col>
//             </Row>
//           </div>
//         </Col>
//         {/* Conditionally render the right side content */}
//         {!isMobile && ( // Only show on larger screens
//           <Col xs={0} sm={0} md={0} lg={8} xl={8}>
//             <div
//               className="d-flex flex-column h-100 px-4"
//               // style={{
//               //   ...backgroundStyle,
//               //   position: 'fixed',
//               //   top: 0,
//               //   right: 0,
//               //   height: '100vh',
//               //   overflowY: 'auto',
//               //   width: '30vw', // or a percentage, e.g., '25%'
//               // }}
//             >
//               {/* ... (rest of the right side content remains the same) */}
//               <div className="text-right">
//                 {/* <img src="/img/knba.png" alt="logo" style={{ height: '80px' }} /> */}
//               </div>
//               <Row>
//                 <Col xs={0} sm={0} md={0} lg={20}>
//                   <div
//                     style={{
//                       minHeight: 'calc(100vh - 150px)', // Ensure the content has enough height
//                       display: 'flex',
//                       flexDirection: 'column',
//                       justifyContent: 'center',
//                     }}
//                   >
//                     <img loading="lazy"
//                       className="img-fluid mb-5"
//                       src="/img/others/img-19.png"
//                       alt=""
//                     />
//                     <div>
//                       {/* <img
//                       // src="/img/ukpe_logo.png"
//                       src={`/img/${workspace}/logo_light.png`}
//                       alt={`${workspace}`} style={{ height: '30px' }} /> */}
//                       <img loading="lazy"
//                         src={`/img/${workspace}/logo_light.png`}
//                         alt={`${workspace}`}
//                         style={{ height: '30px' }}
//                         onError={(e) => {
//                           e.target.style.display = 'none'; // Hide the image
//                           e.target.nextSibling.style.display = 'block'; // Show the h1 element
//                         }}
//                       />
//                       <h1 style={{ display: 'none', fontSize: '20px', margin: 0 }}>{name}</h1>
//                     </div>
//                     <br /><br /><br /><br />
//                     <h3 className="text-white">
//                       IBCN 2025, BENGALURU
//                     </h3>
//                     <br />
//                     <p>
//                       &rdquo;Enhancing Nagarathar Businesses Through Technology&rdquo;
//                     </p>
//                   </div>
//                 </Col>
//               </Row>
//               <div
//                 className="d-none d-lg-flex flex-column justify-content-end pb-4"
//                 style={{
//                   position: 'absolute',
//                   bottom: '10px',
//                   width: '100%',
//                 }}
//               >
//                 <div>
//                   {/* <span
//                   className="d-block"
//                   style={{
//                     color: 'white',
//                     textAlign: 'left',
//                   }}
//                 >
//                   Copyright © Claritiz 2024. All rights reserved.
//                 </span> */}
//                   {/* <span
//                   className="d-block"
//                   style={{
//                     color: 'white',
//                     textAlign: 'left',
//                   }}
//                 >
//                   Developed by{' '}
//                   <a
//                     href="https://www.claritiz.com"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     style={{
//                       color: 'white',
//                       fontWeight: '600',
//                     }}
//                   >
//                     www.claritiz.com
//                   </a>
//                 </span> */}
//                 </div>
//               </div>
//             </div>
//           </Col>
//         )}
//       </Row>
//     </div>
//   );
// };

// export default SurveyLayout;
import React, { useEffect, useState, useRef } from "react";
import { Row, Col } from "antd";
import { useSelector } from "react-redux";
import { store } from "store";
import { motion, AnimatePresence } from "framer-motion";

const state = store.getState();

// Utility: Enhanced iOS detection
const isIOS = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
  const isSafari = /safari/.test(userAgent) && !/crios|chrome|fxios|edgios/.test(userAgent); // Exclude Chrome, Firefox, Edge on iOS
  return isIOSDevice && isSafari;
};

const isInStandaloneMode = () =>
  "standalone" in window.navigator && window.navigator.standalone ||
  window.matchMedia("(display-mode: standalone)").matches;

// Shared animation variants for modal and banner
const slideVariants = {
  initial: { y: -100, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -100, opacity: 0 },
};

// Shared transition settings
const transitionSettings = {
  duration: 0.3,
  ease: "easeInOut",
};

// Shared styles for modal and banner
const commonStyles = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  width: "100%",
  zIndex: 1000,
  textAlign: "center",
};

const SurveyLayout = ({ children }) => {
  const theme = useSelector((state) => state.theme.currentTheme);
  const { session, selectedOrganization, selectedUser, defaultOrganization } = useSelector((state) => state.auth);

  const workspace = session?.user?.organization?.app_settings?.workspace || defaultOrganization?.app_settings?.workspace || "dev";
  const name = session?.user?.organization?.app_settings?.name || defaultOrganization?.app_settings?.name || "dev";

  const [showInstallButton, setShowInstallButton] = useState(false);
  const deferredPromptRef = useRef(null);
  const [isPromptVisible, setIsPromptVisible] = useState(false);
  const [isBanner, setIsBanner] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  // Check if the app is already installed
  const isAppInstalled = () => {
    const isStandalone = isInStandaloneMode();
    console.log("[isAppInstalled] Standalone:", isStandalone);
    return isStandalone;
  };

  // Calculate dynamic height based on mode
  const layoutHeight = isAppInstalled() ? "100%" : "calc(100% - 30px)";

  // Detect if the device is iOS and using Safari
  useEffect(() => {
    const ios = isIOS();
    setIsIOSDevice(ios);
    console.log("[useEffect] Is iOS device (Safari):", ios);
  }, []);

  // Handle the beforeinstallprompt event for non-iOS devices
  useEffect(() => {
    if (!isIOSDevice) {
      const handleBeforeInstallPrompt = (e) => {
        e.preventDefault();
        console.log("[Install Prompt] beforeinstallprompt fired");
        deferredPromptRef.current = e;
        setShowInstallButton(true);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }
  }, [isIOSDevice]);

  // Control modal and banner visibility
  useEffect(() => {
    const dismissed = localStorage.getItem("installPromptDismissed") === "true";
    const installed = isAppInstalled();

    console.log("[useEffect] Dismissed:", dismissed, "Installed:", installed, "iOS:", isIOSDevice);

    if (installed) {
      setIsPromptVisible(false);
      setIsBanner(false);
      setIsDismissed(false);
      localStorage.removeItem("installPromptDismissed");
    } else {
      if (isIOSDevice) {
        // Show iOS prompt or banner
        if (dismissed) {
          setIsPromptVisible(false);
          setIsBanner(true);
        } else {
          setIsPromptVisible(true);
          setIsBanner(false);
        }
      } else if (showInstallButton) {
        // Show Android prompt or banner
        if (dismissed) {
          setIsPromptVisible(false);
          setIsBanner(true);
        } else {
          setIsPromptVisible(true);
          setIsBanner(false);
        }
      } else {
        setIsPromptVisible(false);
        setIsBanner(false);
      }
    }
  }, [isIOSDevice, showInstallButton]);

  // Reset dismissal state if app is installed
  useEffect(() => {
    if (isAppInstalled()) {
      localStorage.removeItem("installPromptDismissed");
    }
  }, []);

  // Handle collapsing the prompt into a banner
  const handleCollapse = () => {
    console.log("[handleCollapse] Collapsing prompt into banner");
    setIsPromptVisible(false);
    setIsBanner(true);
    setIsDismissed(true);
    localStorage.setItem("installPromptDismissed", "true");
  };

  // Handle install click
  const handleInstallClick = async () => {
    if (isIOSDevice) {
      alert("To install the app on your iPhone, tap the Share button in Safari and select 'Add to Home Screen'.");
      handleCollapse();
    } else if (deferredPromptRef.current) {
      console.log("[handleInstallClick] Triggering install prompt");
      deferredPromptRef.current.prompt();
      const choiceResult = await deferredPromptRef.current.userChoice;
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
        setIsPromptVisible(false);
        setIsBanner(false);
        localStorage.removeItem("installPromptDismissed");
      } else {
        console.log("User dismissed the install prompt");
        handleCollapse();
      }
      deferredPromptRef.current = null;
      setShowInstallButton(false);
    } else {
      // Fallback for non-iOS, non-PWA-supporting browsers (e.g., Chrome on iOS)
      alert("To install this app, please use a browser that supports installation, such as Safari on iOS or Chrome on Android.");
      handleCollapse();
    }
  };

  return (
    <div className={`h-100 ${theme === "light" ? "bg-white" : ""}`} style={{ height: layoutHeight }}>
      <Row justify="center" className="align-items-stretch" style={{ height: "100%" }}>
        <Col xs={24}>
          <div
            className="container d-flex flex-column justify-content-center h-100"
            style={{
              width: "100%",
              maxWidth: "468px",
              margin: "0 auto",
              padding: "0 16px",
              boxSizing: "border-box",
              position: "relative",
            }}
          >
            <AnimatePresence>
              {(isPromptVisible || isBanner) && !isAppInstalled() && (
                <>
                  {isPromptVisible && !isBanner && (
                    <motion.div
                      variants={slideVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={transitionSettings}
                      style={{
                        ...commonStyles,
                        background: "#fff",
                        borderRadius: "0",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                        padding: "1rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <img
                            src="img/ibcn/ibcn.png"
                            alt="App Icon"
                            style={{ width: "40px", height: "40px", marginRight: "10px" }}
                          />
                          <div>
                            <strong>IBCN NetworkX</strong>
                            <div style={{ fontSize: "12px", color: "#666" }}>app.ibcn2025.com</div>
                          </div>
                        </div>
                        <button
                          onClick={handleCollapse}
                          style={{ background: "none", border: "none", fontSize: "16px", cursor: "pointer" }}
                        >
                          ✕
                        </button>
                      </div>
                      <div
                        onClick={handleInstallClick}
                        style={{
                          marginTop: "10px",
                          padding: "12px",
                          background: "#1890ff",
                          borderRadius: "5px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span style={{ marginRight: "8px", fontSize: "20px", color: "#fff" }}>⬇</span>
                        <span style={{ color: "#fff", fontSize: "16px" }}>
                          {isIOSDevice ? "Tap for Install Instructions" : "Tap to Install"}
                        </span>
                      </div>
                    </motion.div>
                  )}
                  {isBanner && (
                    <motion.div
                      variants={slideVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={transitionSettings}
                      style={{
                        ...commonStyles,
                        background: "#1890ff",
                        padding: "12px",
                        cursor: "pointer",
                      }}
                      onClick={handleInstallClick}
                    >
                      <span style={{ color: "#fff", fontSize: "16px", fontWeight: "bold" }}>
                        Install IBCN App
                      </span>
                    </motion.div>
                  )}
                </>
              )}
            </AnimatePresence>
            {children}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default SurveyLayout;
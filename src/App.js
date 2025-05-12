/** @jsxImportSource @emotion/react */
import React, { useState, useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store";
import { ConfigProvider, Layout, Grid, Row, Col } from "antd";
import { StyleProvider } from "@ant-design/cssinjs";
import HeaderNav from "./components/layout-components/HeaderNav";
import SideNav from "./components/layout-components/SideNav";
import Login from "./views/auth-views/authentication/login";
import Dashboard from "./views/pages/ib/Schedule";
import Pass from "./views/pages/ib/Ticket";
import styled from "@emotion/styled";
import { TEMPLATE } from "./constants/ThemeConstant";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { setSession } from "./store/slices/authSlice";
import { supabase } from "./configs/SupabaseConfig";

const { Content } = Layout;
const { useBreakpoint } = Grid;

// AppLayout styles
const AppContent = styled("div")`
  padding: ${TEMPLATE.LAYOUT_CONTENT_GUTTER}px;
  margin-top: ${TEMPLATE.HEADER_HEIGHT}px;
  min-height: calc(100vh - ${TEMPLATE.CONTENT_HEIGHT_OFFSET}px);
  position: relative;

  @media (max-width: 991px) {
    padding: ${TEMPLATE.LAYOUT_CONTENT_GUTTER_SM}px;
  }
`;

// SurveyLayout styles
const slideVariants = {
  initial: { y: -100, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -100, opacity: 0 },
};

const transitionSettings = {
  duration: 0.3,
  ease: "easeInOut",
};

const commonStyles = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  width: "100%",
  zIndex: 1000,
  textAlign: "center",
};

// AppLayout component
const AppLayout = ({ children }) => {
  const screens = useBreakpoint();
  const isMobile = !screens.lg;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <HeaderNav isMobile={isMobile} />
      <Layout>
        {!isMobile && <SideNav />}
        <Layout style={{ paddingLeft: isMobile ? 0 : TEMPLATE.SIDE_NAV_WIDTH }}>
          <AppContent>
            <Content className="h-100">{children}</Content>
          </AppContent>
        </Layout>
      </Layout>
    </Layout>
  );
};

// SurveyLayout component
const SurveyLayout = ({ children }) => {
  const theme = useSelector((state) => state.theme.currentTheme);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const deferredPromptRef = useRef(null);
  const [isPromptVisible, setIsPromptVisible] = useState(false);
  const [isBanner, setIsBanner] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [appIsInstalled, setAppIsInstalled] = useState(false);

  const isIOS = () => /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());

  const isAppInstalled = () => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator && window.navigator.standalone);
    const isIOSNonSafari = isIOS() && !/safari/i.test(window.navigator.userAgent.toLowerCase());
    return isStandalone || isIOSNonSafari;
  };

  const layoutHeight = appIsInstalled ? "100%" : "calc(100% - 30px)";

  useEffect(() => {
    setIsIOSDevice(isIOS());
  }, []);

  useEffect(() => {
    const checkInstallation = () => {
      const installed = isAppInstalled();
      setAppIsInstalled(installed);
      if (installed) {
        setIsPromptVisible(false);
        setIsBanner(false);
        setIsDismissed(false);
        setShowInstallButton(false);
        localStorage.removeItem("installPromptDismissed");
      }
    };

    checkInstallation();
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleMediaChange = () => checkInstallation();
    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      setShowInstallButton(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    if (appIsInstalled) {
      setIsPromptVisible(false);
      setIsBanner(false);
      setIsDismissed(false);
      setShowInstallButton(false);
      localStorage.removeItem("installPromptDismissed");
      return;
    }

    const dismissed = localStorage.getItem("installPromptDismissed") === "true";
    if (dismissed) {
      setIsPromptVisible(false);
      setIsBanner(true);
      setIsDismissed(true);
    } else {
      setIsPromptVisible(isIOSDevice || !isIOSDevice);
      setIsBanner(false);
      setIsDismissed(false);
    }
  }, [isIOSDevice, appIsInstalled]);

  const handleCollapse = () => {
    setIsPromptVisible(false);
    setIsBanner(true);
    setIsDismissed(true);
    localStorage.setItem("installPromptDismissed", "true");
  };

  const handleInstallClick = async () => {
    if (appIsInstalled) {
      setIsPromptVisible(false);
      setIsBanner(false);
      return;
    }

    if (isIOSDevice) {
      alert("To install the app on your iPhone, tap the Share button in Safari and select 'Add to Home Screen'.");
      handleCollapse();
    } else if (deferredPromptRef.current) {
      deferredPromptRef.current.prompt();
      const { outcome } = await deferredPromptRef.current.userChoice;
      if (outcome === "accepted") {
        setIsPromptVisible(false);
        setIsBanner(false);
        setAppIsInstalled(true);
        localStorage.removeItem("installPromptDismissed");
      } else {
        handleCollapse();
      }
      deferredPromptRef.current = null;
      setShowInstallButton(false);
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
              {(isPromptVisible || isBanner) && !appIsInstalled && (
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
                            src="/img/ibcn/ibcn.png"
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

// Main App component
function App() {
  return (
    <StyleProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ConfigProvider>
            <BrowserRouter>
              <AppContentWrapper />
            </BrowserRouter>
          </ConfigProvider>
        </PersistGate>
      </Provider>
    </StyleProvider>
  );
}

// Separate component to use useSelector and handle Supabase auth
const AppContentWrapper = () => {
  const { session, selectedOrganization, selectedUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const APP_PREFIX_PATH = "/app";

  useEffect(() => {
    const fetchUserData = async (session) => {
      if (!session || !session.user) return;
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*,organization:organization_id (*),features:role_id (feature)")
        .eq("id", selectedUser?.id || session.user.id)
        .single();

      if (userError) {
        if (userError?.code === "PGRST116") {
          dispatch(setSession());
          navigate(`${APP_PREFIX_PATH}/login`);
        }
        console.error("Error fetching user data:", userError);
        return;
      }

      const updatedSession = {
        ...session,
        user: {
          ...userData,
          ...(selectedOrganization && {
            organization: selectedOrganization,
            organization_id: selectedOrganization.id,
          }),
        },
      };
      dispatch(setSession(updatedSession));
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchUserData(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Supabase Event", _event, session);
      if (session) fetchUserData(session);
    });

    return () => subscription.unsubscribe();
  }, [selectedOrganization, selectedUser, dispatch, navigate]);

  const PublicRoute = ({ children }) => {
    return session ? <Navigate to={`${APP_PREFIX_PATH}/dashboard`} replace /> : <SurveyLayout>{children}</SurveyLayout>;
  };

  const ProtectedRoute = ({ children }) => {
    return session ? <AppLayout>{children}</AppLayout> : <Navigate to={`${APP_PREFIX_PATH}/login`} replace />;
  };

  return (
    <Routes>
      <Route path={`${APP_PREFIX_PATH}/login`} element={<PublicRoute><Login /></PublicRoute>} />
      <Route path={`${APP_PREFIX_PATH}/dashboard`} element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path={`${APP_PREFIX_PATH}/pass`} element={<ProtectedRoute><Pass /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to={`${APP_PREFIX_PATH}/login`} replace />} />
      <Route path="*" element={<Navigate to={`${APP_PREFIX_PATH}/dashboard`} replace />} />
    </Routes>
  );
};

export default App;
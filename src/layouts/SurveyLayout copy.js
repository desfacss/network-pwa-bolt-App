import React, { useState, useEffect } from "react";
import { Row, Col, Button } from "antd";
import { useSelector } from "react-redux";
import { isMobile, isTablet } from "react-device-detect";

const isSmallDevice = isMobile || isTablet;

const SurveyLayout = ({ children }) => {
  const theme = useSelector((state) => state.theme.currentTheme);
  const { session, defaultOrganization } = useSelector((state) => state.auth);

  const workspace =
    session?.user?.organization?.app_settings?.workspace ||
    defaultOrganization?.app_settings?.workspace ||
    "dev";
  const name =
    session?.user?.organization?.app_settings?.name ||
    defaultOrganization?.app_settings?.name ||
    "dev";

  const [showInstallModal, setShowInstallModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIosDevice, setIsIosDevice] = useState(false);

  // Detect iOS devices
  const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase());
  const isInStandaloneMode = () =>
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && window.navigator.standalone);

  useEffect(() => {
    // Only show modal on mobile devices
    if (!isSmallDevice || isInStandaloneMode()) {
      return;
    }

    // Detect iOS
    setIsIosDevice(isIos());

    // Android and Desktop PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Show modal after a 2-second delay
    const timer = setTimeout(() => {
      setShowInstallModal(true);
    }, 2000);

    // Cleanup
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
        setShowInstallModal(false);
        setDeferredPrompt(null);
      } else {
        console.log("User dismissed the install prompt");
      }
    }
  };

  const handleCloseModal = () => {
    setShowInstallModal(false);
  };

  return (
    <div className={`h-100 ${theme === "light" ? "bg-white" : ""}`}>
      {/* Sticky Banner */}
      <div
        style={{
          width: "100%",
          backgroundColor: "#1890ff",
          color: "white",
          textAlign: "center",
          padding: "10px 0",
          fontWeight: "bold",
          fontSize: "16px",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <span>
          {name?.toUpperCase()} {workspace !== "prod" && `(${workspace})`}
        </span>
      </div>

      <Row justify="center" className="align-items-stretch h-100">
        <Col xs={24}>
          <div
            style={{
              width: "100%",
              maxWidth: isSmallDevice ? "100%" : "568px",
              margin: "0 auto",
              padding: "0 16px",
              boxSizing: "border-box",
            }}
          >
            {children}
          </div>
        </Col>
      </Row>

      {/* Install Modal */}
      {showInstallModal && isSmallDevice && !isInStandaloneMode() && (
        <div className="install-modal-backdrop">
          <div className="install-modal">
            <div className="modal-content">
              <h3>Install {name} App</h3>
              {isIosDevice ? (
                <p>
                  Tap the <strong>Share</strong> icon in Safari, then select{" "}
                  <strong>Add to Home Screen</strong> to install the app.
                </p>
              ) : (
                <p>
                  Install our app for a better experience. Click below to add it to
                  your home screen.
                </p>
              )}
              {!isIosDevice && deferredPrompt && (
                <Button
                  className="install-button"
                  onClick={handleInstallClick}
                >
                  Install Now
                </Button>
              )}
              <Button
                className="close-button"
                onClick={handleCloseModal}
              >
                Not Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyLayout;
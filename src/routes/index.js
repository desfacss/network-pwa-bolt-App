import React, { useEffect, useMemo, useState } from "react";
import { Routes as RouterRoutes, Route, Navigate, useLocation } from "react-router-dom";
import { AUTHENTICATED_ENTRY } from "configs/AppConfig";
import { protectedRoutes, publicRoutes } from "configs/RoutesConfig";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import AppRoute from "./AppRoute";
import { useSelector } from "react-redux";

const Routes = () => {
  const location = useLocation();
  const { session } = useSelector((state) => state.auth);
  const [filteredProtectedRoutes, setFilteredProtectedRoutes] = useState([]);

  // Analytics tracking hook
  useEffect(() => {
    const pagePath = location.pathname + location.search;

    // Google Analytics (GA4)
    if (window.gtag) {
      window.gtag('config', 'G-3JBKDV7VP0', { page_path: pagePath });
    }

    // Hotjar
    if (window.hj) {
      window.hj('vpv', pagePath);
    }

    // Inspectlet
    if (window.__insp) {
      window.__insp.push(['tagSession', { page: pagePath }]);
    }
  }, [location]); // Trigger on every route change

  // Filter protected routes based on session
  useEffect(() => {
    setFilteredProtectedRoutes(
      protectedRoutes(session?.user?.features?.feature, session?.user?.organization?.module_features)
    );
  }, [session]);

  // Determine the fallback path
  const fallbackPath = useMemo(() => {
    const isValidPath = protectedRoutes(session?.user?.features?.feature, session?.user?.organization?.module_features)?.some(
      route => {
        const routeSegments = route.path.split('/');
        const pathSegments = location.pathname.split('/');
        if (routeSegments.length !== pathSegments.length) return false;
        for (let i = 0; i < routeSegments.length; i++) {
          if (routeSegments[i].startsWith(':') || routeSegments[i] === pathSegments[i]) {
            continue;
          }
          return false;
        }
        return true;
      }
    );
    return isValidPath ? location.pathname : "/app/dashboard";
  }, [location.pathname, session]);

  return (
    <RouterRoutes>
      <Route path="/" element={<ProtectedRoute />}>
        <Route index element={<Navigate replace to="/app/dashboard" />} />
        {filteredProtectedRoutes?.map((route, index) => (
          <Route
            key={route?.key + index}
            path={route?.path}
            element={
              <AppRoute
                routeKey={route?.key}
                component={route?.component}
                {...route?.meta}
              />
            }
          />
        ))}
        <Route path="*" element={<Navigate to={fallbackPath} replace />} />
      </Route>
      <Route path="/" element={<PublicRoute />}>
        {publicRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <AppRoute
                routeKey={route.key}
                component={route.component}
                {...route.meta}
              />
            }
          />
        ))}
      </Route>
    </RouterRoutes>
  );
};

export default Routes;
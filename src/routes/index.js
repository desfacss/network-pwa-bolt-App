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
  const [filteredProtectedRoutes, setFilteredProtectedRoutes] = useState()

  useEffect(() => {
    setFilteredProtectedRoutes(protectedRoutes(session?.user?.features?.feature))
  }, [session])

  // Determine the fallback path
  const fallbackPath = useMemo(() => {
    const isValidPath = protectedRoutes(session?.user?.features?.feature)?.some(
      (route) => route?.path === location?.pathname
    );
    return isValidPath ? location?.pathname : "/app/dashboard";
  }, [location?.pathname]);

  return (
    <RouterRoutes>
      {/* <Route path="/" element={<Navigate replace to={'survey'} />} /> */}
      <Route path="/" element={<ProtectedRoute />}>
        {/* <Route
          path="/"
          // element={<Navigate replace to={AUTHENTICATED_ENTRY} />}
          element={<Navigate replace to={'app/profile'} />}
        /> */}
        {filteredProtectedRoutes?.map((route, index) => {
          return (
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
          );
        })}
        <Route path="*" element={<Navigate to={fallbackPath} replace />} />
      </Route>
      <Route path="/" element={<PublicRoute />}>
        {publicRoutes.map((route) => {
          return (
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
          );
        })}
      </Route>
    </RouterRoutes>
  );
};

export default Routes;

import React, { lazy, Suspense, memo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ConfigProvider } from "antd";
import Loading from "components/shared-components/Loading";
import { lightTheme, darkTheme } from "configs/ThemeConfig";
import { resources } from "lang";
import useBodyClass from "utils/hooks/useBodyClass";
import Routes from "routes";
import { supabase } from "configs/SupabaseConfig";
import { useLocation, useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import enGB from "antd/lib/locale/en_GB";
import { store } from "store";
import { fetchDefaultOrganization, setSession } from "store/slices/authSlice";
import { REACT_APP_WORKSPACE } from "configs/AppConfig";

const currentAppLocale = enGB;

const AppLayout = lazy(() => import("./AppLayout"));
const AuthLayout = lazy(() => import("./AuthLayout"));
const SurveyLayout = lazy(() => import("./SurveyLayout"));

const Layouts = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const { session, selectedOrganization, selectedUser, defaultOrganization } = useSelector((state) => state.auth);
  console.log("default org", defaultOrganization);

  useEffect(() => {
    if (!session) {
      dispatch(fetchDefaultOrganization());
    }
  }, [session]);

  useEffect(() => {
    document.title = session?.user?.organization?.app_settings?.name || REACT_APP_WORKSPACE || "dev";
  }, [session]);

  useEffect(() => {
    const fetchUserData = async (session) => {
      if (!session || !session.user) return;

      // Fetch user data from the users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, user_name, details, additional_details, relationships, base_role, created_at, updated_at, auth_id")
        .eq("auth_id", selectedUser?.id || session.user.id)
        .single();

      if (userError) {
        if (userError?.code === "PGRST116") {
          store.dispatch(setSession());
          navigate(`${APP_PREFIX_PATH}/login`);
        }
        console.error("Error fetching user data:", userError);
        return;
      }

      // Fetch organization and role data from user_organizations
      const { data: userOrgData, error: userOrgError } = await supabase
        .from("user_organizations")
        .select(`
          organization:organization_id (*),
          role:role_id (feature),
          details,
          created_at,
          updated_at
        `)
        .eq("user_id", userData.id)
        .maybeSingle(); // Use .single() if you want only one organization; otherwise, adjust logic for multiple

      if (userOrgError) {
        console.error("Error fetching user_organizations data:", userOrgError);
        return;
      }

      // Construct the updated session object
      const updatedSession = {
        ...session,
        user: {
          ...userData,
          ...(userOrgData && {
            organization: userOrgData.organization,
            organization_id: userOrgData.organization?.id,
            features: userOrgData.role?.feature, // Assuming 'feature' is the role detail you need
          }),
          ...(selectedOrganization && {
            organization: selectedOrganization,
            organization_id: selectedOrganization.id,
          }),
        },
      };

      console.log("Session", updatedSession);
      store.dispatch(setSession(updatedSession));
    };

    // Get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserData(session);
      }
    });

    // Listen for authentication state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Supabase Event", _event, session);
      if (session) {
        fetchUserData(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, selectedOrganization, selectedUser]);

  const blankLayout = useSelector((state) => state.theme.blankLayout);
  const Layout = location.pathname.startsWith("/survey") || !session ? SurveyLayout : AppLayout;

  const locale = useSelector((state) => state.theme.locale);
  const direction = useSelector((state) => state.theme.direction);
  const currentTheme = useSelector((state) => state.theme.currentTheme);

  useBodyClass(`dir-${direction}`);

  const themeConfig = currentTheme === "light" ? { ...lightTheme } : { ...darkTheme };

  return (
    <ConfigProvider
      theme={{
        ...themeConfig,
        components: {
          datePicker: {
            format: "DD-MM-YYYY",
          },
        },
      }}
      direction={direction}
      locale={currentAppLocale.antd}
    >
      <Suspense fallback={<Loading cover="content" />}>
        <Layout>
          <Routes />
        </Layout>
      </Suspense>
    </ConfigProvider>
  );
};

export default memo(Layouts);
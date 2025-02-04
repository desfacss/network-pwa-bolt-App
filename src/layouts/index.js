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
import { APP_PREFIX_PATH } from 'configs/AppConfig'
// import { supabase } from "configs/SupabaseConfig";

import enGB from 'antd/lib/locale/en_GB';
import { store } from "store";
import { fetchDefaultOrganization, setSession } from "store/slices/authSlice";
import { REACT_APP_WORKSPACE } from "configs/AppConfig";

const currentAppLocale = enGB;

const AppLayout = lazy(() => import("./AppLayout"));
const AuthLayout = lazy(() => import("./AuthLayout"));
const SurveyLayout = lazy(() => import("./SurveyLayout"));
const Layouts = () => {
  const dispatch = useDispatch()
  const location = useLocation();
  const navigate = useNavigate();

  const { session, selectedOrganization, selectedUser, defaultOrganization } = useSelector((state) => state.auth);
  console.log("default org", defaultOrganization)
  useEffect(() => {
    // Fetch default organization if no session exists
    if (!session) {
      dispatch(fetchDefaultOrganization());
    }

  }, [session]);

  useEffect(() => {
    // Set the title dynamically
    document.title = session?.user?.organization?.app_settings?.name || REACT_APP_WORKSPACE || 'dev';
  }, [session]);

  useEffect(() => {
    // Fetch the session and user data
    const fetchUserData = async (session) => {
      if (!session || !session.user) return;

      // Fetch user data from the users table
      const { data: userData, error: userError } = await supabase.from('users')
        // .select('*,location:location_id (*), hr:hr_id (*), manager:manager_id (*),organization:organization_id (*),features:role_type (feature)')
        .select('*,organization:organization_id (*),features:role_id (feature)')
        .eq('id', selectedUser?.id || session.user.id).single();

      if (userError) {
        if (userError?.code === "PGRST116") {
          store.dispatch(setSession())
          navigate(`${APP_PREFIX_PATH}/login`)
        }
        console.error('Error fetching user data:', userError);
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
      console.log("Session", updatedSession);

      // Dispatch the updated session to Redux
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
      console.log('Supabase Event', _event, session);
      if (session) {
        fetchUserData(session);
      }
    });

    // Cleanup subscription on component unmount
    return () => subscription.unsubscribe();
  }, [supabase, selectedOrganization, selectedUser]);

  // const { token, session } = useSelector((state) => state.auth);
  const blankLayout = useSelector((state) => state.theme.blankLayout);

  // const Layout = session && !blankLayout ? AppLayout : AuthLayout;
  // const Layout =
  //   location.pathname.startsWith("/survey") || !session || blankLayout
  //     ? AuthLayout
  //     : AppLayout;
  const Layout = location.pathname.startsWith("/survey") || !session ? SurveyLayout : AppLayout;

  const locale = useSelector((state) => state.theme.locale);

  const direction = useSelector((state) => state.theme.direction);

  const currentTheme = useSelector((state) => state.theme.currentTheme);

  // const currentAppLocale = resources[locale];

  useBodyClass(`dir-${direction}`);

  const themeConfig =
    currentTheme === "light" ? { ...lightTheme } : { ...darkTheme };

  const defaultDatePickerConfig = {
    DatePicker: {
      format: "DD-MM-YYYY",
    },
  };

  return (
    <ConfigProvider
      // theme={themeConfig}
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
    // datePicker={{ format: 'DD/MM/YYYY' }}
    >
      {/* <ConfigProvider
        componentDatePicker={defaultDatePickerConfig}

      > */}

      <Suspense fallback={<Loading cover="content" />}>
        <Layout>
          <Routes />
        </Layout>
      </Suspense>
      {/* </ConfigProvider> */}
    </ConfigProvider>
  );
};

export default memo(Layouts);

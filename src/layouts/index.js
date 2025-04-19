import React, { lazy, Suspense, memo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ConfigProvider } from "antd";
import Loading from "components/shared-components/Loading";
import { lightTheme, darkTheme } from "configs/ThemeConfig";
import { useLocation, useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH, REACT_APP_WORKSPACE } from 'configs/AppConfig';
import { store } from "store";
import useBodyClass from "utils/hooks/useBodyClass";

// Lazy load Routes and layouts
const Routes = lazy(() => import("routes"));
const AppLayout = lazy(() => import("./AppLayout"));
const AuthLayout = lazy(() => import("./AuthLayout"));
const SurveyLayout = lazy(() => import("./SurveyLayout"));

const Layouts = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const { session, selectedOrganization, selectedUser, defaultOrganization } = useSelector((state) => state.auth);

  const [currentAppLocale, setCurrentAppLocale] = useState(null);

  useEffect(() => {
    import('antd/lib/locale/en_GB').then(locale => {
      setCurrentAppLocale(locale.default);
    });
  }, []);

  useEffect(() => {
    if (!session) {
      import("store/slices/authSlice").then(({ fetchDefaultOrganization }) => {
        dispatch(fetchDefaultOrganization());
      });
    }
  }, [session]);

  useEffect(() => {
    document.title = session?.user?.organization?.app_settings?.name || REACT_APP_WORKSPACE || 'dev';
  }, [session]);

  useEffect(() => {
    const fetchUserData = async (session) => {
      if (!session || !session.user) return;
      const { supabase } = await import("configs/SupabaseConfig");
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*,organization:organization_id (*),features:role_id (feature)')
        .eq('id', selectedUser?.id || session.user.id)
        .single();

      if (userError) {
        if (userError?.code === "PGRST116") {
          import("store/slices/authSlice").then(({ setSession }) => {
            store.dispatch(setSession());
            navigate(`${APP_PREFIX_PATH}/login`);
          });
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
      import("store/slices/authSlice").then(({ setSession }) => {
        store.dispatch(setSession(updatedSession));
      });
    };

    import("configs/SupabaseConfig").then(({ supabase }) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) fetchUserData(session);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        console.log('Supabase Event', _event, session);
        if (session) fetchUserData(session);
      });

      return () => subscription.unsubscribe();
    });
  }, [selectedOrganization, selectedUser]);

  const blankLayout = useSelector((state) => state.theme.blankLayout);
  const Layout = location.pathname.startsWith("/survey") || !session ? SurveyLayout : AppLayout;

  const locale = useSelector((state) => state.theme.locale);
  const direction = useSelector((state) => state.theme.direction);
  const currentTheme = useSelector((state) => state.theme.currentTheme);

  useBodyClass(`dir-${direction}`);

  const themeConfig = currentTheme === "light" ? { ...lightTheme } : { ...darkTheme };

  if (!currentAppLocale) return <Loading cover="content" />;

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
      locale={currentAppLocale}
    >
      <Suspense fallback={<Loading cover="content" />}>
        <Layout>
          <Suspense fallback={<Loading cover="page" />}>
            <Routes />
          </Suspense>
        </Layout>
      </Suspense>
    </ConfigProvider>
  );
};

export default memo(Layouts);
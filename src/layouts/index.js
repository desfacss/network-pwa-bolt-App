import React, { lazy, Suspense, memo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { ConfigProvider } from "antd";
import Loading from "components/shared-components/Loading";
import { lightTheme, darkTheme } from "configs/ThemeConfig";
import { resources } from "lang";
import useBodyClass from "utils/hooks/useBodyClass";
import Routes from "routes";
import { supabase } from "configs/SupabaseConfig";
import { useLocation } from "react-router-dom";
// import { supabase } from "configs/SupabaseConfig";

import enGB from 'antd/lib/locale/en_GB';

const currentAppLocale = enGB;

const AppLayout = lazy(() => import("./AppLayout"));
const AuthLayout = lazy(() => import("./AuthLayout"));
const SurveyLayout = lazy(() => import("./SurveyLayout"));

const Layouts = () => {
  const location = useLocation();
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

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
      format: "DD/MM/YYYY",
    },
  };

  return (
    <ConfigProvider
      theme={themeConfig}
      direction={direction}
      locale={currentAppLocale.antd}
      datePicker={{ format: 'DD/MM/YYYY' }}
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

import {
  SIDE_NAV_LIGHT,
  NAV_TYPE_SIDE,
  DIR_LTR,
} from "constants/ThemeConstant";

export const REACT_APP_SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;
export const REACT_APP_SUPABASE_BASE_URL = process.env.REACT_APP_SUPABASE_BASE_URL;

export const REACT_APP_RESEND_API_KEY = process.env.REACT_APP_RESEND_API_KEY;
export const REACT_APP_RESEND_FROM_EMAIL = process.env.REACT_APP_RESEND_FROM_EMAIL;
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
export const REACT_APP_WORKSPACE = process.env.REACT_APP_WORKSPACE;
export const APP_NAME = "IBCN2025 NetworkX";
export const APP_PREFIX_PATH = "/app";
export const AUTH_PREFIX_PATH = "/auth";
export const SURVEY_PREFIX_PATH = "/survey";
export const REDIRECT_URL_KEY = "redirect";

export const AUTHENTICATED_ENTRY = `${APP_PREFIX_PATH}/dashboards/default`;
// export const AUTHENTICATED_ENTRY = `app/profile`;
export const UNAUTHENTICATED_ENTRY = "/login";

export const THEME_CONFIG = {
  navCollapsed: false,
  sideNavTheme: SIDE_NAV_LIGHT,
  locale: "en",
  navType: NAV_TYPE_SIDE,
  topNavColor: "#3e82f7",
  headerNavColor: "",
  mobileNav: false,
  currentTheme: "light",
  // currentTheme: "dark",
  direction: DIR_LTR,
  blankLayout: false,
};

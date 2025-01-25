import {
  SIDE_NAV_LIGHT,
  NAV_TYPE_SIDE,
  DIR_LTR,
} from "constants/ThemeConstant";

export const APP_NAME = "IBCN2025 NetworkX";
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
export const REACT_APP_WORKSPACE = process.env.REACT_APP_WORKSPACE;
export const APP_PREFIX_PATH = "/app";
export const AUTH_PREFIX_PATH = "/auth";
export const SURVEY_PREFIX_PATH = "/survey";
export const REDIRECT_URL_KEY = "redirect";
export const AUTHENTICATED_ENTRY = `${APP_PREFIX_PATH}/dashboards/default`;
// export const AUTHENTICATED_ENTRY = `app/profile`;
export const UNAUTHENTICATED_ENTRY = "/login";
export const SUPABASE_CLIENT_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuY2hrZXNsc3NicWltY2Vra3BvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODMwMDc0NTMsImV4cCI6MTk5ODU4MzQ1M30.MUzsmxLtYqf4hF2jMUSGYJV54zO3payL4J87PKwL8x0";

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

import { combineReducers } from "redux";
import theme from "./slices/themeSlice";
import auth from "./slices/authSlice";
import profile from "./slices/profileSlice";
import positions from "./slices/positionsSlice";

const rootReducer = combineReducers({
  theme,
  auth,
  profile,
  positions
});

export default rootReducer;

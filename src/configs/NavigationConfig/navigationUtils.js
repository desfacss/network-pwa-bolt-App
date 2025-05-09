// navigationUtils.js or configUtils.js

export const getNavigationConfig = (workspace) => {
    switch (workspace) {
        case "ibcn":
            return require("configs/NavigationConfig/IBCN").default;
        default:
            return require("configs/NavigationConfig/IBCN").default;
    }
};
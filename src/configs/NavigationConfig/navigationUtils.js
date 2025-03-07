// navigationUtils.js or configUtils.js

export const getNavigationConfig = (workspace) => {
    switch (workspace) {
        case "ibcn":
            return require("configs/NavigationConfig/IBCN").default;
        case "crm":
            return require("configs/NavigationConfig/CRM").default;
        default:
            return require("configs/NavigationConfig/Default").default;
    }
};
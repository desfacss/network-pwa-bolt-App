import { useState, useEffect } from "react";

const useTabWithHistory = (defaultTab = "1") => {
    const [activeTab, setActiveTab] = useState(defaultTab);

    // Sync with query params on initial load
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const initialTab = params.get("tab") || defaultTab;
        setActiveTab(initialTab);
    }, [defaultTab]);

    // Handle tab change
    const onTabChange = (key) => {
        setActiveTab(key);
        window.history.pushState({ activeTab: key }, "", `?tab=${key}`);
    };

    // Handle browser back button
    useEffect(() => {
        const handlePopState = (event) => {
            const newTab = event.state?.activeTab || defaultTab; // Fallback to defaultTab
            setActiveTab(newTab);
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, [defaultTab]);

    return { activeTab, onTabChange };
};

export default useTabWithHistory;

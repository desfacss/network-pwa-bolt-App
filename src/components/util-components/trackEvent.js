// src/utils/trackEvent.js

const trackEvent = ({ eventName, category = 'User Interaction', label = '', value }) => {
    // Google Analytics (GA4)
    if (window.gtag) {
        window.gtag('event', eventName, {
            event_category: category,
            event_label: label,
            ...(value !== undefined && { value }), // Optional value parameter
        });
    }

    // Hotjar
    if (window.hj) {
        window.hj('event', eventName, { category, label });
    }

    // Inspectlet
    if (window.__insp) {
        window.__insp.push(['tagSession', { event: eventName, category, label }]);
    }
};

export default trackEvent;
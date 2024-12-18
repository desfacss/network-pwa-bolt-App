export const getMonday = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
};

export const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
};

export const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
};

export const goToPrevious = (viewMode, currentDate) => {
    const previousDate = new Date(currentDate);
    if (viewMode === 'Weekly') {
        previousDate.setDate(currentDate.getDate() - 7);
    } else {
        previousDate.setMonth(currentDate.getMonth() - 1);
    }
    return viewMode === 'Weekly' ? getMonday(previousDate) : getFirstDayOfMonth(previousDate);
};

export const goToNext = (viewMode, currentDate) => {
    const nextDate = new Date(currentDate);
    if (viewMode === 'Weekly') {
        nextDate.setDate(currentDate.getDate() + 7);
    } else {
        nextDate.setMonth(currentDate.getMonth() + 1);
    }
    return viewMode === 'Weekly' ? getMonday(nextDate) : getFirstDayOfMonth(nextDate);
};

export const isTimesheetDisabled = (viewMode, currentDate) => {
    const today = new Date();
    const currentMonday = getMonday(today);
    const firstDayOfCurrentMonth = getFirstDayOfMonth(today);
    if (viewMode === 'Weekly') {
        return currentDate.getTime() > currentMonday.getTime();
    } else if (viewMode === 'Monthly') {
        return currentDate.getTime() > firstDayOfCurrentMonth.getTime();
    }
    return false;
};

export const isHideNext = (currentDate) => {
    const today = new Date();
    const currentMonday = getMonday(today);
    const firstDayOfCurrentMonth = getFirstDayOfMonth(today);
    // Create a new date object based only on year, month, and day
    const currentDateWithoutTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const currentMondayWithoutTime = new Date(currentMonday.getFullYear(), currentMonday.getMonth(), currentMonday.getDate());
    const firstDayOfCurrentMonthWithoutTime = new Date(firstDayOfCurrentMonth.getFullYear(), firstDayOfCurrentMonth.getMonth(), firstDayOfCurrentMonth.getDate());

    // Use the modified date for comparison
    return currentDateWithoutTime.getTime() === currentMondayWithoutTime.getTime() || currentDateWithoutTime.getTime() === firstDayOfCurrentMonthWithoutTime.getTime();
};

export const getAllValues = (obj) => {
    let values = [];
    for (let key in obj) {
        if (key.toLowerCase().includes("id")) {
            // Skip properties containing 'id'
            continue;
        }
        if (typeof obj[key] === "object" && obj[key] !== null) {
            // Recursively get values from nested objects
            values = values.concat(getAllValues(obj[key]));
        } else {
            values.push(obj[key]);
        }
    }
    return values;
};

export const generateSchemas = (fields, criteria) => {
    console.log(fields, criteria);
    // const criteriaKeys = new Set([
    //     ...Object.keys(criteria?.exit_criteria),
    //     ...Object.keys(criteria?.entry_criteria)
    // ]);
    const criteriaKeys = new Set(criteria?.map((criterion) => criterion?.field));

    // Filter fields based on criteriaKeys
    const filteredFields = fields?.filter((field) => criteriaKeys?.has(field?.field_name));

    // Generate the data schema
    const properties = {};
    const uiOrder = [];

    filteredFields?.sort((a, b) => a?.sequence - b?.sequence)?.forEach((field) => {
        uiOrder.push(field?.field_name);

        let fieldType;
        let enumOptions = null;

        switch (field?.field_type) {
            case "numeric":
                fieldType = "number";
                break;
            case "boolean":
                fieldType = "boolean";
                break;
            case "select": // Add logic for select type
                fieldType = "string";
                enumOptions = field?.options || []; // Assume `options` is defined for select fields
                break;
            case "string":
            default:
                fieldType = "string";
        }

        properties[field?.field_name] = {
            type: fieldType,
            title: field?.field_name
                ?.replace(/_/g, " ")
                ?.replace(/\b\w/g, (char) => char?.toUpperCase()),
        };

        if (enumOptions) {
            properties[field?.field_name].enum = enumOptions;
        }
    });

    const data_schema = {
        type: "object",
        properties,
    };

    const ui_schema = {
        "ui:order": uiOrder,
    };

    return { data_schema, ui_schema };
};

// fullscreenUtils.js
export const toggleFullscreen = (element) => {
    if (document.fullscreenElement) {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            // Safari
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            // IE11
            document.msExitFullscreen();
        } else {
            console.warn("Fullscreen API is not supported for exiting.");
        }
    } else if (element) {
        // Enter fullscreen
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            // Safari
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            // IE11
            element.msRequestFullscreen();
        } else {
            console.warn("Fullscreen API is not supported for entering.");
        }
    } else {
        console.error("Element is null. Ensure the element is passed correctly.");
    }
};


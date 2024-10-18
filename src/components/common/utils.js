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
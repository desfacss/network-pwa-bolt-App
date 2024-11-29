export const serverErrorParsing = (errorMessage) => {
    const foreignKeyRegex = /update or delete on table "(.*?)" violates foreign key constraint ".*?" on table "(.*?)"/;

    const match = errorMessage.match(foreignKeyRegex);

    if (match) {
        const [_, parentTable, childTable] = match; // Extract table names from the error
        return `This ${parentTable} cannot be deleted because it has linked ${childTable}.`;
    }

    // Default message for unmapped errors
    return "An error occurred. Please try again or contact support.";
};

export function camelCaseToTitleCase(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Insert a space before each capital letter
        .replace(/^./, char => char.toUpperCase()) // Capitalize the first letter of the string
        .replace(/ (\w)/g, (_, char) => ` ${char.toUpperCase()}`); // Capitalize letters after spaces
}

export function snakeCaseToTitleCase(str) {
    return str
        .split('_') // Split the string by underscores
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
        .join(' '); // Join the words with spaces
}


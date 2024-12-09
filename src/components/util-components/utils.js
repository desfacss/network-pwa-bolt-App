export function camelCaseToTitleCase(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Insert a space before each capital letter
        .replace(/^./, char => char.toUpperCase()) // Capitalize the first letter of the string
        .replace(/ (\w)/g, (_, char) => ` ${char.toUpperCase()}`); // Capitalize letters after spaces
}


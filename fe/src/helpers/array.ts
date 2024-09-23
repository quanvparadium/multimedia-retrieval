export function toggleElement<T>(array: T[], element: T): T[] {
    const index = array.indexOf(element);
    if (index > -1) {
        // Element exists, remove it
        array.splice(index, 1);
    } else {
        // Element doesn't exist, add it
        array.push(element);
    }
    return array;
}
export default function generateUniqueName(inputName: string, names: string[]) {
    let baseName = inputName.substring(0, inputName.lastIndexOf('.'));
    let extension = inputName.substring(inputName.lastIndexOf('.'));
    let count = 1;
    let newName = inputName;

    while (names.includes(newName)) {
        newName = `${baseName} (${count})${extension}`;
        count++;
    }

    return newName;
}
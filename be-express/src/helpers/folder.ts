interface Document {
    [key: string]: any;
}

export function getValueAtPath(doc: Document, path: string): any {
    const keys = path.split('.');
    let value = doc;
    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            // Path doesn't exist or not an object
            return undefined; 
        }
    }
    return value;
}

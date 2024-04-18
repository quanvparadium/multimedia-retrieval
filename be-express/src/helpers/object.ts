export function assignDataBetWeenTwoObj(
    obj1: IObject,
    obj2: IObject,
    fields: string[]
) {
    for (const field of fields) {
        obj1[field] = obj2[field];
    }
}
interface IObject {
    [key: string]: any;
}

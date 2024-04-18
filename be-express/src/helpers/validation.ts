import { ValidationError } from 'class-validator';

export function extractErrorsFromValidatioṇ̣(errors: ValidationError[]) {
    const newErrors = [];
    for (const error of errors) {
        const messages = Object.values(error.constraints ?? {});
        newErrors.push({
            field: error.property,
            value: error.value,
            messages
        });
    }
    return newErrors;
}

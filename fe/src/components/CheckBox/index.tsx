import React from 'react';

interface CheckboxProps {
    id?: string;
    label: string;
    checked: boolean;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ id, label, checked, onChange }) => {
    return (
        <div className="flex items-center w-[100px]">
            <input
                // id={id}
                type="checkbox"
                checked={checked}
                // onChange={onChange}
                className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label  className="ml-2 block text-sm text-gray-900">
                {label}
            </label>
        </div>
    );
};

export default Checkbox;

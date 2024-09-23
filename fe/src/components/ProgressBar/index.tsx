import classNames from 'classnames';
import React from 'react';

const ProgressBar = ({ progress, max, size = "small" }: any) => {
    const percentage = (progress / max) * 100;

    return (
        <div className={classNames("w-full bg-gray-200 rounded-full  overflow-clip", {
            "h-[6px]": size == 'small',
            "h-2": size == 'big',
        })}>
            <div
                className={classNames("bg-blue-600  rounded-full", {
                    "h-[6px]": size == 'small',
                    "h-2": size == 'big',

                })}
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    );
};

export default ProgressBar;

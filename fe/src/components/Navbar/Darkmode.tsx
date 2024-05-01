import classNames from "classnames";
import React, { useState, useEffect } from "react";

export default function DarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  //   useEffect(() => {
  //     // Kiểm tra cài đặt Dark Mode của người dùng
  //     const isDarkModeEnabled = window.matchMedia('(prefers-color-scheme: dark)').matches;
  //     setIsDarkMode(isDarkModeEnabled);
  //   }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // document.body.classList.toggle('dark');
  };

  return (
    <div
      className={classNames(`bg-white  transition-all ease-in-out rounded-full`, {
        "bg-gray-900": isDarkMode,
      })}
    >
      <div className="flex flex-row justify-between toggle">
        <label htmlFor="dark-toggle" className="flex items-center cursor-pointer">
          <div className="relative ">
            <input
              type="checkbox"
              name="dark-mode"
              id="dark-toggle"
              className="checkbox hidden"
              checked={isDarkMode}
              onChange={toggleDarkMode}
            />
            <div className="block border-[1px] dark:border-white border-gray-900 w-14 h-7 rounded-full" />
            {!isDarkMode ? (
              <div
                className={`dot absolute left-1 top-1 ${isDarkMode ? "bg-gray-800" : "bg-gray-800"} w-5 h-5 rounded-full transition`}
              />
            ) : (
              <div
                className={`dot absolute right-1 top-1 bg-white ${isDarkMode ? "bg-gray-800" : "bg-gray-800"} w-5 h-5 rounded-full transition`}
              />
            )}

            {/* <div className="ml-3 dark:text-white text-gray-900 font-medium">
                Dark Mode
            </div> */}
          </div>
        </label>
      </div>
    </div>
  );
}

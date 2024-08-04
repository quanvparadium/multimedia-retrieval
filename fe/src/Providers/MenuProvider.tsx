import classNames from "classnames";
import React, { createContext, useState } from "react";

export const MenuContext = createContext({});

export default function MenuProvider({ children }: IMenuProviderProps) {
  const [state, setState] = useState<any>({
    data: undefined,
    isAppear: false,
    position: { x: 0, y: 0 },
  });

  const openMenu = (data: any) => (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!setState) return;
    setState({
      data: data,
      isAppear: true,
      position: { x: event.clientX, y: event.clientY },
    });
  };

  const closeMenu = () => {
    setState({ ...state, isAppear: false });
  };

  return (
    <MenuContext.Provider value={{ state, setState, openMenu, closeMenu }}>
      {state.isAppear && (
        <div
          style={{
            position: "fixed",
            left: state.position.x,
            top: state.position.y,
          }}
        >
          <div className="w-[260px]  rounded-xl shadow-2 bg-white ">
            {state.data &&
              state.data.map((tasks: any, index: string) => {
                return (
                  <div
                    className={classNames("py-2 border-gray-200", {
                      "border-b-[1px]": state.data.length - 1 != Number(index),
                    })}
                  >
                    {tasks.map((task: any) => {
                      return (
                        <div
                          className="py-[6px] px-3 text-sm text-gray-800 flex items-center hover:bg-slate-200 cursor-pointer rounded-md"
                          onClick={task.cb}
                        >
                          <task.Icon size={20} className="text-gray-600" />
                          <p className="ml-2">{task.name}</p>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
          </div>
        </div>
      )}
      {children}
    </MenuContext.Provider>
  );
}

interface IMenuProviderProps {
  children: JSX.Element;
}

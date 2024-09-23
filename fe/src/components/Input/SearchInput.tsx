import { useState, Fragment } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import classNames from 'classnames';
import { IoMdSearch } from 'react-icons/io';

const searchSuggestions = [
    {
        title: 'Nguyen',
        description: 'Nguyen Nguyen Van Bao',
        date: '12/17/23',
    },
    {
        title: '[TESSE][FRONT-END INTERN] NGUYEN VAN BAO',
        description: 'Nguyen Nguyen Van Bao',
        date: '09/07/22',
    },
    // Add more items as needed
];



const SearchInput = () => {
    const [selected, setSelected] = useState(searchSuggestions[0]);
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const filteredSuggestions =
        query === ''
            ? searchSuggestions
            : searchSuggestions.filter((suggestion) =>
                suggestion.title
                    .toLowerCase()
                    .includes(query.toLowerCase())
            );

    return (
        <Combobox as="div" value={selected} onChange={setSelected}>
            <div className="relative max-w-md mx-auto">
                <div className="flex justify-center w-full mt-4 ">
                    <div className={`items-center rounded-full px-3 py-2  w-[700px] space-x-2 md:flex-1 md:flex ${isFocused ? "bg-white shadow-2" : "bg-slate-200"}`}>
                        <div className="flex ">
                            <Combobox.Button className="">
                                <IoMdSearch size={23} className="mx-2 cursor-pointer" />
                                {/* <SelectorIcon className="w-5 h-5 text-gray-400" aria-hidden="true" /> */}
                            </Combobox.Button>
                            <Combobox.Input
                                className=" py-1 w-full  rounded-md bg-slate-200  border-0 outline-none focus:bg-white"
                                onChange={(event) => setQuery(event.target.value)}
                                displayValue={(suggestion: any) => suggestion.title}
                                placeholder="Search..."
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                            />
                        </div>
                    </div>
                </div>
                <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    afterLeave={() => setQuery('')}
                >
                    <Combobox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                        {filteredSuggestions.length === 0 && query !== '' ? (
                            <div className="cursor-default select-none py-2 px-4 text-gray-700">
                                No suggestions found.
                            </div>
                        ) : (
                            filteredSuggestions.map((suggestion) => (
                                <Combobox.Option
                                    key={suggestion.title}
                                    className={({ active }) =>
                                        classNames(
                                            'cursor-default select-none relative py-2 pl-3 pr-9',
                                            active ? 'text-white bg-indigo-600' : 'text-gray-900'
                                        )
                                    }
                                    value={suggestion}
                                >
                                    {({ selected, active }) => (
                                        <>
                                            <div className="flex items-center">
                                                <span
                                                    className={classNames('ml-3 block truncate', selected ? 'font-semibold' : 'font-normal')}
                                                >
                                                    {suggestion.title}
                                                </span>
                                            </div>

                                            {selected ? (
                                                <span
                                                    className={classNames(
                                                        'absolute inset-y-0 right-0 flex items-center pr-4',
                                                        active ? 'text-white' : 'text-indigo-600'
                                                    )}
                                                >
                                                    {/* <CheckIcon className="w-5 h-5" aria-hidden="true" /> */}
                                                </span>
                                            ) : null}
                                        </>
                                    )}
                                </Combobox.Option>
                            ))
                        )}
                    </Combobox.Options>
                </Transition>
            </div>
        </Combobox>
    );
};

export default SearchInput;

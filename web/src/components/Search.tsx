import { Api } from "@/Api";
import { SearchResult } from "@/models/resource";
import { getResourceRoute } from "@/utils/resourceUtils";
import { Combobox } from "@headlessui/react";
import { SearchIcon } from "@heroicons/react/solid";
import clsx from "clsx";
import React, { Reducer, useReducer } from "react";
import { useNavigate } from "react-router-dom";

interface State {
  loading: boolean;
  results: SearchResult[];
  value?: SearchResult;
}

type Action =
  | {
      type: "start_search";
    }
  | {
      type: "finish_search";
      payload: SearchResult[];
    }
  | {
      type: "update_selection";
      payload: SearchResult;
    };

const initialState: State = {
  loading: false,
  results: [],
};

function searchReducer(state: State, action: Action): State {
  switch (action.type) {
    case "start_search":
      return { ...state, loading: true };
    case "finish_search":
      return { ...state, loading: false, results: action.payload };
    case "update_selection":
      return { ...state, value: action.payload };
    default:
      throw new Error();
  }
}

function Search() {
  const [state, dispatch] = useReducer<Reducer<State, Action>>(
    searchReducer,
    initialState
  );
  const { results, value } = state;
  const navigate = useNavigate();

  const handleSearchChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const query = event.target.value;

    if (query.length < 3) {
      return;
    }

    dispatch({ type: "start_search" });

    const searchResults = await Api.searchResources(query);

    dispatch({ type: "finish_search", payload: searchResults });
  };

  return (
    <div className="w-full max-w-xs">
      <Combobox
        value={value}
        onChange={(value) => {
          if (value) {
            dispatch({ type: "update_selection", payload: value });
            const { type, id } = value;
            navigate(getResourceRoute(type, id));
          }
        }}
      >
        <div className="relative">
          <Combobox.Input
            displayValue={(value: SearchResult) => value.name}
            onChange={handleSearchChange}
            className="focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm text-sm border-gray-300 rounded-3xl h-[34px]"
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <SearchIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
          </Combobox.Button>
          {results.length > 0 && (
            <Combobox.Options className="absolute z-50 w-full py-1 mt-2 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {results.map((resource, index) => (
                <Combobox.Option
                  key={resource.id}
                  value={resource}
                  className={({ active }) =>
                    clsx(
                      `cursor-default select-none relative py-2 pl-4 pr-4`,
                      active ? "bg-primary-500 text-white" : "text-black",
                      index !== results.length - 1 && "border-b border-gray-300"
                    )
                  }
                >
                  {({ active }) => (
                    <>
                      <p className="truncate font-bold text-sm">
                        {resource.name}
                      </p>
                      <p
                        className={clsx(
                          "truncate text-sm ",
                          active ? "text-primary-200" : "text-gray-500"
                        )}
                      >
                        {resource.parents
                          .filter((parent) => parent.type !== "root")
                          .map((parent) => parent.name)
                          .join(", ")}
                      </p>
                    </>
                  )}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          )}
        </div>
      </Combobox>
    </div>
  );
}

export default Search;

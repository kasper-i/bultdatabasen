import { Api } from "@/Api";
import { ResourceWithParents } from "@/models/resource";
import { getResourceRoute } from "@/utils/resourceUtils";
import { Combobox } from "@headlessui/react";
import clsx from "clsx";
import React, { Reducer, useReducer } from "react";
import { useNavigate } from "react-router-dom";

interface State {
  loading: boolean;
  results: ResourceWithParents[];
  value?: ResourceWithParents;
}

type Action =
  | {
      type: "START_SEARCH";
      payload: string;
    }
  | {
      type: "FINISH_SEARCH";
      payload: ResourceWithParents[];
    }
  | {
      type: "UPDATE_SELECTION";
      payload: ResourceWithParents;
    };

const initialState: State = {
  loading: false,
  results: [],
};

function searchReducer(state: State, action: Action): State {
  switch (action.type) {
    case "START_SEARCH":
      return { ...state, loading: true };
    case "FINISH_SEARCH":
      return { ...state, loading: false, results: action.payload };
    case "UPDATE_SELECTION":
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

    dispatch({ type: "START_SEARCH", payload: query });

    const searchResults = await Api.searchResources(query);

    dispatch({ type: "FINISH_SEARCH", payload: searchResults });
  };

  console.log(results);

  return (
    <div className="w-64">
      <Combobox
        value={value}
        onChange={(value) => {
          if (value) {
            dispatch({ type: "UPDATE_SELECTION", payload: value });
            const { type, id } = value;
            navigate(getResourceRoute(type, id));
          }
        }}
      >
        <div className="relative">
          <Combobox.Input
            displayValue={(value: ResourceWithParents) => value.name}
            onChange={handleSearchChange}
            className="focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm text-sm border-gray-300 rounded-3xl"
          />
          <Combobox.Options className="absolute w-full py-1 mt-2 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {results.length !== 0 &&
              results.map((resource, index) => (
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
                      <p className={clsx("block truncate font-bold text-sm")}>
                        {resource.name}
                      </p>
                      <p
                        className={clsx(
                          "block truncate text-sm ",
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
        </div>
      </Combobox>
    </div>
  );
}

export default Search;

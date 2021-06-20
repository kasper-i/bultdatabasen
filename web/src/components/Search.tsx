import { Api } from "Api";
import React, { Reducer, useReducer } from "react";
import { useHistory } from "react-router";
import { Search as SemanticSearch, SearchProps } from "semantic-ui-react";

interface State {
  loading: boolean;
  results: Record<string, string>[];
  value: string;
}

interface Action {
  type: "START_SEARCH" | "FINISH_SEARCH" | "UPDATE_SELECTION";
  payload?: any;
}

const initialState: State = {
  loading: false,
  results: [],
  value: "",
};

function searchReducer(state: State, action: Action) {
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
  const { loading, results, value } = state;
  const history = useHistory();

  const handleSearchChange = async (
    _event: React.MouseEvent<HTMLElement, MouseEvent>,
    data: SearchProps
  ) => {
    dispatch({ type: "UPDATE_SELECTION", payload: data.value ?? "" });

    if (data.value == null || data.value.length < 3) {
      return;
    }

    dispatch({ type: "START_SEARCH", payload: value });

    const searchResults = await (
      await Api.searchResources(data.value)
    ).map((result) => ({
      title: result.name,
      description: result.parents.map((parent) => parent.name).join(", "),
      key: result.id,
      type: result.type,
    }));

    dispatch({ type: "FINISH_SEARCH", payload: searchResults });
  };

  return (
    <SemanticSearch
      loading={loading}
      onResultSelect={(e, data) => {
        dispatch({ type: "UPDATE_SELECTION", payload: data.result.title });
        history.push(`/route/${data.result.key}`);
      }}
      onSearchChange={handleSearchChange}
      results={results}
      value={value}
    />
  );
}

export default Search;

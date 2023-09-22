import { Api } from "@/Api";
import { getResourceLabel, getResourceRoute } from "@/utils/resourceUtils";
import { rem, Text, TextInput } from "@mantine/core";
import { spotlight, Spotlight, SpotlightActionData } from "@mantine/spotlight";
import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Search() {
  const navigate = useNavigate();
  const [actions, setActions] = useState<SpotlightActionData[]>([]);

  const handleSearchChange = async (query: string) => {
    if (query.length < 3) {
      return;
    }

    const searchResults = await Api.searchResources(query);

    setActions(
      searchResults.map(({ id, name, parents, type }) => ({
        id,
        label: name,
        description: parents
          .filter((parent) => parent.type !== "root")
          .map((parent) => parent.name)
          .join(", "),
        onClick: () => navigate(getResourceRoute(type, id)),
        rightSection: <Text size="sm">{getResourceLabel(type)}</Text>,
      }))
    );
  };

  return (
    <>
      <TextInput
        leftSection={<IconSearch size={14} />}
        onClick={spotlight.open}
        placeholder="Sök ..."
        size="sm"
      />
      <Spotlight
        actions={actions}
        nothingFound="Inga träffar..."
        highlightQuery
        onQueryChange={handleSearchChange}
        searchProps={{
          leftSection: (
            <IconSearch
              style={{ width: rem(20), height: rem(20) }}
              stroke={1.5}
            />
          ),
          placeholder: "Sök...",
        }}
      />
    </>
  );
}

export default Search;

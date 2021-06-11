import { useAncestors } from "queries/commonQueries";
import React, { Fragment, ReactElement, useEffect, useState } from "react";
import { useHistory } from "react-router";
import { Breadcrumb, StrictBreadcrumbSectionProps } from "semantic-ui-react";
import { SemanticShorthandCollection } from "semantic-ui-react/dist/commonjs/generic";

interface Props {
  resourceId: string;
  resourceName: string;
}

const Breadcrumbs = ({ resourceId, resourceName }: Props): ReactElement => {
  const [crumbs, setCrumbs] = useState<
    SemanticShorthandCollection<StrictBreadcrumbSectionProps>
  >([]);

  const ancestors = useAncestors(resourceId);
  const history = useHistory();

  useEffect(() => {
    if (ancestors.data != null) {
      const sections: SemanticShorthandCollection<StrictBreadcrumbSectionProps> =
        ancestors.data.map((ancestor) => ({
          key: ancestor.id,
          content: ancestor.type === "root" ? "🌎" : ancestor.name,
          onClick: () => {
            switch (ancestor.type) {
              case "root":
                history.push("/");
                break;
              case "area":
                history.push(`/area/${ancestor.id}`);
                break;
              case "crag":
                history.push(`/crag/${ancestor.id}`);
                break;
              case "sector":
                history.push(`/sector/${ancestor.id}`);
                break;
              case "route":
                history.push(`/route/${ancestor.id}`);
                break;
            }
          },
        }));

      sections.push({
        key: resourceId,
        content: resourceName,
      });

      setCrumbs(sections);
    }
  }, [ancestors.data]);

  return <Breadcrumb icon="right angle" sections={crumbs} />;
};

export default Breadcrumbs;

import { Resource } from "@/models/resource";
import { getResourceRoute } from "@/utils/resourceUtils";
import { IconChevronRight, IconHome, IconHome2 } from "@tabler/icons-react";
import clsx from "clsx";
import {
  FC,
  Fragment,
  ReactElement,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";

interface Crumb {
  key: string;
  content: ReactNode;
}

const Breadcrumbs: FC<{
  resources?: Resource[];
}> = ({ resources }): ReactElement => {
  const rulerRef = useRef<HTMLDivElement>(null);
  const breadcrumbsRef = useRef<HTMLDivElement>(null);

  const [expanded, setExpanded] = useState(true);
  const [observer] = useState(
    new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === rulerRef.current) {
          setRulerWidth(entry.contentRect.width);
        }
      }
    })
  );

  const [rulerWidth, setRulerWidth] = useState<number>();
  const [expandedWidth, setExpandedWidth] = useState<number>();

  useEffect(() => {
    setExpandedWidth(breadcrumbsRef.current?.getBoundingClientRect()?.width);
  }, [setExpandedWidth]);

  useEffect(() => {
    const target = rulerRef.current;

    if (!target) {
      return;
    }

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [rulerRef.current]);

  useEffect(() => {
    if (!rulerWidth || !expandedWidth) {
      return;
    }

    if (!expanded && expandedWidth < rulerWidth) {
      setExpanded(true);
    }

    if (expanded && expandedWidth > rulerWidth) {
      setExpanded(false);
    }
  }, [rulerWidth]);

  const crumbs: Crumb[] = (resources ?? []).map((resource) => {
    let to = "";

    switch (resource.type) {
      case "root":
        to = "/";
        break;
      case "area":
      case "crag":
      case "sector":
      case "route":
        to = getResourceRoute(resource.type, resource.id);
        break;
    }

    return {
      key: resource.id,
      content: (
        <Link
          to={to}
          className="flex items-center text-primary-500 whitespace-nowrap text-xs"
        >
          {resource.type === "root" ? <IconHome size={14} /> : resource.name}
        </Link>
      ),
    };
  });

  if (crumbs.length >= 2 && !expanded) {
    crumbs.splice(1, crumbs.length - 2, {
      key: "ellipsis",
      content: (
        <div className="cursor-pointer" onClick={() => setExpanded(true)}>
          ...
        </div>
      ),
    });
  }

  return (
    <div className="relative h-5">
      <div ref={rulerRef} className="w-full" />
      <div
        ref={breadcrumbsRef}
        className={clsx(
          "absolute flex h-5 items-center",
          expandedWidth === undefined && "invisible"
        )}
      >
        {crumbs.map(({ key, content }, index) => (
          <Fragment key={key}>
            {content}
            {index !== crumbs.length - 1 && <IconChevronRight size={14} />}
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default Breadcrumbs;

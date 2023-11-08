import { Resource } from "@/models/resource";
import { getResourceRoute } from "@/utils/resourceUtils";
import { IconChevronRight, IconHome } from "@tabler/icons-react";
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
import classes from "./Breadcrumbs.module.css";
import clsx from "clsx";

interface Crumb {
  key: string;
  content: ReactNode;
}

const Breadcrumbs: FC<{
  resources?: Resource[];
  className?: string;
}> = ({ resources, className }): ReactElement => {
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
        <Link to={to} className={classes.crumb}>
          {resource.type === "root" ? <IconHome size={14} /> : resource.name}
        </Link>
      ),
    };
  });

  if (crumbs.length >= 2 && !expanded) {
    crumbs.splice(1, crumbs.length - 2, {
      key: "ellipsis",
      content: (
        <div className={classes.ellipsis} onClick={() => setExpanded(true)}>
          ...
        </div>
      ),
    });
  }

  return (
    <div className={clsx(classes.container, className)}>
      <div ref={rulerRef} className={classes.ruler} />
      <div
        ref={breadcrumbsRef}
        className={classes.crumbs}
        style={{
          display: expandedWidth === undefined ? "invisible" : undefined,
        }}
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

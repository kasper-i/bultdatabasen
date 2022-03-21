import { Resource } from "@/models/resource";
import { getResourceRoute } from "@/utils/resourceUtils";
import React from "react";
import { Link } from "react-router-dom";
import Icon from "./base/Icon";

interface Props {
  resource: Resource;
}

const BackLink = ({ resource }: Props) => {
  const { id, name, type } = resource;

  return (
    <Link to={getResourceRoute(type, id)}>
      <div className="flex items-center">
        <Icon name="arrow left" className="text-gray-600" />
        <span className="text-primary-500 hover:text-primary-400">
          {type === "root" ? "Start" : name}
        </span>
      </div>
    </Link>
  );
};

export default BackLink;

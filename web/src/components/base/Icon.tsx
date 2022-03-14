import {
  BeakerIcon,
  XCircleIcon,
  TrashIcon,
  XIcon,
  UploadIcon,
  PlusCircleIcon,
  PlusIcon,
  CheckIcon,
  ArrowSmLeftIcon,
  LockClosedIcon,
  LockOpenIcon,
  ClipboardIcon,
  ExternalLinkIcon,
  DuplicateIcon,
} from "@heroicons/react/outline";
import clsx from "clsx";
import React, { FC } from "react";
import { IconType } from "./types";

const Icon: FC<{ name: IconType; className?: string }> = ({
  name,
  className,
}) => {
  const renderIcon = () => {
    switch (name) {
      case "cancel":
        return <XCircleIcon />;
      case "trash":
        return <TrashIcon />;
      case "close":
        return <XIcon />;
      case "upload":
        return <UploadIcon />;
      case "add":
        return <PlusCircleIcon />;
      case "check":
        return <CheckIcon />;
      case "arrow left":
        return <ArrowSmLeftIcon />;
      case "unlock":
        return <LockOpenIcon />;
      case "lock":
        return <LockClosedIcon />;
      case "paste":
        return <ClipboardIcon />;
      case "plus":
        return <PlusIcon />;
      case "external":
        return <ExternalLinkIcon />;
      case "copy":
        return <DuplicateIcon />;
      case "redo":
      case "wrench":
      default:
        return <BeakerIcon />;
    }
  };

  return (
    <div className={clsx("inline-block h-5 w-5", className)}>
      {renderIcon()}
    </div>
  );
};

export default Icon;

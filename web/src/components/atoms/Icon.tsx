import {
  ArrowSmLeftIcon,
  BadgeCheckIcon,
  BeakerIcon,
  CameraIcon,
  ClipboardIcon,
  DuplicateIcon,
  ExternalLinkIcon,
  LockClosedIcon,
  LockOpenIcon,
  PhotographIcon,
  PlusCircleIcon,
  PlusSmIcon,
  RefreshIcon,
  TrashIcon,
  UploadIcon,
  XCircleIcon,
  XIcon,
  DownloadIcon,
} from "@heroicons/react/outline";
import { HomeIcon } from "@heroicons/react/solid";
import clsx from "clsx";
import React, { FC } from "react";
import { IconType } from "./types";

const Icon: FC<{ name: IconType; className?: string; big?: boolean }> = ({
  name,
  className,
  big,
}) => {
  const getIcon = () => {
    switch (name) {
      case "cancel":
        return XCircleIcon;
      case "trash":
        return TrashIcon;
      case "close":
        return XIcon;
      case "upload":
        return UploadIcon;
      case "check":
        return BadgeCheckIcon;
      case "arrow left":
        return ArrowSmLeftIcon;
      case "unlock":
        return LockOpenIcon;
      case "lock":
        return LockClosedIcon;
      case "paste":
        return ClipboardIcon;
      case "plus":
        return PlusSmIcon;
      case "add":
        return PlusCircleIcon;
      case "external":
        return ExternalLinkIcon;
      case "copy":
        return DuplicateIcon;
      case "home":
        return HomeIcon;
      case "image":
        return PhotographIcon;
      case "camera":
        return CameraIcon;
      case "reply":
        return RefreshIcon;
      case "download":
        return DownloadIcon;
      case "wrench":
      default:
        return BeakerIcon;
    }
  };

  const Icon = getIcon();

  return (
    <Icon
      className={clsx(
        "inline-block",
        big === true ? "h-10 w-10" : "h-4 w-4",
        className
      )}
    />
  );
};

export default Icon;

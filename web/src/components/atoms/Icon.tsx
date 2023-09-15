import { css, cx } from "@emotion/css";
import {
  ArrowUturnLeftIcon,
  HomeIcon,
  PencilIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import {
  ArchiveBoxIcon,
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  ArrowUpTrayIcon,
  BeakerIcon,
  CameraIcon,
  ChatBubbleLeftIcon,
  CheckBadgeIcon,
  CheckIcon,
  ClipboardIcon,
  DocumentDuplicateIcon,
  EllipsisVerticalIcon,
  LockClosedIcon,
  LockOpenIcon,
  PhotoIcon,
  PlusCircleIcon,
  PlusSmallIcon,
  TrashIcon,
  WrenchScrewdriverIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { FC } from "react";
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
      case "upload":
        return ArrowUpTrayIcon;
      case "check":
        return CheckIcon;
      case "check badge":
        return CheckBadgeIcon;
      case "arrow left":
        return ArrowLeftIcon;
      case "unlock":
        return LockOpenIcon;
      case "lock":
        return LockClosedIcon;
      case "paste":
        return ClipboardIcon;
      case "plus":
        return PlusSmallIcon;
      case "add":
        return PlusCircleIcon;
      case "external":
        return ArrowTopRightOnSquareIcon;
      case "copy":
        return DocumentDuplicateIcon;
      case "home":
        return HomeIcon;
      case "image":
        return PhotoIcon;
      case "camera":
        return CameraIcon;
      case "dots":
        return EllipsisVerticalIcon;
      case "refresh":
        return ArrowPathIcon;
      case "download":
        return ArrowDownTrayIcon;
      case "edit":
        return PencilIcon;
      case "comment":
        return ChatBubbleLeftIcon;
      case "wrench":
        return WrenchScrewdriverIcon;
      case "x":
        return XMarkIcon;
      case "back":
        return ArrowUturnLeftIcon;
      case "archive":
        return ArchiveBoxIcon;
      default:
        return BeakerIcon;
    }
  };

  const Icon = getIcon();
  const size = big === true ? "2.5rem" : "1rem";

  return (
    <Icon
      className={cx(
        css`
          display: inline-block;
          width: ${size};
          height: ${size};
        `,
        className
      )}
    />
  );
};

export default Icon;

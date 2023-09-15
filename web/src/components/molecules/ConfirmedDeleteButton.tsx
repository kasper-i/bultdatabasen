import { UseMutationResult } from "@tanstack/react-query";
import { useState } from "react";
import { Color } from "../atoms/constants";
import IconButton, { IconButtonProps } from "../atoms/IconButton";
import DeleteDialog from "./DeleteDialog";

type Props = Omit<IconButtonProps, "icon" | "color" | "loading" | "onClick"> & {
  mutation: UseMutationResult<void, unknown, void, unknown>;
  target: string;
};

const ConfirmedDeleteButton = ({ mutation, target, ...buttonProps }: Props) => {
  const [open, setOpen] = useState(false);

  const requestDelete = () => {
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
  };

  return (
    <div>
      <IconButton
        {...buttonProps}
        icon="trash"
        color={Color.Danger}
        loading={mutation.isLoading}
        onClick={requestDelete}
      />
      {open && (
        <DeleteDialog
          mutation={mutation}
          target={target}
          onClose={closeDialog}
        />
      )}
    </div>
  );
};

export default ConfirmedDeleteButton;

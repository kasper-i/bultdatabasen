import React, { useState } from "react";
import { UseMutationResult } from "@tanstack/react-query";
import DeleteDialog from "./DeleteDialog";
import { ActionIcon, ActionIconProps } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

type Props = Omit<ActionIconProps, "icon" | "color" | "loading" | "onClick"> & {
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
      <ActionIcon
        {...buttonProps}
        color="red"
        loading={mutation.isLoading}
        onClick={requestDelete}
        size="lg"
      >
        <IconTrash size={14} />
      </ActionIcon>
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

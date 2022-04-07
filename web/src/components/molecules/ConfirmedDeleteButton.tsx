import React, { useState } from "react";
import { UseMutationResult } from "react-query";
import Button from "../atoms/Button";
import IconButton, { IconButtonProps } from "../atoms/IconButton";
import Modal from "../atoms/Modal";

type Props = Omit<IconButtonProps, "icon" | "color" | "loading" | "onClick"> & {
  mutation: UseMutationResult<void, unknown, void, unknown>;
  target: string;
};

const ConfirmedDeleteButton = ({ mutation, target, ...buttonProps }: Props) => {
  const [deleteRequested, setDeleteRequested] = useState(false);

  const confirmDelete = () => {
    mutation.mutate();
    setDeleteRequested(false);
  };

  const requestDelete = () => {
    setDeleteRequested(true);
  };

  const abortDelete = () => {
    setDeleteRequested(false);
  };

  return (
    <div>
      <IconButton
        {...buttonProps}
        icon="trash"
        color="danger"
        loading={mutation.isLoading}
        onClick={requestDelete}
      />
      {deleteRequested && (
        <Modal
          onClose={abortDelete}
          title={`Bekräfta borttagning`}
          description={`Vill du flytta ${target.toLocaleLowerCase()} till papperskorgen?`}
        >
          <div className="flex gap-2">
            <Button icon="cancel" onClick={abortDelete}>
              Avbryt
            </Button>
            <Button color="danger" onClick={confirmDelete} icon="trash">
              Radera
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ConfirmedDeleteButton;

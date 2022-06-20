import React, { useEffect } from "react";
import { UseMutationResult } from "react-query";
import Button from "../atoms/Button";
import Modal from "../atoms/Modal";

type Props = {
  mutation: UseMutationResult<void, unknown, void, unknown>;
  target: string;
  onClose: () => void;
};

const DeleteDialog = ({ mutation, target, onClose }: Props) => {
  useEffect(() => {
    mutation.isSuccess && onClose?.();
  }, [mutation.isSuccess]);

  return (
    <div>
      <Modal
        onClose={onClose}
        title={`Bekräfta borttagning`}
        description={`Vill du flytta ${target.toLocaleLowerCase()} till papperskorgen?`}
      >
        <div className="flex w-full justify-end gap-2">
          <Button icon="cancel" onClick={onClose}>
            Avbryt
          </Button>
          <Button
            color="danger"
            onClick={() => mutation.mutate()}
            icon="trash"
            loading={mutation.isLoading}
          >
            Ta bort
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default DeleteDialog;

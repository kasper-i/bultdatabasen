import React, { useEffect } from "react";
import { UseMutationResult } from "@tanstack/react-query";
import Modal from "../atoms/Modal";
import { Button } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

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
          <Button variant="subtle" onClick={onClose}>
            Avbryt
          </Button>
          <Button
            color="red"
            onClick={() => mutation.mutate()}
            leftSection={<IconTrash size={14} />}
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

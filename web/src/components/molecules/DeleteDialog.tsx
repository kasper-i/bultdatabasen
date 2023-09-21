import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { UseMutationResult } from "@tanstack/react-query";
import { useEffect } from "react";

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
      <Modal opened onClose={onClose} title="Bekräfta borttagning" centered>
        <Stack>
          <Text size="sm">
            Vill du flytta {target.toLocaleLowerCase()} till papperskorgen?
          </Text>
          <Group justify="right">
            <Button variant="default" onClick={onClose}>
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
          </Group>
        </Stack>
      </Modal>
    </div>
  );
};

export default DeleteDialog;

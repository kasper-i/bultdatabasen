import React, { ReactElement } from "react";
import Button from "./base/Button";
import Modal from "./base/Modal";
import { IconType } from "./base/types";

interface Props {
  target?: string;
  icon?: IconType;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeletePrompt = ({
  target,
  icon,
  onCancel,
  onConfirm,
}: Props): ReactElement => {
  return (
    <Modal
      onClose={onCancel}
      title="Vill du radera objektet?"
      description="Objektet kommer att flyttas till papperskorgen."
    >
      <div className="flex gap-2">
        <Button icon="cancel" onClick={onCancel}>
          Avbryt
        </Button>
        <Button color="danger" onClick={onConfirm} icon={icon}>
          Radera {target != null ? target : ""}
        </Button>
      </div>
    </Modal>
  );
};

export default DeletePrompt;

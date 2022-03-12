import React, { ReactElement } from "react";
import Button from "./base/Button";
import Icon from "./base/Icon";
import Modal from "./base/Modal";

interface Props {
  target?: string;
  icon?: string;
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
    <Modal onClose={onCancel} open={true} size="mini" s>
      <div>
        <p>Vill du ta bort objektet permanent?</p>
      </div>
      <div>
        <Button onClick={onCancel}>
          <Icon name="cancel" /> Avbryt
        </Button>
        <Button color="red" onClick={onConfirm}>
          <Icon name={icon ?? "trash"} /> Radera {target != null ? target : ""}
        </Button>
      </div>
    </Modal>
  );
};

export default DeletePrompt;

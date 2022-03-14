import React, { ReactElement } from "react";
import Button from "./base/Button";
import Icon, { IconType } from "./base/Icon";
import Modal from "./base/Modal";

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
    <Modal onClose={onCancel} open={true}>
      <div>
        <p>Vill du ta bort objektet permanent?</p>
      </div>
      <div>
        <Button onClick={onCancel}>
          <Icon name="cancel" /> Avbryt
        </Button>
        <Button color="danger" onClick={onConfirm} icon={icon}>
          Radera {target != null ? target : ""}
        </Button>
      </div>
    </Modal>
  );
};

export default DeletePrompt;

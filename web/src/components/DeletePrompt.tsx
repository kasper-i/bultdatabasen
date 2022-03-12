import React, { ReactElement } from "react";

interface Props {
  target?: string;
  icon?: SemanticICONS;
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
      <Modal.Content>
        <p>Vill du ta bort objektet permanent?</p>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={onCancel}>
          <Icon name="cancel" /> Avbryt
        </Button>
        <Button color="red" onClick={onConfirm}>
          <Icon name={icon ?? "trash"} /> Radera {target != null ? target : ""}
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default DeletePrompt;

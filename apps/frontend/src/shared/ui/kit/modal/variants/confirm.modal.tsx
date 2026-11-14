import { Button, ButtonVariant } from "../../buttons";
import { ModalBody, ModalFooter } from "../components";
import { Modal } from "../modal";
import { ModalProps } from "../types";

interface IProps extends Omit<ModalProps, "children"> {
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: ButtonVariant;
}

export const ConfirmModal: React.FC<IProps> = (props) => {
  const {
    message,
    onConfirm,
    confirmText = "Подтвердить",
    cancelText = "Отмена",
    confirmVariant = "primary",
    ...modalProps
  } = props;

  return (
    <Modal {...modalProps} showCloseButton={false}>
      <ModalBody>
        <p className="text-[var(--ui-text)]">{message}</p>
      </ModalBody>
      <ModalFooter variant={modalProps.variant || "dark"}>
        <Button variant="ghost" onClick={modalProps.onClose}>
          {cancelText}
        </Button>
        <Button
          variant={confirmVariant}
          onClick={() => {
            onConfirm();
            modalProps.onClose();
          }}
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

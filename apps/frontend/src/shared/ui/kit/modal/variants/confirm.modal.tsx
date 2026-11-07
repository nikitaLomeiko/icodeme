import { Button, ButtonVariant } from "../../buttons";
import { ModalBody, ModalFooter } from "../components";
import { Modal } from "../modal";
import { ModalProps } from "../types";

export const ConfirmModal: React.FC<
  Omit<ModalProps, "children"> & {
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: ButtonVariant;
  }
> = ({
  message,
  onConfirm,
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  confirmVariant = "primary",
  ...props
}) => (
  <Modal {...props} showCloseButton={false}>
    <ModalBody>
      <p className="text-[var(--ui-text)]">{message}</p>
    </ModalBody>
    <ModalFooter variant={props.variant || "dark"}>
      <Button variant="ghost" onClick={props.onClose}>
        {cancelText}
      </Button>
      <Button
        variant={confirmVariant}
        onClick={() => {
          onConfirm();
          props.onClose();
        }}
      >
        {confirmText}
      </Button>
    </ModalFooter>
  </Modal>
);

import { Button } from "../../buttons";
import { ModalBody, ModalFooter } from "../components";
import { Modal } from "../modal";
import { ModalProps } from "../types";

interface IProps extends Omit<ModalProps, "children"> {
  message: string;
}

export const SimpleModal: React.FC<IProps> = ({ message, ...modalProps }) => (
  <Modal {...modalProps}>
    <ModalBody>
      <p className="text-[var(--ui-text)]">{message}</p>
    </ModalBody>
    <ModalFooter variant={modalProps.variant || "dark"}>
      <Button variant="primary" onClick={modalProps.onClose}>
        Закрыть
      </Button>
    </ModalFooter>
  </Modal>
);

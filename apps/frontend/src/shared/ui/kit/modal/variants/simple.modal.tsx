import { Button } from "../../buttons";
import { ModalBody, ModalFooter } from "../components";
import { Modal } from "../modal";
import { ModalProps } from "../types";

export const SimpleModal: React.FC<
  Omit<ModalProps, "children"> & { message: string }
> = ({ message, ...props }) => (
  <Modal {...props}>
    <ModalBody>
      <p className="text-[var(--ui-text)]">{message}</p>
    </ModalBody>
    <ModalFooter variant={props.variant || "dark"}>
      <Button variant="primary" onClick={props.onClose}>
        Закрыть
      </Button>
    </ModalFooter>
  </Modal>
);

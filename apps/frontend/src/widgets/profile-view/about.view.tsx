import { IProfileData } from "@/entities/profile";
import { AboutEditForm } from "@/features/profile";
import {
  Button,
  Card,
  Modal,
  ModalBody,
  Title,
  useNotification,
} from "@/shared/ui/kit";
import { useState } from "react";
import { FiEdit2 } from "react-icons/fi";

interface IProps {
  profileData: IProfileData;
}

export const AboutView: React.FC<IProps> = ({ profileData }) => {
  const [isOpen, setOpen] = useState<boolean>(false);

  const notification = useNotification();

  const handleSuccess = () => {
    setOpen(false);
    notification.success("Информация о себе успешно обновлена");
  };

  return (
    <>
      <Card
        title="О себе"
        headerAction={
          <Button
            variant="ghost"
            size="sm"
            icon={FiEdit2}
            onClick={() => setOpen(true)}
            disableHoverScale
            className="mt-2"
          />
        }
        variant="default"
        padding="md"
        radius="md"
        withHeader={true}
      >
        <Title
          as="p"
          size="sm"
          weight="normal"
          color="default"
          className="leading-relaxed"
        >
          {profileData.about || "Информация о себе не заполнена"}
        </Title>
      </Card>

      <Modal
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        title="Редактировать 'О себе'"
        variant="blur"
        size="full"
        closeOnOverlayClick={true}
        closeOnEsc={true}
        showCloseButton={true}
        withAnimation={true}
      >
        <ModalBody className="min-w-140">
          <AboutEditForm
            profileData={profileData}
            onCancel={() => setOpen(false)}
            onSuccess={handleSuccess}
          />
        </ModalBody>
      </Modal>
    </>
  );
};

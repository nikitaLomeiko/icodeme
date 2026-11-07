import { useLogoutMutation } from "@/entities/auth";
import {
  ProfileDetails,
  IProps as IProfileDetailsProps,
} from "@/entities/profile";
import { ProfileEditForm } from "@/features/profile";
import { isApiError } from "@/shared/api";
import { Modal, ModalBody, useNotification } from "@/shared/ui/kit";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface IProps {
  profileDetails: Omit<IProfileDetailsProps, "onLogout" | "onEdit">;
}

export const ProfileView: React.FC<IProps> = (props) => {
  const { profileDetails } = props;

  const [isOpen, setOpen] = useState<boolean>(false);
  const notification = useNotification();
  const [logout] = useLogoutMutation();
  const router = useRouter();

  const handleLogout = async () => {
    const result = await logout();

    if (result.error && isApiError(result.error)) {
      return;
    }

    router.push("/auth");
  };

  const handleSuccess = () => {
    setOpen(false);
    notification.success("Профиль успешно обновлен");
  };

  return (
    <>
      <ProfileDetails
        {...profileDetails}
        onEdit={() => setOpen(true)}
        onLogout={handleLogout}
      />

      <Modal
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        title="Редактировать профиль"
        variant="blur"
        size="md"
        closeOnOverlayClick={true}
        closeOnEsc={true}
        showCloseButton={true}
        withAnimation={true}
      >
        <ModalBody>
          <ProfileEditForm
            profileData={profileDetails.profile.data}
            onCancel={() => setOpen(false)}
            onSuccess={handleSuccess}
          />
        </ModalBody>
      </Modal>
    </>
  );
};

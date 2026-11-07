import { IStudy, PlanItem } from "@/entities/study";
import { LanguageAddForm } from "@/features/profile";
import { StudyDeleteForm } from "@/features/study";
import { Card, Modal, ModalBody, useNotification } from "@/shared/ui/kit";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { EmptyMessage } from "./components/empty.message";

interface IProps {
  list: IStudy[];
}

export const StudyList: React.FC<IProps> = ({ list }) => {
  const [isAddModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [selectedStudy, setSelectedStudy] = useState<IStudy | null>(null);
  const notification = useNotification();

  const handleAddSuccess = () => {
    setAddModalOpen(false);
    notification.success("Новый язык программирования успешно добавлен");
  };

  const handleDeleteClick = (study: IStudy) => {
    setSelectedStudy(study);
    setDeleteModalOpen(true);
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setSelectedStudy(null);
  };

  const isEmpty = list.length === 0;

  return (
    <>
      <Card
        title="Прогресс обучения"
        headerAction={
          <button
            onClick={() => setAddModalOpen(true)}
            className="p-1 rounded-lg text-[var(--ui-primary)] hover:bg-[var(--ui-primary)]/10 transition-all mt-2"
          >
            <FaPlus size={18} />
          </button>
        }
      >
        {isEmpty ? (
          <EmptyMessage onAddLanguage={() => setAddModalOpen(true)} />
        ) : (
          <div className="space-y-3">
            {list.map((study) => (
              <PlanItem
                key={study._id}
                onDelete={() => handleDeleteClick(study)}
                onContinue={() => null}
                study={study}
              />
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Добавить язык программирования"
        variant="blur"
        size="sm"
        closeOnOverlayClick={true}
        closeOnEsc={true}
        showCloseButton={true}
        withAnimation={true}
      >
        <ModalBody>
          <LanguageAddForm
            onCancel={() => setAddModalOpen(false)}
            onSuccess={handleAddSuccess}
          />
        </ModalBody>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        title="Подтверждение удаления"
        variant="blur"
        size="sm"
        closeOnOverlayClick={false}
        closeOnEsc={true}
        showCloseButton={true}
        withAnimation={true}
      >
        <ModalBody>
          <StudyDeleteForm
            id={selectedStudy?._id || ""}
            onCancel={() => setDeleteModalOpen(false)}
          />
        </ModalBody>
      </Modal>
    </>
  );
};

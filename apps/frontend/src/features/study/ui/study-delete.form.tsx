"use client";

import { useState, useEffect } from "react";
import { TextField, Button, Title, Notification } from "@/shared/ui/kit";
import { generateCode } from "../model/heplers";
import { useDeleteStudyMutation } from "@/entities/study";

interface IProps {
  onCancel: () => void;
  id: string;
}

export const StudyDeleteForm: React.FC<IProps> = (props) => {
  const { onCancel, id } = props;

  const [userInput, setUserInput] = useState("");
  const [randomChars, setRandomChars] = useState("");

  const [remove, { isLoading }] = useDeleteStudyMutation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRandomChars(generateCode());
    setUserInput("");
  }, []);

  const handleConfirm = async () => {
    setError(null);

    if (userInput === randomChars) {
      const result = await remove(id);

      if (!result.data?.success) {
        setError("Не удалось удалить план");
        return;
      }

      handleClose();
    }
  };

  const handleClose = () => {
    setUserInput("");
    setRandomChars("");
    onCancel();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && userInput === randomChars) {
      handleConfirm();
    }
  };

  return (
    <div>
      <p className="text-sm text-[var(--ui-text-secondary)] mb-4">
        Вы уверены, что хотите удалить этот план? Это действие нельзя отменить.
      </p>

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
        <Title
          as="p"
          size="xs"
          weight="medium"
          color="default"
          className="mb-2 !text-[var(--ui-text)]"
        >
          Для подтверждения введите следующие символы:
        </Title>
        <Title
          as="p"
          size="2xl"
          weight="bold"
          color="default"
          className="font-mono text-yellow-500 text-center tracking-wider"
        >
          {randomChars}
        </Title>
      </div>

      {error && (
        <Notification
          message={error}
          autoClose={false}
          className="bg-transparent border-none"
        />
      )}

      <TextField
        id="code"
        placeholder="Введите символы выше"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyPress={handleKeyPress}
        autoFocus
        fullWidth
      />

      <div className="flex gap-3 pt-4">
        <Button
          variant="primary"
          size="sm"
          onClick={handleConfirm}
          isLoading={isLoading}
          disabled={userInput !== randomChars || isLoading}
          className={`flex-1 ${
            userInput === randomChars
              ? "!bg-red-500 !text-white hover:!bg-red-600"
              : "opacity-50 cursor-not-allowed"
          }`}
        >
          Удалить
        </Button>
      </div>
    </div>
  );
};

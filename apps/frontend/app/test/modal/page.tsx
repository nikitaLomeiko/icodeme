// app/modal-demo/page.tsx
"use client";

import React, { useState } from "react";
import {
  Modal,
  SimpleModal,
  ConfirmModal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalContent,
  ModalOverlay,
  ModalContainer,
} from "@/shared/ui/kit/modal";
import { Button, Title } from "@/shared/ui/kit";

type VariantType = "dark" | "blur" | "transparent" | "none";
type SizeType = "xs" | "sm" | "md" | "lg" | "xl" | "full";
type PositionType =
  | "center"
  | "top"
  | "top-left"
  | "top-right"
  | "bottom"
  | "bottom-left"
  | "bottom-right"
  | "left"
  | "right";

export default function ModalDemoPage() {
  // State for different modals
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<VariantType>("dark");
  const [selectedSize, setSelectedSize] = useState<SizeType>("md");
  const [selectedPosition, setSelectedPosition] =
    useState<PositionType>("center");
  const [withAnimation, setWithAnimation] = useState(true);
  const [closeOnOverlay, setCloseOnOverlay] = useState(true);
  const [showCloseBtn, setShowCloseBtn] = useState(true);

  // Custom content modal state
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });

  const openModal = (id: string) => setActiveModal(id);
  const closeModal = () => setActiveModal(null);

  const handleFormSubmit = () => {
    console.log("Form submitted:", formData);
    setIsCustomModalOpen(false);
    setFormData({ name: "", email: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--ui-background)] to-[var(--ui-background-secondary)] p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <Title size="4xl" weight="bold" className="mb-4">
            🎨 Modal Component Demo
          </Title>
          <p className="text-[var(--ui-text-secondary)] max-w-2xl mx-auto">
            Тестирование всех вариантов модального окна: различные стили,
            размеры, позиции и конфигурации
          </p>
        </div>

        {/* Control Panel for Customizable Modal */}
        <div className="mb-8 p-6 bg-[var(--ui-background)] border border-[var(--ui-border)] rounded-xl">
          <Title size="lg" weight="semibold" className="mb-4">
            🎮 Кастомизируемое модальное окно
          </Title>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Variant Selector */}
            <div>
              <label className="block text-sm font-medium text-[var(--ui-text)] mb-2">
                Variant (стиль)
              </label>
              <select
                value={selectedVariant}
                onChange={(e) =>
                  setSelectedVariant(e.target.value as VariantType)
                }
                className="w-full px-3 py-2 rounded-lg border border-[var(--ui-border)] bg-[var(--ui-background)] text-[var(--ui-text)] focus:outline-none focus:ring-2 focus:ring-[var(--ui-primary)]"
              >
                <option value="dark">Dark - темное затемнение</option>
                <option value="blur">Blur - размытие фона</option>
                <option value="transparent">
                  Transparent - прозрачный фон
                </option>
                <option value="none">None - без стилей</option>
              </select>
            </div>

            {/* Size Selector */}
            <div>
              <label className="block text-sm font-medium text-[var(--ui-text)] mb-2">
                Size (размер)
              </label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value as SizeType)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--ui-border)] bg-[var(--ui-background)] text-[var(--ui-text)] focus:outline-none focus:ring-2 focus:ring-[var(--ui-primary)]"
              >
                <option value="xs">XS - очень маленький</option>
                <option value="sm">SM - маленький</option>
                <option value="md">MD - средний</option>
                <option value="lg">LG - большой</option>
                <option value="xl">XL - очень большой</option>
                <option value="full">FULL - почти полный экран</option>
              </select>
            </div>

            {/* Position Selector */}
            <div>
              <label className="block text-sm font-medium text-[var(--ui-text)] mb-2">
                Position (позиция)
              </label>
              <select
                value={selectedPosition}
                onChange={(e) =>
                  setSelectedPosition(e.target.value as PositionType)
                }
                className="w-full px-3 py-2 rounded-lg border border-[var(--ui-border)] bg-[var(--ui-background)] text-[var(--ui-text)] focus:outline-none focus:ring-2 focus:ring-[var(--ui-primary)]"
              >
                <option value="center">Center - по центру</option>
                <option value="top">Top - сверху</option>
                <option value="top-left">Top Left - верхний левый</option>
                <option value="top-right">Top Right - верхний правый</option>
                <option value="bottom">Bottom - снизу</option>
                <option value="bottom-left">Bottom Left - нижний левый</option>
                <option value="bottom-right">
                  Bottom Right - нижний правый
                </option>
                <option value="left">Left - слева</option>
                <option value="right">Right - справа</option>
              </select>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="flex flex-wrap gap-4 mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={withAnimation}
                onChange={(e) => setWithAnimation(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--ui-border)] text-[var(--ui-primary)] focus:ring-[var(--ui-primary)]"
              />
              <span className="text-sm text-[var(--ui-text)]">Анимация</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={closeOnOverlay}
                onChange={(e) => setCloseOnOverlay(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--ui-border)] text-[var(--ui-primary)] focus:ring-[var(--ui-primary)]"
              />
              <span className="text-sm text-[var(--ui-text)]">
                Закрытие по клику на оверлей
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showCloseBtn}
                onChange={(e) => setShowCloseBtn(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--ui-border)] text-[var(--ui-primary)] focus:ring-[var(--ui-primary)]"
              />
              <span className="text-sm text-[var(--ui-text)]">
                Показывать кнопку закрытия
              </span>
            </label>
          </div>

          {/* Open Custom Modal Button */}
          <Button
            variant="primary"
            size="lg"
            onClick={() => setIsCustomModalOpen(true)}
            className="w-full md:w-auto"
          >
            🚀 Открыть кастомизируемое модальное окно
          </Button>
        </div>

        {/* Preset Examples Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Variants */}
          <div className="p-6 bg-[var(--ui-background)] border border-[var(--ui-border)] rounded-xl">
            <Title size="xl" weight="semibold" className="mb-3">
              🌑 Базовые варианты
            </Title>
            <div className="space-y-2">
              <Button
                variant="primary"
                onClick={() => openModal("dark")}
                fullWidth
              >
                Dark Variant
              </Button>
              <Button
                variant="primary"
                onClick={() => openModal("blur")}
                fullWidth
              >
                Blur Variant
              </Button>
              <Button
                variant="primary"
                onClick={() => openModal("transparent")}
                fullWidth
              >
                Transparent Variant
              </Button>
              <Button
                variant="primary"
                onClick={() => openModal("none")}
                fullWidth
              >
                None Variant
              </Button>
            </div>
          </div>

          {/* Size Examples */}
          <div className="p-6 bg-[var(--ui-background)] border border-[var(--ui-border)] rounded-xl">
            <Title size="sm" weight="semibold" className="mb-3">
              📏 Размеры
            </Title>
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => openModal("size-xs")}
                fullWidth
              >
                XS Size
              </Button>
              <Button
                variant="outline"
                onClick={() => openModal("size-sm")}
                fullWidth
              >
                SM Size
              </Button>
              <Button
                variant="outline"
                onClick={() => openModal("size-md")}
                fullWidth
              >
                MD Size
              </Button>
              <Button
                variant="outline"
                onClick={() => openModal("size-lg")}
                fullWidth
              >
                LG Size
              </Button>
              <Button
                variant="outline"
                onClick={() => openModal("size-xl")}
                fullWidth
              >
                XL Size
              </Button>
              <Button
                variant="outline"
                onClick={() => openModal("size-full")}
                fullWidth
              >
                FULL Size
              </Button>
            </div>
          </div>

          {/* Position Examples */}
          <div className="p-6 bg-[var(--ui-background)] border border-[var(--ui-border)] rounded-xl">
            <Title size="sm" weight="semibold" className="mb-3">
              📍 Позиции
            </Title>
            <div className="space-y-2">
              <Button
                variant="ghost"
                onClick={() => openModal("pos-center")}
                fullWidth
              >
                Center
              </Button>
              <Button
                variant="ghost"
                onClick={() => openModal("pos-top")}
                fullWidth
              >
                Top
              </Button>
              <Button
                variant="ghost"
                onClick={() => openModal("pos-bottom")}
                fullWidth
              >
                Bottom
              </Button>
              <Button
                variant="ghost"
                onClick={() => openModal("pos-left")}
                fullWidth
              >
                Left
              </Button>
              <Button
                variant="ghost"
                onClick={() => openModal("pos-right")}
                fullWidth
              >
                Right
              </Button>
            </div>
          </div>

          {/* Prebuilt Components */}
          <div className="p-6 bg-[var(--ui-background)] border border-[var(--ui-border)] rounded-xl">
            <Title size="sm" weight="semibold" className="mb-3">
              ⚡ Готовые компоненты
            </Title>
            <div className="space-y-2">
              <Button
                variant="primary"
                onClick={() => openModal("simple")}
                fullWidth
              >
                Simple Modal
              </Button>
              <Button
                variant="danger"
                onClick={() => openModal("confirm")}
                fullWidth
              >
                Confirm Modal
              </Button>
            </div>
          </div>

          {/* Complex Content Examples */}
          <div className="p-6 bg-[var(--ui-background)] border border-[var(--ui-border)] rounded-xl">
            <Title size="sm" weight="semibold" className="mb-3">
              🎯 Сложный контент
            </Title>
            <div className="space-y-2">
              <Button
                variant="primary"
                onClick={() => openModal("form")}
                fullWidth
              >
                Форма входа
              </Button>
              <Button
                variant="primary"
                onClick={() => openModal("list")}
                fullWidth
              >
                Список задач
              </Button>
              <Button
                variant="outline"
                onClick={() => openModal("image")}
                fullWidth
              >
                Медиа контент
              </Button>
            </div>
          </div>

          {/* Custom Composition */}
          <div className="p-6 bg-[var(--ui-background)] border border-[var(--ui-border)] rounded-xl">
            <Title size="sm" weight="semibold" className="mb-3">
              🔧 Кастомная композиция
            </Title>
            <div className="space-y-2">
              <Button
                variant="primary"
                onClick={() => openModal("custom-comp")}
                fullWidth
              >
                Свои подкомпоненты
              </Button>
            </div>
          </div>
        </div>

        {/* ==================== MODALS ==================== */}

        {/* Basic Variant Modals */}
        <Modal
          isOpen={activeModal === "dark"}
          onClose={closeModal}
          title="Dark Variant"
          variant="dark"
          size="md"
        >
          <ModalBody>
            <p className="text-[var(--ui-text)]">
              Это модальное окно с темным затемнением фона. Стандартный вариант
              для большинства случаев.
            </p>
          </ModalBody>
          <ModalFooter variant="dark">
            <Button variant="ghost" onClick={closeModal}>
              Отмена
            </Button>
            <Button variant="primary" onClick={closeModal}>
              Подтвердить
            </Button>
          </ModalFooter>
        </Modal>

        <Modal
          isOpen={activeModal === "blur"}
          onClose={closeModal}
          title="Blur Variant"
          variant="blur"
          size="md"
        >
          <ModalBody>
            <p className="text-[var(--ui-text)]">
              Это модальное окно с эффектом размытия фона. Создает modern
              glassmorphism эффект.
            </p>
          </ModalBody>
          <ModalFooter variant="blur">
            <Button variant="ghost" onClick={closeModal}>
              Отмена
            </Button>
            <Button variant="primary" onClick={closeModal}>
              Подтвердить
            </Button>
          </ModalFooter>
        </Modal>

        <Modal
          isOpen={activeModal === "transparent"}
          onClose={closeModal}
          title="Transparent Variant"
          variant="transparent"
          size="md"
        >
          <ModalBody>
            <div className="bg-[var(--ui-background)] rounded-xl p-6 border border-[var(--ui-border)]">
              <p className="text-[var(--ui-text)]">
                Прозрачный фон - только контент. Нужно самостоятельно
                стилизовать содержимое.
              </p>
            </div>
          </ModalBody>
        </Modal>

        <Modal
          isOpen={activeModal === "none"}
          onClose={closeModal}
          title="None Variant"
          variant="none"
          size="md"
        >
          <ModalBody>
            <p className="text-[var(--ui-text)]">
              Без стилей - полный контроль над внешним видом.
            </p>
          </ModalBody>
          <ModalFooter variant="none">
            <Button variant="ghost" onClick={closeModal}>
              Отмена
            </Button>
            <Button variant="primary" onClick={closeModal}>
              Подтвердить
            </Button>
          </ModalFooter>
        </Modal>

        {/* Size Modals */}
        <Modal
          isOpen={activeModal === "size-xs"}
          onClose={closeModal}
          title="XS Size Modal"
          size="xs"
        >
          <ModalBody>
            <p className="text-[var(--ui-text)] text-sm">
              Очень маленькое модальное окно.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="primary" onClick={closeModal} size="sm">
              Закрыть
            </Button>
          </ModalFooter>
        </Modal>

        <Modal
          isOpen={activeModal === "size-sm"}
          onClose={closeModal}
          title="SM Size Modal"
          size="sm"
        >
          <ModalBody>
            <p className="text-[var(--ui-text)]">
              Маленькое модальное окно для простых сообщений.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="primary" onClick={closeModal}>
              Закрыть
            </Button>
          </ModalFooter>
        </Modal>

        <Modal
          isOpen={activeModal === "size-md"}
          onClose={closeModal}
          title="MD Size Modal"
          size="md"
        >
          <ModalBody>
            <p className="text-[var(--ui-text)]">
              Средний размер - оптимальный для большинства случаев.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="primary" onClick={closeModal}>
              Закрыть
            </Button>
          </ModalFooter>
        </Modal>

        <Modal
          isOpen={activeModal === "size-lg"}
          onClose={closeModal}
          title="LG Size Modal"
          size="lg"
        >
          <ModalBody>
            <p className="text-[var(--ui-text)]">
              Большое окно для форм с множеством полей.
            </p>
            <div className="h-32 bg-[var(--ui-background-secondary)] rounded-lg mt-4 flex items-center justify-center">
              Дополнительный контент
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="primary" onClick={closeModal}>
              Закрыть
            </Button>
          </ModalFooter>
        </Modal>

        <Modal
          isOpen={activeModal === "size-xl"}
          onClose={closeModal}
          title="XL Size Modal"
          size="xl"
        >
          <ModalBody>
            <p className="text-[var(--ui-text)] mb-4">
              Очень большое окно для сложного контента.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 bg-[var(--ui-primary)]/10 rounded-lg"></div>
              <div className="h-24 bg-[var(--ui-primary)]/10 rounded-lg"></div>
              <div className="h-24 bg-[var(--ui-primary)]/10 rounded-lg"></div>
              <div className="h-24 bg-[var(--ui-primary)]/10 rounded-lg"></div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="primary" onClick={closeModal}>
              Закрыть
            </Button>
          </ModalFooter>
        </Modal>

        <Modal
          isOpen={activeModal === "size-full"}
          onClose={closeModal}
          title="FULL Size Modal"
          size="full"
        >
          <ModalBody>
            <p className="text-[var(--ui-text)] mb-4">
              Почти полноэкранное модальное окно.
            </p>
            <div className="h-64 bg-[var(--ui-background-secondary)] rounded-lg flex items-center justify-center">
              Много контента здесь
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="primary" onClick={closeModal}>
              Закрыть
            </Button>
          </ModalFooter>
        </Modal>

        {/* Position Modals */}
        <Modal
          isOpen={activeModal === "pos-center"}
          onClose={closeModal}
          title="Center Position"
          position="center"
          size="sm"
        >
          <ModalBody>
            <p className="text-[var(--ui-text)] text-center">
              По центру экрана
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="primary" onClick={closeModal}>
              Закрыть
            </Button>
          </ModalFooter>
        </Modal>

        <Modal
          isOpen={activeModal === "pos-top"}
          onClose={closeModal}
          title="Top Position"
          position="top"
          size="sm"
        >
          <ModalBody>
            <p className="text-[var(--ui-text)] text-center">Вверху экрана</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="primary" onClick={closeModal}>
              Закрыть
            </Button>
          </ModalFooter>
        </Modal>

        <Modal
          isOpen={activeModal === "pos-bottom"}
          onClose={closeModal}
          title="Bottom Position"
          position="bottom"
          size="sm"
        >
          <ModalBody>
            <p className="text-[var(--ui-text)] text-center">Внизу экрана</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="primary" onClick={closeModal}>
              Закрыть
            </Button>
          </ModalFooter>
        </Modal>

        <Modal
          isOpen={activeModal === "pos-left"}
          onClose={closeModal}
          title="Left Position"
          position="left"
          size="sm"
        >
          <ModalBody>
            <p className="text-[var(--ui-text)] text-center">Слева</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="primary" onClick={closeModal}>
              Закрыть
            </Button>
          </ModalFooter>
        </Modal>

        <Modal
          isOpen={activeModal === "pos-right"}
          onClose={closeModal}
          title="Right Position"
          position="right"
          size="sm"
        >
          <ModalBody>
            <p className="text-[var(--ui-text)] text-center">Справа</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="primary" onClick={closeModal}>
              Закрыть
            </Button>
          </ModalFooter>
        </Modal>

        {/* Simple Modal Example */}
        <SimpleModal
          isOpen={activeModal === "simple"}
          onClose={closeModal}
          message="Это простое модальное окно для отображения сообщений!"
          variant="blur"
          size="sm"
        />

        {/* Confirm Modal Example */}
        <ConfirmModal
          isOpen={activeModal === "confirm"}
          onClose={closeModal}
          onConfirm={() => console.log("Confirmed!")}
          message="Вы уверены, что хотите выполнить это действие?"
          confirmText="Да, уверен"
          cancelText="Нет, отмена"
          confirmVariant="danger"
          variant="dark"
          size="sm"
        />

        {/* Form Modal */}
        <Modal
          isOpen={activeModal === "form"}
          onClose={closeModal}
          title="🔐 Вход в систему"
          variant="blur"
          size="md"
        >
          <ModalBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--ui-text)] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="example@mail.com"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--ui-border)] bg-[var(--ui-background)] text-[var(--ui-text)] focus:outline-none focus:ring-2 focus:ring-[var(--ui-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--ui-text)] mb-2">
                  Пароль
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--ui-border)] bg-[var(--ui-background)] text-[var(--ui-text)] focus:outline-none focus:ring-2 focus:ring-[var(--ui-primary)]"
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={closeModal}>
              Отмена
            </Button>
            <Button variant="primary" onClick={closeModal}>
              Войти
            </Button>
          </ModalFooter>
        </Modal>

        {/* List Modal */}
        <Modal
          isOpen={activeModal === "list"}
          onClose={closeModal}
          title="📋 Список задач"
          variant="dark"
          size="md"
        >
          <ModalBody>
            <div className="space-y-2">
              {["Задача 1", "Задача 2", "Задача 3", "Задача 4"].map(
                (task, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg bg-[var(--ui-background-secondary)] hover:bg-[var(--ui-primary)]/10 transition-all cursor-pointer"
                  >
                    <input type="checkbox" className="w-4 h-4 rounded" />
                    <span className="text-[var(--ui-text)]">{task}</span>
                  </div>
                ),
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="primary" onClick={closeModal}>
              Закрыть
            </Button>
          </ModalFooter>
        </Modal>

        {/* Image/Media Modal */}
        <Modal
          isOpen={activeModal === "image"}
          onClose={closeModal}
          title="🖼️ Медиа галерея"
          variant="dark"
          size="lg"
        >
          <ModalBody>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-video bg-gradient-to-br from-[var(--ui-primary)] to-[var(--ui-primary-hover)] rounded-lg flex items-center justify-center text-white opacity-80"
                >
                  Image {i}
                </div>
              ))}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="primary" onClick={closeModal}>
              Закрыть
            </Button>
          </ModalFooter>
        </Modal>

        {/* Custom Composition Modal */}
        <Modal
          isOpen={activeModal === "custom-comp"}
          onClose={closeModal}
          showCloseButton={false}
          variant="transparent"
        >
          <ModalBody>
            <div className="bg-gradient-to-br from-[var(--ui-background)] to-[var(--ui-background-secondary)] border border-[var(--ui-border)] rounded-xl p-6 shadow-2xl">
              <ModalHeader
                title="Кастомная композиция"
                showCloseButton={true}
                onClose={closeModal}
                variant="dark"
              />
              <div className="py-4">
                <p className="text-[var(--ui-text)] mb-3">
                  Это пример использования отдельных подкомпонентов модального
                  окна для создания полностью кастомной структуры.
                </p>
                <div className="p-4 bg-[var(--ui-primary)]/10 rounded-lg">
                  <code className="text-sm text-[var(--ui-text)]">
                    Можно встроить любой сложный контент
                  </code>
                </div>
              </div>
              <ModalFooter variant="dark">
                <Button variant="ghost" onClick={closeModal}>
                  Отмена
                </Button>
                <Button variant="primary" onClick={closeModal}>
                  Сохранить
                </Button>
              </ModalFooter>
            </div>
          </ModalBody>
        </Modal>

        {/* Customizable Modal with all options */}
        <Modal
          isOpen={isCustomModalOpen}
          onClose={() => setIsCustomModalOpen(false)}
          title="🔧 Кастомизируемое модальное окно"
          variant={selectedVariant}
          size={selectedSize}
          position={selectedPosition}
          closeOnOverlayClick={closeOnOverlay}
          showCloseButton={showCloseBtn}
          withAnimation={withAnimation}
          closeOnEsc={true}
        >
          <ModalBody>
            <div className="space-y-4">
              <div className="p-4 bg-[var(--ui-background-secondary)] rounded-lg">
                <p className="text-sm text-[var(--ui-text-secondary)] mb-2">
                  Текущие настройки:
                </p>
                <ul className="text-sm text-[var(--ui-text)] space-y-1">
                  <li>
                    • Variant:{" "}
                    <span className="text-[var(--ui-primary)]">
                      {selectedVariant}
                    </span>
                  </li>
                  <li>
                    • Size:{" "}
                    <span className="text-[var(--ui-primary)]">
                      {selectedSize}
                    </span>
                  </li>
                  <li>
                    • Position:{" "}
                    <span className="text-[var(--ui-primary)]">
                      {selectedPosition}
                    </span>
                  </li>
                  <li>
                    • Animation:{" "}
                    <span className="text-[var(--ui-primary)]">
                      {withAnimation ? "Вкл" : "Выкл"}
                    </span>
                  </li>
                  <li>
                    • Close on overlay:{" "}
                    <span className="text-[var(--ui-primary)]">
                      {closeOnOverlay ? "Да" : "Нет"}
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--ui-text)] mb-2">
                  Имя
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Введите имя"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--ui-border)] bg-[var(--ui-background)] text-[var(--ui-text)] focus:outline-none focus:ring-2 focus:ring-[var(--ui-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--ui-text)] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="example@mail.com"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--ui-border)] bg-[var(--ui-background)] text-[var(--ui-text)] focus:outline-none focus:ring-2 focus:ring-[var(--ui-primary)]"
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter variant={selectedVariant}>
            <Button variant="ghost" onClick={() => setIsCustomModalOpen(false)}>
              Отмена
            </Button>
            <Button variant="primary" onClick={handleFormSubmit}>
              Сохранить
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
}

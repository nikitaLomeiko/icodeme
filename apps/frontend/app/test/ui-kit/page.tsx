"use client";

import { useState } from "react";
import {
  Avatar,
  Button,
  Card,
  CardHeader,
  CardFooter,
  CardSkeleton,
  Carousel,
  Chat,
  Checkbox,
  CodeEnvironment,
  Dropdown,
  EnvironmentProvider,
  FileProvider,
  InputWithSuggestions,
  Loader,
  Markdown,
  Modal,
  Notification,
  PageLoading,
  PasswordField,
  Preview,
  ProgressBar,
  TextareaField,
  TextField,
  ThemeSelector,
  ThemeSwitcher,
  Title,
  ThemeEnum,
  useNotification,
} from "@/shared/ui/kit";

const demoFiles = [
  {
    id: "root",
    name: "src",
    type: "folder" as const,
    content: "",
    children: [
      {
        id: "main",
        name: "main.js",
        type: "file" as const,
        content: 'console.log("Hello from the UI kit")',
        children: [],
      },
    ],
  },
];

const carouselItems = [
  { label: "Discover", color: "from-blue-600 to-cyan-500" },
  { label: "Create", color: "from-emerald-600 to-teal-500" },
  { label: "Practice", color: "from-violet-600 to-fuchsia-500" },
  { label: "Share", color: "from-orange-500 to-rose-500" },
];

const CarouselSlide: React.FC<{ label: string; color: string }> = ({
  label,
  color,
}) => (
  <div
    className={`flex h-40 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-2xl font-semibold text-white`}
  >
    {label}
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section className="min-w-0 space-y-4 rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-background-secondary)] p-5">
    <h2 className="border-b border-[var(--ui-border)] pb-3 text-xl font-semibold text-[var(--ui-text)]">
      {title}
    </h2>
    {children}
  </section>
);

export default function UIKitShowcasePage() {
  const [text, setText] = useState("");
  const [selected, setSelected] = useState("react");
  const [checked, setChecked] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const notices = useNotification();

  return (
    <main className="min-h-screen min-w-0 max-w-full space-y-8 overflow-x-hidden bg-[var(--ui-background)] p-5 text-[var(--ui-text)] md:p-10">
      <header className="mx-auto max-w-7xl min-w-0 space-y-2">
        <Title size="3xl" weight="bold">
          Shared UI Kit showcase
        </Title>
        <p className="text-[var(--ui-text-muted)]">
          Interactive examples and visible states for components exported from
          shared/ui/kit.
        </p>
      </header>

      <div className="mx-auto grid max-w-7xl min-w-0 gap-6">
        <Section title="Buttons, loaders, notifications">
          <div className="flex flex-wrap gap-3">
            {(["primary", "outline", "ghost", "danger"] as const).map(
              (variant) => (
                <Button key={variant} variant={variant}>
                  {variant}
                </Button>
              ),
            )}
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button isLoading>Loading</Button>
            <Button disabled>Disabled</Button>
            <Button fullWidth className="max-w-xs">
              Full width
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-6 rounded-xl border border-[var(--ui-border)] p-4">
            <Loader size="sm" />
            <Loader size="md" />
            <Loader size="lg" />
            <PageLoading />
          </div>
          <div className="flex flex-wrap gap-3">
            {(["success", "info", "warning", "error"] as const).map((type) => (
              <Button
                key={type}
                onClick={() => notices[type](`${type} notification`)}
              >
                {type} notification
              </Button>
            ))}
          </div>
          <Notification
            type="info"
            message="Inline notification preview"
            autoClose={false}
          />
        </Section>

        <Section title="Fields and selection">
          <div className="grid gap-4 md:grid-cols-2">
            {(["square", "rounded", "pill", "underline", "clean"] as const).map(
              (variant) => (
                <TextField
                  key={variant}
                  id={`showcase-${variant}`}
                  label={`${variant} input`}
                  variant={variant}
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Type here"
                />
              ),
            )}
            <TextField
              id="showcase-error"
              label="Error state"
              value="Invalid value"
              onChange={() => {}}
              error="Please check this value"
            />
            <TextField
              id="showcase-disabled"
              label="Disabled"
              value="Unavailable"
              onChange={() => {}}
              disabled
            />
            <PasswordField
              id="showcase-password"
              label="Password"
              value="password123"
              onChange={() => {}}
            />
            <TextareaField
              id="showcase-area"
              label="Textarea"
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={3}
            />
            <InputWithSuggestions
              id="showcase-suggest"
              label="Suggestions"
              value={text}
              onChange={(event) => setText(event.target.value)}
              suggestions={["React", "Next.js", "TypeScript"]}
            />
            <Dropdown
              id="showcase-dropdown"
              label="Dropdown"
              value={selected}
              onChange={(value) => setSelected(String(value))}
              options={[
                { value: "react", label: "React" },
                { value: "next", label: "Next.js" },
                { value: "disabled", label: "Disabled option", disabled: true },
              ]}
              searchable
              clearable
            />
            <div className="space-y-3">
              <Checkbox
                id="showcase-checkbox"
                checked={checked}
                onChange={setChecked}
                label="Checked / unchecked"
              />
              <Checkbox
                id="showcase-checkbox-error"
                checked={false}
                onChange={() => {}}
                label="Error"
                error="This field is required"
              />
              <Checkbox
                id="showcase-checkbox-disabled"
                checked
                disabled
                onChange={() => {}}
                label="Disabled"
              />
            </div>
          </div>
        </Section>

        <Section title="Avatar, title, cards">
          <div className="flex flex-wrap items-center gap-4">
            {(["xs", "sm", "md", "lg", "xl", "2xl", "3xl"] as const).map(
              (size) => (
                <Avatar key={size} initials="UI" size={size} />
              ),
            )}
            <Avatar initials="AB" shape="square" />
            <Avatar initials="CD" shape="rounded" bgColor="#2563eb" />
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {(
              ["default", "elevated", "bordered", "ghost", "gradient"] as const
            ).map((variant) => (
              <Card
                key={variant}
                title={`${variant} card`}
                subtitle="Subtitle sample"
                variant={variant}
                hoverable
                footer="Card footer"
                withFooter
              >
                <p>Card content and spacing preview.</p>
              </Card>
            ))}
            <Card loading>
              <div />
            </Card>
            <Card disabled title="Disabled card">
              Disabled content
            </Card>
          </div>
          <div className="rounded-xl border border-[var(--ui-border)]">
            <CardHeader title="CardHeader" subtitle="Standalone subcomponent" />
            <CardFooter>Standalone CardFooter</CardFooter>
            <CardSkeleton padding="md" />
          </div>
        </Section>

        <Section title="Progress and theme">
          <div className="grid gap-5 md:grid-cols-2">
            <ProgressBar value={35} showValue label="Default / 35%" />
            <ProgressBar
              value={68}
              variant="segmented"
              segments={8}
              showValue
              label="Segmented"
              state="success"
            />
            <ProgressBar
              value={52}
              variant="capsule"
              size="lg"
              state="warning"
              showValue
            />
            <ProgressBar
              value={24}
              variant="square"
              state="error"
              showValue
              labelPosition="top-right"
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <ThemeSwitcher
              availableThemes={Object.values(ThemeEnum)}
              showLabel
            />
            <ThemeSelector
              availableThemes={Object.values(ThemeEnum)}
              showLabel
            />
          </div>
        </Section>

        <Section title="Carousel formats and modal">
          <div className="min-w-0 space-y-3">
            <h3 className="font-medium">Single slide with arrows and dots</h3>
            <Carousel
              className="w-full min-w-0 max-w-full"
              options={{ loop: true, slidesToScroll: 1, speed: 0.35 }}
              showArrows
              showDots
            >
              {carouselItems.map((item) => (
                <CarouselSlide key={item.label} {...item} />
              ))}
            </Carousel>
          </div>

          <div className="min-w-0 space-y-3">
            <h3 className="font-medium">Two slides with spacing</h3>
            <Carousel
              className="w-full min-w-0 max-w-full"
              options={{ slidesToShow: 2, slidesToScroll: 1, gap: 12 }}
              showArrows
            >
              {carouselItems.map((item) => (
                <CarouselSlide key={item.label} {...item} />
              ))}
            </Carousel>
          </div>

          <div className="min-w-0 space-y-3">
            <h3 className="font-medium">Free drag with custom controls</h3>
            <Carousel
              className="w-full min-w-0 max-w-full"
              options={{ dragFree: true, slidesToShow: 1, gap: 16 }}
              enableWheelScroll={false}
              renderArrows={({
                prevDisabled,
                nextDisabled,
                onPrev,
                onNext,
              }) => (
                <div className="pointer-events-none absolute inset-x-3 top-1/2 z-10 flex -translate-y-1/2 justify-between">
                  <Button
                    className="pointer-events-auto !flex !h-10 !w-10 !items-center !justify-center !p-0 !leading-none"
                    disabled={prevDisabled}
                    onClick={onPrev}
                    aria-label="Previous slide"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </Button>
                  <Button
                    className="pointer-events-auto !flex !h-10 !w-10 !items-center !justify-center !p-0 !leading-none"
                    disabled={nextDisabled}
                    onClick={onNext}
                    aria-label="Next slide"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Button>
                </div>
              )}
            >
              {carouselItems.map((item) => (
                <CarouselSlide key={item.label} {...item} />
              ))}
            </Carousel>
          </div>

          <Button onClick={() => setModalOpen(true)}>Open modal</Button>
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Modal preview"
            size="md"
          >
            <div className="space-y-4 p-5">
              <p>Overlay, close button, keyboard and animation states.</p>
              <Button onClick={() => setModalOpen(false)}>Close</Button>
            </div>
          </Modal>
        </Section>

        <Section title="Markdown and preview">
          <Markdown
            content={
              "# Markdown\n\nA paragraph with **bold**, *italic*, and `inline code`.\n\n- One\n- Two\n\n```ts\nconst ready = true;\n```"
            }
          />
          <Preview
            height="420px"
            document={
              '<!doctype html><html><body style="font-family: sans-serif; padding: 24px"><h1>Preview</h1><p>Resize using the device buttons above.</p><button>Example button</button></body></html>'
            }
          />
        </Section>

        <Section title="Chat and terminal">
          <Chat
            logoSrc="/logo/logo.gif"
            username="Assistant"
            messages={[
              { id: "m1", sender: "user", text: "Show a normal message" },
              {
                id: "m2",
                sender: "me",
                text: "Chat supports typing and finished states.",
              },
            ]}
            isTyping
          />
          <Chat
            logoSrc="/logo/logo.gif"
            username="Finished"
            messages={[]}
            isFinished
          />
        </Section>

        <Section title="Code environment and editor">
          <FileProvider initialFileSystem={demoFiles}>
            <EnvironmentProvider>
              <CodeEnvironment
                className="h-[560px]"
                onRun={() => notices.info("Run action preview")}
              />
            </EnvironmentProvider>
          </FileProvider>
        </Section>
      </div>
    </main>
  );
}

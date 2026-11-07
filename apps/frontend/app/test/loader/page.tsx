"use client";

import { Loader, Button, UIThemeProvider, ThemeEnum } from "@/shared/ui/kit";
import { useTheme } from "@/shared/ui/kit/theme";

export default function LoaderTestPage() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === ThemeEnum.LIGHT ? ThemeEnum.DARK : ThemeEnum.LIGHT);
  };

  return (
    <div className="min-h-screen p-8 space-y-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Loader Test Page</h1>
        <Button variant="outline" onClick={toggleTheme}>
          {theme === ThemeEnum.LIGHT ? "Dark" : "Light"} Theme
        </Button>
      </div>

      {/* Размеры */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Sizes</h2>
        <div className="flex items-center gap-8 p-6 border rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <Loader size="sm" />
            <span className="text-sm text-gray-500">sm</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Loader size="md" />
            <span className="text-sm text-gray-500">md</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Loader size="lg" />
            <span className="text-sm text-gray-500">lg</span>
          </div>
        </div>
      </section>

      {/* Кастомные цвета */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Custom Colors</h2>
        <div className="flex items-center gap-8 p-6 border rounded-lg">
          <Loader color="#ef4444" />
          <Loader color="#22c55e" />
          <Loader color="#3b82f6" />
          <Loader color="#f59e0b" />
          <Loader color="#8b5cf6" />
        </div>
      </section>

      {/* С контекстом */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">With Context</h2>
        <div className="flex flex-col gap-6 p-6 border rounded-lg">
          <div className="flex items-center gap-4">
            <Loader size="sm" />
            <span>Loading...</span>
          </div>
          <div className="flex items-center justify-center gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
            <Loader size="md" />
            <span className="text-lg">Please wait</span>
          </div>
          <div className="flex flex-col items-center gap-4 p-8 border-2 border-dashed rounded-lg">
            <Loader size="lg" />
            <span className="text-xl font-medium">Processing...</span>
          </div>
        </div>
      </section>

      {/* Button с isLoading */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Button with isLoading</h2>
        <div className="flex flex-wrap gap-4 p-6 border rounded-lg">
          <Button variant="primary" isLoading>
            Primary
          </Button>
          <Button variant="outline" isLoading>
            Outline
          </Button>
          <Button variant="ghost" isLoading>
            Ghost
          </Button>
          <Button variant="danger" isLoading>
            Danger
          </Button>
        </div>
      </section>
    </div>
  );
}

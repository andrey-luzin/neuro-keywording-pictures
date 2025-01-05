'use client';
import { Button } from "@/components/Button";
import { useRef } from "react";

export default function MainPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = () => {
    console.log('handleInputChange');
  };

  return (
    <main className="p-8 font-[family-name:var(--font-geist-sans)] relative min-h-screen">
      <input
        className="invisible absolute"
        ref={inputRef}
        type="file"
        /* @ts-expect-error: webkitdirectory is working in modern browsers */
        webkitdirectory="true"
        directory="true"
        multiple
        onChange={handleInputChange}
      />
      <Button onClick={handleButtonClick}>Выбери директорию или файлы</Button>
    </main>
  );
}

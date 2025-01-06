import { UploadFiles } from "@/components/UploadFiles";

export default function MainPage() {
  return (
    <main className="p-8 font-[family-name:var(--font-geist-sans)] h-screen">
      <div className="h-full">
        <UploadFiles />
      </div>
    </main>
  );
}

"use client";

import { useCallback, useRef, useState } from "react";

interface UploadZoneProps {
  onSubmit: (formData: FormData) => void;
  isLoading: boolean;
}

export function UploadZone({ onSubmit, isLoading }: UploadZoneProps) {
  const [mode, setMode] = useState<"url" | "file">("url");
  const [url, setUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [fileBase64, setFileBase64] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (file.type !== "application/pdf") return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setFileBase64(base64);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSubmit = () => {
    const fd = new FormData();
    if (mode === "url") {
      fd.set("type", "linkedin_url");
      fd.set("linkedinUrl", url);
    } else {
      fd.set("type", "pdf_upload");
      fd.set("fileBase64", fileBase64);
      fd.set("fileName", fileName);
    }
    onSubmit(fd);
  };

  const canSubmit = mode === "url" ? url.length > 0 : fileBase64.length > 0;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {/* Mode toggle */}
      <div
        role="tablist"
        aria-label="Método de entrada"
        className="flex gap-1 rounded-2xl bg-zinc-900/80 p-1.5 backdrop-blur-sm"
      >
        {([
          { key: "url" as const, label: "🔗 URL do LinkedIn", icon: "link" },
          { key: "file" as const, label: "📄 Upload PDF", icon: "file" },
        ]).map(({ key, label }) => (
          <button
            key={key}
            role="tab"
            aria-selected={mode === key}
            aria-controls={`panel-${key}`}
            onClick={() => setMode(key)}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
              mode === key
                ? "bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg shadow-cyan-500/20"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Input panels */}
      <div
        id={`panel-${mode}`}
        role="tabpanel"
        aria-label={mode === "url" ? "Entrada de URL" : "Upload de arquivo"}
      >
        {mode === "url" ? (
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
              <svg
                className="h-5 w-5 text-zinc-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://linkedin.com/in/seu-perfil"
              aria-label="URL do perfil LinkedIn"
              className="w-full rounded-2xl border border-white/10 bg-zinc-900/80 py-4 pl-12 pr-5 text-white placeholder-zinc-500 outline-none backdrop-blur-sm transition-all focus:border-cyan-500/50 focus:shadow-[0_0_30px_rgba(6,182,212,0.08)] focus:ring-1 focus:ring-cyan-500/30"
            />
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files[0];
              if (file) handleFile(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Área de upload de PDF. Clique ou arraste um arquivo."
            className={`group flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-8 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
              isDragging
                ? "border-cyan-400 bg-cyan-500/5 shadow-[0_0_40px_rgba(6,182,212,0.1)]"
                : fileName
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-white/10 bg-zinc-900/50 hover:border-white/20 hover:bg-zinc-900/80"
            }`}
          >
            {fileName ? (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
                  <svg
                    className="h-7 w-7 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-emerald-300">
                    {fileName}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Clique para trocar o arquivo
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 transition-colors group-hover:bg-zinc-700">
                  <svg
                    className="h-7 w-7 text-zinc-400 transition-colors group-hover:text-cyan-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm text-zinc-300">
                    <span className="font-medium text-cyan-400">
                      Clique para selecionar
                    </span>{" "}
                    ou arraste seu PDF
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    PDF até 3.5MB
                  </p>
                </div>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              aria-hidden="true"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>
        )}
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={isLoading || !canSubmit}
        aria-label={isLoading ? "Analisando perfil..." : "Iniciar análise do perfil"}
        aria-busy={isLoading}
        className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-4 font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-50 disabled:shadow-none"
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform group-hover:translate-x-full group-hover:duration-1000" />

        <span className="relative flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                aria-hidden="true"
              />
              Analisando com IA...
            </>
          ) : (
            <>
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Analisar Perfil
            </>
          )}
        </span>
      </button>
    </div>
  );
}

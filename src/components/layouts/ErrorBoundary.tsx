"use client";

import type { ReactNode } from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";

type ErrorBoundaryProps = {
  children: ReactNode;
};

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="max-w-md text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">
          エラーが発生しました
        </h2>
        <p className="text-gray-600">
          {error.message || "コンテンツの読み込みに失敗しました"}
        </p>
        <button
          type="button"
          onClick={resetErrorBoundary}
          className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          再試行
        </button>
      </div>
    </div>
  );
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // ページをリロードして再試行
        window.location.reload();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

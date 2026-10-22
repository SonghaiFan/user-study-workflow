import type { ReactNode } from "react";
import { Button } from "./components/ui/button";
/** The news introduction card, with study-specific contents passed as children. */
export function InfoPage({
  title,
  children,
  onContinue,
  label = "Continue",
  busy = false,
}: {
  title: string;
  children: ReactNode;
  onContinue: () => void;
  label?: string;
  busy?: boolean;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black/5 p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 max-w-5xl w-full mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">{title}</h2>
        <div className="text-gray-600 text-lg max-w-none mb-8">{children}</div>
        <div className="flex justify-end mt-10">
          <Button
            onClick={onContinue}
            variant="primary"
            size="lg"
            disabled={busy}
          >
            {label}
          </Button>
        </div>
      </div>
    </div>
  );
}

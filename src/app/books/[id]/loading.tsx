import { Spinner } from "@/components/ui/spinner";

export default function BookDetailLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
      <Spinner className="size-6" />
    </div>
  );
}

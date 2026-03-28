import { Spinner } from "@/components/ui/spinner";

export default function BooksLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <Spinner className="size-6" />
    </div>
  );
}

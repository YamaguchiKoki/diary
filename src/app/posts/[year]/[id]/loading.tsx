import { Spinner } from "@/components/ui/spinner";

export default function PostDetailLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Spinner className="size-6" />
    </div>
  );
}

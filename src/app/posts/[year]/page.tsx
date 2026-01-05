import { ScrollArea } from "@/components/layouts/ScrollArea";
import { FloatingHeader } from "@/components/ui/FloatingHeader";
import type { PostYearParams } from "@/lib/routes";
import { PostListSection } from "@/modules/posts/ui/section/post-list";

type Props = {
  params: Promise<PostYearParams>;
};

export default async function YearPage({ params }: Props) {
  const { year } = await params;

  return (
    <ScrollArea className="lg:hidden">
      <FloatingHeader title={`${year}年の日記`} />
      <PostListSection year={year} isMobile />
    </ScrollArea>
  );
}

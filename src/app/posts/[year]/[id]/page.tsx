import { notFound } from "next/navigation";
import { ScrollArea } from "@/components/layouts/ScrollArea";
import { FloatingHeader } from "@/components/ui/FloatingHeader";
import { type PostDetailParams, routes } from "@/lib/routes";
import { getYearRange } from "@/lib/utils";
import { getPost, getPostsByYear } from "@/modules/notion/service/api";
import { PostDetailSection } from "@/modules/posts/ui/section/post-detail";

type Props = {
  params: Promise<PostDetailParams>;
};

export async function generateStaticParams() {
  const years = getYearRange();

  const allParams = await Promise.all(
    years.map(async (year) => {
      const posts = await getPostsByYear(year);
      return posts.map((post) => ({
        year: String(year),
        id: post.id,
      }));
    }),
  );

  return allParams.flat();
}

export default async function PostPage({ params }: Props) {
  const { year, id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  return (
    <ScrollArea className="bg-white h-screen overflow-y-auto" useScrollAreaId>
      <FloatingHeader
        scrollTitle={post.title}
        goBackLink={routes.posts.year(Number(year))}
      />
      <PostDetailSection postId={id} />
    </ScrollArea>
  );
}

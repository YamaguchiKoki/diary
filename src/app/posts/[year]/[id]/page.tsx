import { ScrollArea } from "@/components/layouts/ScrollArea";
import { type PostDetailParams, routes } from "@/lib/routes";
import { getYearRange } from "@/lib/utils";
import { getPostsByYear } from "@/modules/posts/service/api";
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

  return (
    <ScrollArea className="bg-white h-screen overflow-y-auto" useScrollAreaId>
      <PostDetailSection
        postId={id}
        goBackLink={routes.posts.year(Number(year))}
      />
    </ScrollArea>
  );
}

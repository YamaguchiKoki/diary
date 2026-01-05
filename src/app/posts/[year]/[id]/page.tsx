import { Suspense } from "react";
import { ErrorBoundary } from "@/components/layouts/ErrorBoundary";
import { ScrollArea } from "@/components/layouts/ScrollArea";
import { type PostDetailParams, routes } from "@/lib/routes";
import { getYearRange } from "@/lib/utils";
import { getPost, getPostsByYear } from "@/modules/notion/service/api";
import { PostDetailSection } from "@/modules/posts/ui/section/post-detail";
import { PostDetailHeader } from "@/modules/posts/ui/view/post-detail-header";

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
  const postPromise = getPost(id);

  return (
    <ScrollArea className="bg-white h-screen overflow-y-auto" useScrollAreaId>
      <ErrorBoundary>
        <Suspense fallback={<div />}>
          <PostDetailHeader
            postPromise={postPromise}
            goBackLink={routes.posts.year(Number(year))}
          />
        </Suspense>
      </ErrorBoundary>
      <PostDetailSection postId={id} />
    </ScrollArea>
  );
}

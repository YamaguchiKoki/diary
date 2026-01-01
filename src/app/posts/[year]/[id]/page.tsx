import { notFound } from "next/navigation";
import { ScrollArea } from "@/components/layouts/ScrollArea";
import { BlockRenderer } from "@/feature/post/components/BlockRenderer";
import { FloatingHeader } from "@/feature/post/components/FloatingHeader";
import { PageTitle } from "@/feature/post/components/PageTitle";
import { getPost, getPostsByYear } from "@/lib/content/notion/api";
import { type PostDetailParams, routes } from "@/lib/routes";
import { getYearRange } from "@/lib/utils";

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
      <div className="content-wrapper @container/writing px-4 lg:py-20 lg:px-16">
        <article className="content">
          <PageTitle
            title={post.title}
            subtitle={<time className="text-gray-400">{post.publishedAt}</time>}
            className="mb-6 flex flex-col gap-3"
          />
          <div>
            {post.blocks.map((block, i) => (
              <BlockRenderer key={`${block.type}-${i}`} block={block} />
            ))}
          </div>
        </article>
      </div>
    </ScrollArea>
  );
}

import { notFound } from "next/navigation";
import { ScrollArea } from "@/components/layouts/ScrollArea";
import { BlockRenderer } from "@/feature/post/components/BlockRenderer";
import { FloatingHeader } from "@/feature/post/components/FloatingHeader";
import { PageTitle } from "@/feature/post/components/PageTitle";
import { getPost, getPosts } from "@/lib/content/notion/api";
import { type PostDetailParams, routes } from "@/lib/routes";

type Props = {
  params: Promise<PostDetailParams>;
};

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ id: post.id }));
}

export default async function PostPage({ params }: Props) {
  const { year, id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  return (
    <ScrollArea
      className="bg-white h-screen overflow-y-auto py-20 px-16"
      useScrollAreaId
    >
      <FloatingHeader
        scrollTitle={post.title}
        goBackLink={routes.posts.year(Number(year))}
      />
      <div className="content-wrapper @container/writing">
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

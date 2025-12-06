import { notFound } from "next/navigation";
import { BlockRenderer } from "@/app/feature/post/components/BlockRenderer";
import { getPost, getPosts } from "@/lib/content/notion/api";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ id: post.id }));
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  return (
    <main className="max-w-2xl mx-auto py-12 px-4">
      <article>
        <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
        {post.publishedAt && (
          <time className="text-sm text-gray-500 block mb-8">
            {post.publishedAt}
          </time>
        )}
        <div>
          {post.blocks.map((block, i) => (
            <BlockRenderer key={`${block.type}-${i}`} block={block} />
          ))}
        </div>
      </article>
    </main>
  );
}

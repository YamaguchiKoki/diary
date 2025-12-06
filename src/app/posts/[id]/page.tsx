import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/components/custom/blocks/BlockRenderer";
import { getPost, getPosts } from "@/lib/content/notion/api";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ id: post.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    return { title: "Not Found" };
  }

  return {
    title: post.title,
    openGraph: {
      title: post.title,
      images: [`/api/og?title=${encodeURIComponent(post.title)}`],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      images: [`/api/og?title=${encodeURIComponent(post.title)}`],
    },
  };
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

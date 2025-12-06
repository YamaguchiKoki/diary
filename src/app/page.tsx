import Image from "next/image";
import Link from "next/link";
import { getPosts } from "@/lib/content/notion/api";

export default async function Home() {
  const posts = await getPosts();

  return (
    <main className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>
      <ul className="space-y-6">
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              href={`/posts/${post.id}`}
              className="block hover:bg-gray-50 rounded-lg transition overflow-hidden border"
            >
              <Image
                src={`/api/og?title=${encodeURIComponent(post.title)}`}
                alt={post.title}
                width={1200}
                height={630}
                className="w-full h-auto"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold">{post.title}</h2>
                {post.publishedAt && (
                  <time className="text-sm text-gray-500">
                    {post.publishedAt}
                  </time>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

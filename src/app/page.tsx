import { PostCard } from "@/app/feature/post/components/PostCard";
import { BentoGrid } from "@/components/layouts/BentoGrid";
import { getPosts } from "@/lib/content/notion/api";

export default async function Home() {
  const posts = await getPosts();

  return (
    <main className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>
      <BentoGrid>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </BentoGrid>
    </main>
  );
}

import { type ReactNode, Suspense } from "react";

import { SideMenu } from "@/components/ui/SideMenu";
import { PostList } from "@/feature/post/components/PostList";
import { getPostsByYear } from "@/lib/content/notion/api";

type Props = {
  children: ReactNode;
  params: Promise<{ year: string }>;
};

export default async function YearLayout({ children, params }: Props) {
  const { year } = await params;
  const posts = await getPostsByYear(Number(year));

  return (
    <>
      <SideMenu title={`${year}年`}>
        <Suspense fallback={<div>Loading...</div>}>
          <PostList posts={posts} year={year} />
        </Suspense>
      </SideMenu>
      <div className="flex-1 lg:bg-dots">{children}</div>
    </>
  );
}

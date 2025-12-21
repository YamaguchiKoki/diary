import { type ReactNode, Suspense } from "react";

import { SideMenu } from "@/components/ui/SideMenu";
import { PostList } from "@/feature/post/components/PostList";
import { getPostsByYear } from "@/lib/content/notion/api";

type Props = {
  children: ReactNode;
  params: Promise<{ year: string }>;
};

export default async function YearLayout({ children, params }: Props) {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <YearSideMenu params={params} />
      </Suspense>
      <div className="flex-1 lg:bg-dots">{children}</div>
    </>
  );
}

async function YearSideMenu({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  const posts = await getPostsByYear(Number(year));

  return (
    <SideMenu title={`${year}年`} isInner>
      <PostList posts={posts} year={year} />
    </SideMenu>
  );
}

import type { ReactNode } from "react";

import { SideMenu } from "@/components/ui/SideMenu";
import { getYearRange } from "@/lib/utils";
import { PostListSection } from "@/modules/posts/ui/section/post-list";

type Props = {
  children: ReactNode;
  params: Promise<{ year: string }>;
};

export async function generateStaticParams() {
  const years = getYearRange();
  return years.map((year) => ({ year: String(year) }));
}

export default async function YearLayout({ children, params }: Props) {
  const { year } = await params;

  return (
    <>
      <SideMenu title={`${year}年`} isInner>
        <PostListSection year={year} />
      </SideMenu>
      <div className="flex-1 lg:bg-dots">{children}</div>
    </>
  );
}

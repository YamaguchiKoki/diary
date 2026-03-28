import { type ReactNode, Suspense } from "react";

import { ErrorBoundary } from "@/components/layouts/ErrorBoundary";
import { SideMenu } from "@/components/ui/SideMenu";
import { Spinner } from "@/components/ui/spinner";
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
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="flex justify-center p-4">
                <Spinner className="size-5" />
              </div>
            }
          >
            <PostListSection year={year} />
          </Suspense>
        </ErrorBoundary>
      </SideMenu>
      <div className="flex-1 lg:bg-dots">{children}</div>
    </>
  );
}

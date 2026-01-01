import type { FC, ReactNode } from "react";
import Balancer from "react-wrap-balancer";
import { cn } from "@/lib/utils";

type PageTitleProps = {
  title: string;
  subtitle: string | ReactNode;
  className?: string;
};

export const PageTitle: FC<PageTitleProps> = ({
  title,
  subtitle,
  className,
}) => {
  return (
    <div className={cn("mb-6", className)}>
      <Balancer
        as="h1"
        className="text-4xl md:text-5xl font-bold tracking-tight"
      >
        {title}
      </Balancer>
      {subtitle}
    </div>
  );
};

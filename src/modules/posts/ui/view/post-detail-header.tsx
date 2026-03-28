import type { FC } from "react";
import { FloatingHeader } from "@/components/ui/FloatingHeader";

type PostDetailHeaderProps = {
  title: string;
  goBackLink: string;
};

export const PostDetailHeader: FC<PostDetailHeaderProps> = ({
  title,
  goBackLink,
}) => {
  return <FloatingHeader scrollTitle={title} goBackLink={goBackLink} />;
};

import type { FC } from "react";
import { FloatingHeader } from "@/components/ui/FloatingHeader";

type ReadingNoteDetailHeaderProps = {
  title: string;
  goBackLink: string;
};

export const ReadingNoteDetailHeader: FC<ReadingNoteDetailHeaderProps> = ({
  title,
  goBackLink,
}) => {
  return <FloatingHeader scrollTitle={title} goBackLink={goBackLink} />;
};

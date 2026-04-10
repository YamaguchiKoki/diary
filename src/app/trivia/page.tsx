import { ScrollArea } from "@/components/layouts/ScrollArea";
import { FloatingHeader } from "@/components/ui/FloatingHeader";
import { TriviaListSection } from "@/modules/trivia/ui/section/trivia-list-section";

export default function TriviaPage() {
  return (
    <ScrollArea
      className="bg-white h-screen overflow-x-hidden overflow-y-auto"
      useScrollAreaId
    >
      <FloatingHeader title="豆知識" />
      <TriviaListSection />
    </ScrollArea>
  );
}

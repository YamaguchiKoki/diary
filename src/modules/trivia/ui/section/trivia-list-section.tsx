import { PageTitle } from "@/components/ui/PageTitle";
import { getTriviaList } from "@/modules/trivia/service/api";
import { TriviaListView } from "@/modules/trivia/ui/view/trivia-list-view";

export async function TriviaListSection() {
  const triviaList = await getTriviaList();

  return (
    <div className="px-4 py-8">
      <PageTitle
        title="豆知識"
        subtitle={
          <p className="text-gray-600 mt-2">{triviaList.length}件の豆知識</p>
        }
      />
      <TriviaListView triviaList={triviaList} />
    </div>
  );
}

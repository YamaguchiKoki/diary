import { Highlighter } from "@/components/ui/highlighter";
import { PageTitle } from "@/feature/post/components/PageTitle";

export default async function Home() {
  return (
    <main className="max-w-4xl py-20 px-16">
      <PageTitle title="このサイトについて" subtitle />
      <div className="flex flex-col gap-y-4">
        <section>
          <h2 className="text-2xl font-bold mb-4">
            <Highlighter action="underline" color="#0000ff" multiline={false}>
              やること
            </Highlighter>
          </h2>
          <ul className="space-y-2">
            <li>
              <p>日記を投稿します(毎日投稿とは限らない)。</p>
            </li>
            <li>
              <p>Notion APIの仕様が許す限りデコります。</p>
            </li>
            <li>
              <p>１週間に１回は投稿します。</p>
            </li>
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-bold mb-4">
            <Highlighter action="underline" color="#0000ff" multiline={false}>
              やらないこと
            </Highlighter>
          </h2>
          <ul className="space-y-2">
            <li>
              <p>このページのような構造化された形式では書きません。</p>
            </li>
            <li>
              <p>毎日投稿はしません。</p>
            </li>
            <li>
              <p>各投稿間の連続性は意識しません。</p>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}

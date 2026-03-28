import { render, screen } from "@testing-library/react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { usePathname, useSearchParams } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TopicFilter } from "../TopicFilter";

// next/navigationのモック
vi.mock("next/navigation");

describe("TopicFilter", () => {
  beforeEach(() => {
    // デフォルトのパスを設定
    vi.mocked(usePathname).mockReturnValue("/books");
    // デフォルトのSearchParamsを設定（トピックなし）
    vi.mocked(useSearchParams).mockReturnValue({
      get: vi.fn().mockReturnValue(null),
    } as unknown as ReadonlyURLSearchParams);
  });
  it("トピック一覧が表示される（Allは表示されない）", () => {
    const topics = ["プログラミング", "技術書", "ビジネス"];

    render(<TopicFilter topics={topics} />);

    expect(screen.queryByText("All")).not.toBeInTheDocument();
    expect(screen.getByText("プログラミング")).toBeInTheDocument();
    expect(screen.getByText("技術書")).toBeInTheDocument();
    expect(screen.getByText("ビジネス")).toBeInTheDocument();
  });

  it("トピックが空の場合はリンクが表示されない", () => {
    render(<TopicFilter topics={[]} />);

    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  it("トピックの数だけリンクが表示される", () => {
    const topics = ["トピック1", "トピック2", "トピック3", "トピック4"];

    render(<TopicFilter topics={topics} />);

    const links = screen.getAllByRole("link");
    expect(links.length).toBe(topics.length);
  });

  it("各トピックが正しいURLを持つ", () => {
    const topics = ["プログラミング"];

    render(<TopicFilter topics={topics} />);

    const topicLink = screen.getByText("プログラミング").closest("a");

    expect(topicLink).toHaveAttribute(
      "href",
      "/books?topic=%E3%83%97%E3%83%AD%E3%82%B0%E3%83%A9%E3%83%9F%E3%83%B3%E3%82%B0",
    );
  });

  it("選択中のトピックがアクティブ状態で表示される", () => {
    vi.mocked(usePathname).mockReturnValue("/books");
    vi.mocked(useSearchParams).mockReturnValue({
      get: vi.fn().mockReturnValue("プログラミング"),
    } as unknown as ReadonlyURLSearchParams);

    const topics = ["プログラミング", "技術書"];

    render(<TopicFilter topics={topics} />);

    const programmingLink = screen.getByText("プログラミング").closest("a");
    const techBookLink = screen.getByText("技術書").closest("a");

    expect(programmingLink).toHaveClass("bg-primary", "text-white");
    expect(techBookLink).not.toHaveClass("bg-primary");
  });

  it("トピックが選択されていない場合はどのトピックもアクティブでない", () => {
    vi.mocked(usePathname).mockReturnValue("/books");

    const topics = ["プログラミング"];

    render(<TopicFilter topics={topics} />);

    const topicLink = screen.getByText("プログラミング").closest("a");

    expect(topicLink).not.toHaveClass("bg-primary");
  });
});

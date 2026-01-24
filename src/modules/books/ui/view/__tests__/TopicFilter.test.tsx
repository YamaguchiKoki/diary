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
  it("All とトピック一覧が表示される", () => {
    const topics = ["プログラミング", "技術書", "ビジネス"];

    render(<TopicFilter topics={topics} />);

    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("プログラミング")).toBeInTheDocument();
    expect(screen.getByText("技術書")).toBeInTheDocument();
    expect(screen.getByText("ビジネス")).toBeInTheDocument();
  });

  it("トピックが空の場合はAllのみ表示される", () => {
    render(<TopicFilter topics={[]} />);

    expect(screen.getByText("All")).toBeInTheDocument();
  });

  it("トピックの数だけリンクが表示される", () => {
    const topics = ["トピック1", "トピック2", "トピック3", "トピック4"];

    render(<TopicFilter topics={topics} />);

    const links = screen.getAllByRole("link");
    // All + トピックの数
    expect(links.length).toBe(topics.length + 1);
  });

  it("各トピックが正しいURLを持つ", () => {
    const topics = ["プログラミング"];

    render(<TopicFilter topics={topics} />);

    const allLink = screen.getByText("All").closest("a");
    const topicLink = screen.getByText("プログラミング").closest("a");

    expect(allLink).toHaveAttribute("href", "/books");
    expect(topicLink).toHaveAttribute(
      "href",
      "/books?topic=%E3%83%97%E3%83%AD%E3%82%B0%E3%83%A9%E3%83%9F%E3%83%B3%E3%82%B0",
    );
  });

  it("選択中のトピックがアクティブ状態で表示される", () => {
    vi.mocked(usePathname).mockReturnValue("/books");
    // トピックが選択されている状態をモック
    vi.mocked(useSearchParams).mockReturnValue({
      get: vi.fn().mockReturnValue("プログラミング"),
    } as unknown as ReadonlyURLSearchParams);

    const topics = ["プログラミング", "技術書"];

    render(<TopicFilter topics={topics} />);

    const programmingLink = screen.getByText("プログラミング").closest("a");
    const techBookLink = screen.getByText("技術書").closest("a");

    // プログラミングがアクティブ
    expect(programmingLink).toHaveClass("bg-gray-200");
    // 技術書は非アクティブ
    expect(techBookLink).not.toHaveClass("bg-gray-200");
  });

  it("トピックが選択されていない場合はAllがアクティブ", () => {
    vi.mocked(usePathname).mockReturnValue("/books");

    const topics = ["プログラミング"];

    render(<TopicFilter topics={topics} />);

    const allLink = screen.getByText("All").closest("a");
    const topicLink = screen.getByText("プログラミング").closest("a");

    // Allがアクティブ
    expect(allLink).toHaveClass("bg-gray-200");
    // トピックは非アクティブ
    expect(topicLink).not.toHaveClass("bg-gray-200");
  });
});

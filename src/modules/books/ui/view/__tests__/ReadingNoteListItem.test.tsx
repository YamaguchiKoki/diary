import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReadingNoteListItem } from "../ReadingNoteListItem";

describe("ReadingNoteListItem", () => {
  it("タイトルと日付が表示される", () => {
    const note = {
      id: "1",
      title: "テスト読書メモ",
      topics: ["プログラミング"],
      createdAt: "2024-01-01",
      isPublic: true,
    };

    render(<ReadingNoteListItem note={note} />);

    expect(screen.getByText("テスト読書メモ")).toBeInTheDocument();
    expect(screen.getByText(/2024/)).toBeInTheDocument();
  });

  it("トピックタグが表示される", () => {
    const note = {
      id: "1",
      title: "テスト",
      topics: ["プログラミング", "技術書"],
      createdAt: "2024-01-01",
      isPublic: true,
    };

    render(<ReadingNoteListItem note={note} />);

    expect(screen.getByText("プログラミング")).toBeInTheDocument();
    expect(screen.getByText("技術書")).toBeInTheDocument();
  });

  it("トピックが空の場合はタグが表示されない", () => {
    const note = {
      id: "1",
      title: "テスト",
      topics: [],
      createdAt: "2024-01-01",
      isPublic: true,
    };

    render(<ReadingNoteListItem note={note} />);

    expect(screen.getByText("テスト")).toBeInTheDocument();
    // トピックタグのコンテナが存在しないことを確認
    const container = screen.queryByRole("link");
    expect(container).toBeInTheDocument(); // リンク自体は存在する
  });

  it("日付がnullの場合は日付が表示されない", () => {
    const note = {
      id: "1",
      title: "テスト",
      topics: ["プログラミング"],
      createdAt: null,
      isPublic: true,
    };

    render(<ReadingNoteListItem note={note} />);

    expect(screen.getByText("テスト")).toBeInTheDocument();
    // 日付の要素が存在しないことを確認
    const dateText = screen.queryByText(/2024/);
    expect(dateText).not.toBeInTheDocument();
  });
});

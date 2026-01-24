import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReadingNoteDetailView } from "../ReadingNoteDetailView";

describe("ReadingNoteDetailView", () => {
  it("タイトル、日付、トピックが表示される", () => {
    const note = {
      id: "1",
      title: "テスト読書メモ",
      topics: ["プログラミング", "技術書"],
      createdAt: "2024-01-01",
      isPublic: true,
      blocks: [],
    };

    render(<ReadingNoteDetailView note={note} />);

    expect(screen.getByText("テスト読書メモ")).toBeInTheDocument();
    expect(screen.getByText(/2024/)).toBeInTheDocument();
    expect(screen.getByText("プログラミング")).toBeInTheDocument();
    expect(screen.getByText("技術書")).toBeInTheDocument();
  });

  it("トピックが空の場合はトピックセクションが表示されない", () => {
    const note = {
      id: "1",
      title: "テスト読書メモ",
      topics: [],
      createdAt: "2024-01-01",
      isPublic: true,
      blocks: [],
    };

    render(<ReadingNoteDetailView note={note} />);

    expect(screen.getByText("テスト読書メモ")).toBeInTheDocument();
    // トピックリンクが存在しないことを確認
    const topicLinks = screen.queryAllByRole("link");
    // タイトルのリンクのみ存在する可能性があるため、トピックリンクがないことを確認
    expect(topicLinks.length).toBe(0);
  });

  it("日付がnullの場合は日付が表示されない", () => {
    const note = {
      id: "1",
      title: "テスト読書メモ",
      topics: ["プログラミング"],
      createdAt: null,
      isPublic: true,
      blocks: [],
    };

    render(<ReadingNoteDetailView note={note} />);

    expect(screen.getByText("テスト読書メモ")).toBeInTheDocument();
    // 日付の要素が存在しないことを確認
    const dateText = screen.queryByText(/2024/);
    expect(dateText).not.toBeInTheDocument();
  });

  it("本文ブロックが空の場合でも正しく表示される", () => {
    const note = {
      id: "1",
      title: "テスト読書メモ",
      topics: ["プログラミング"],
      createdAt: "2024-01-01",
      isPublic: true,
      blocks: [],
    };

    render(<ReadingNoteDetailView note={note} />);

    expect(screen.getByText("テスト読書メモ")).toBeInTheDocument();
    // ブロックがなくてもページが正常に表示されることを確認
  });
});

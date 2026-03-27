import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReadingNoteListView } from "../ReadingNoteListView";

describe("ReadingNoteListView", () => {
  it("読書メモの一覧が表示される", () => {
    const notes = [
      {
        id: "1",
        title: "テスト読書メモ1",
        topics: ["プログラミング"],
        createdAt: "2024-01-01",
        isPublic: true,
      },
      {
        id: "2",
        title: "テスト読書メモ2",
        topics: ["技術書"],
        createdAt: "2024-01-02",
        isPublic: true,
      },
    ];

    render(<ReadingNoteListView notes={notes} />);

    expect(screen.getByText("テスト読書メモ1")).toBeInTheDocument();
    expect(screen.getByText("テスト読書メモ2")).toBeInTheDocument();
  });

  it("読書メモが0件の場合、メッセージが表示される", () => {
    render(<ReadingNoteListView notes={[]} />);

    expect(
      screen.getByText("読書メモが見つかりませんでした。"),
    ).toBeInTheDocument();
  });

  it("複数の読書メモが正しく表示される", () => {
    const notes = Array.from({ length: 5 }, (_, i) => ({
      id: `${i + 1}`,
      title: `読書メモ${i + 1}`,
      topics: ["テスト"],
      createdAt: "2024-01-01",
      isPublic: true,
    }));

    render(<ReadingNoteListView notes={notes} />);

    for (const note of notes) {
      expect(screen.getByText(note.title)).toBeInTheDocument();
    }
  });
});

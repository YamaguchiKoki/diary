import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Block } from "@/modules/notion/types";
import { BlocksRenderer } from "../BlocksRenderer";
import { makeTextChild } from "./test-utils";

describe("BlocksRenderer", () => {
  describe("bulleted_list_item", () => {
    it("bulleted_list_item が ul > li 構造でレンダリングされる", () => {
      const blocks: Block[] = [
        {
          type: "bulleted_list_item",
          children: [makeTextChild("箇条書き1")],
          nestedBlocks: [],
        },
      ];

      const { container } = render(<BlocksRenderer blocks={blocks} />);

      expect(container.querySelector("ul")).toBeInTheDocument();
      expect(container.querySelector("ul > li")).toBeInTheDocument();
      expect(screen.getByText("箇条書き1")).toBeInTheDocument();
    });

    it("連続する bulleted_list_item が単一の ul にまとめられる", () => {
      const blocks: Block[] = [
        {
          type: "bulleted_list_item",
          children: [makeTextChild("箇条書き1")],
          nestedBlocks: [],
        },
        {
          type: "bulleted_list_item",
          children: [makeTextChild("箇条書き2")],
          nestedBlocks: [],
        },
        {
          type: "bulleted_list_item",
          children: [makeTextChild("箇条書き3")],
          nestedBlocks: [],
        },
      ];

      const { container } = render(<BlocksRenderer blocks={blocks} />);

      const lists = container.querySelectorAll("ul");
      expect(lists.length).toBe(1);
      const items = container.querySelectorAll("ul > li");
      expect(items.length).toBe(3);
    });

    it("ネストした bulleted_list_item が子 ul > li として再帰的にレンダリングされる", () => {
      const blocks: Block[] = [
        {
          type: "bulleted_list_item",
          children: [makeTextChild("親項目")],
          nestedBlocks: [
            {
              type: "bulleted_list_item",
              children: [makeTextChild("子項目")],
              nestedBlocks: [],
            },
          ],
        },
      ];

      const { container } = render(<BlocksRenderer blocks={blocks} />);

      const uls = container.querySelectorAll("ul");
      expect(uls.length).toBeGreaterThanOrEqual(2);

      expect(screen.getByText("子項目")).toBeInTheDocument();

      const parentLi = container.querySelector("ul > li");
      expect(parentLi?.querySelector("ul")).toBeInTheDocument();
    });
  });

  describe("numbered_list_item", () => {
    it("numbered_list_item が ol > li 構造でレンダリングされる", () => {
      const blocks: Block[] = [
        {
          type: "numbered_list_item",
          children: [makeTextChild("番号付き1")],
          nestedBlocks: [],
        },
      ];

      const { container } = render(<BlocksRenderer blocks={blocks} />);

      expect(container.querySelector("ol")).toBeInTheDocument();
      expect(container.querySelector("ol > li")).toBeInTheDocument();
      expect(screen.getByText("番号付き1")).toBeInTheDocument();
    });

    it("連続する numbered_list_item が単一の ol にまとめられる", () => {
      const blocks: Block[] = [
        {
          type: "numbered_list_item",
          children: [makeTextChild("番号付き1")],
          nestedBlocks: [],
        },
        {
          type: "numbered_list_item",
          children: [makeTextChild("番号付き2")],
          nestedBlocks: [],
        },
      ];

      const { container } = render(<BlocksRenderer blocks={blocks} />);

      const lists = container.querySelectorAll("ol");
      expect(lists.length).toBe(1);
      const items = container.querySelectorAll("ol > li");
      expect(items.length).toBe(2);
    });

    it("ネストした numbered_list_item が子 ol > li として再帰的にレンダリングされる", () => {
      const blocks: Block[] = [
        {
          type: "numbered_list_item",
          children: [makeTextChild("親番号項目")],
          nestedBlocks: [
            {
              type: "numbered_list_item",
              children: [makeTextChild("子番号項目")],
              nestedBlocks: [],
            },
          ],
        },
      ];

      const { container } = render(<BlocksRenderer blocks={blocks} />);

      expect(screen.getByText("子番号項目")).toBeInTheDocument();

      const parentLi = container.querySelector("ol > li");
      expect(parentLi?.querySelector("ol")).toBeInTheDocument();
    });
  });

  describe("リストとリスト以外のブロックの混在", () => {
    it("bulleted_list_item の間に別ブロックがある場合、別々の ul にグルーピングされる", () => {
      const blocks: Block[] = [
        {
          type: "bulleted_list_item",
          children: [makeTextChild("リスト1")],
          nestedBlocks: [],
        },
        {
          type: "paragraph",
          children: [makeTextChild("段落テキスト")],
        },
        {
          type: "bulleted_list_item",
          children: [makeTextChild("リスト2")],
          nestedBlocks: [],
        },
      ];

      const { container } = render(<BlocksRenderer blocks={blocks} />);

      const lists = container.querySelectorAll("ul");
      expect(lists.length).toBe(2);
      expect(screen.getByText("段落テキスト")).toBeInTheDocument();
    });

    it("非リストブロックが BlockRenderer によりレンダリングされる", () => {
      const blocks: Block[] = [
        {
          type: "paragraph",
          children: [makeTextChild("段落テキスト")],
        },
      ];

      render(<BlocksRenderer blocks={blocks} />);

      expect(screen.getByText("段落テキスト")).toBeInTheDocument();
    });
  });

  describe("空のブロック配列", () => {
    it("空配列の場合は何もレンダリングされない", () => {
      const { container } = render(<BlocksRenderer blocks={[]} />);

      expect(container.firstChild).toBeNull();
    });
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { NonListBlock } from "@/modules/notion/types";
import { BlockRenderer } from "../BlockRenderer";
import { makeTextChild } from "./test-utils";

describe("BlockRenderer", () => {
  describe("heading_1", () => {
    it("heading level 1 が h1 要素でレンダリングされる", () => {
      const block: NonListBlock = {
        type: "heading",
        level: 1,
        is_toggleable: false,
        children: [makeTextChild("見出し1")],
      };

      render(<BlockRenderer block={block} />);

      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "見出し1",
      );
    });
  });

  describe("heading_2", () => {
    it("heading level 2 が h2 要素でレンダリングされる", () => {
      const block: NonListBlock = {
        type: "heading",
        level: 2,
        is_toggleable: false,
        children: [makeTextChild("見出し2")],
      };

      render(<BlockRenderer block={block} />);

      expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    });
  });

  describe("heading_3", () => {
    it("heading level 3 が h3 要素でレンダリングされる", () => {
      const block: NonListBlock = {
        type: "heading",
        level: 3,
        is_toggleable: false,
        children: [makeTextChild("見出し3")],
      };

      render(<BlockRenderer block={block} />);

      expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
    });
  });

  describe("quote", () => {
    it("quote ブロックが blockquote 要素でレンダリングされる", () => {
      const block: NonListBlock = {
        type: "quote",
        children: [makeTextChild("引用テキスト")],
      };

      const { container } = render(<BlockRenderer block={block} />);

      const blockquote = container.querySelector("blockquote");
      expect(blockquote).toBeInTheDocument();
      expect(blockquote).toHaveTextContent("引用テキスト");
    });

    it("quote ブロックに左ボーダー相当のクラスが適用されている", () => {
      const block: NonListBlock = {
        type: "quote",
        children: [makeTextChild("引用テキスト")],
      };

      const { container } = render(<BlockRenderer block={block} />);

      const blockquote = container.querySelector("blockquote");
      expect(blockquote?.className).toMatch(/border-l/);
    });
  });

  describe("divider", () => {
    it("divider ブロックが hr 要素でレンダリングされる", () => {
      const block: NonListBlock = { type: "divider" };

      const { container } = render(<BlockRenderer block={block} />);

      expect(container.querySelector("hr")).toBeInTheDocument();
    });
  });

  describe("paragraph", () => {
    it("paragraph が p 要素でレンダリングされる", () => {
      const block: NonListBlock = {
        type: "paragraph",
        children: [makeTextChild("本文テキスト")],
      };

      render(<BlockRenderer block={block} />);

      expect(screen.getByText("本文テキスト")).toBeInTheDocument();
    });
  });

  describe("code", () => {
    it("code ブロックが pre/code 要素でレンダリングされる", () => {
      const block: NonListBlock = {
        type: "code",
        language: "typescript",
        content: "const x = 1;",
      };

      const { container } = render(<BlockRenderer block={block} />);

      expect(container.querySelector("pre")).toBeInTheDocument();
      expect(container.querySelector("code")).toBeInTheDocument();
    });
  });
});

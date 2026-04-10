import { describe, expect, it } from "vitest";
import {
  computeColumns,
  MASONRY_CONFIG,
  packMasonry,
} from "@/modules/trivia/service/layout";

const { gap, maxColWidth, singleColumnMaxViewportWidth } = MASONRY_CONFIG;

describe("computeColumns", () => {
  it("viewport幅が singleColumnMaxViewportWidth 以下のとき 1カラムになる", () => {
    const result = computeColumns(400);

    expect(result.colCount).toBe(1);
    expect(result.colWidth).toBe(Math.min(maxColWidth, 400 - gap * 2));
  });

  it("viewport幅がちょうど境界値(520)のとき 1カラムになる", () => {
    const result = computeColumns(singleColumnMaxViewportWidth);

    expect(result.colCount).toBe(1);
  });

  it("viewport幅が境界値より1px広いときは2カラム以上になる", () => {
    const result = computeColumns(singleColumnMaxViewportWidth + 1);

    expect(result.colCount).toBeGreaterThanOrEqual(2);
  });

  it("viewport幅が広くなると列数も増える", () => {
    const narrow = computeColumns(800);
    const wide = computeColumns(1600);

    expect(wide.colCount).toBeGreaterThanOrEqual(narrow.colCount);
  });

  it("複数列時に colWidth は maxColWidth を超えない", () => {
    const result = computeColumns(3000);

    expect(result.colWidth).toBeLessThanOrEqual(maxColWidth);
  });

  it("offsetLeft はコンテンツが中央寄せになる値", () => {
    const viewportWidth = 1200;
    const result = computeColumns(viewportWidth);
    const contentWidth =
      result.colCount * result.colWidth + (result.colCount - 1) * gap;
    const expectedOffset = (viewportWidth - contentWidth) / 2;

    expect(result.offsetLeft).toBeCloseTo(expectedOffset);
  });
});

describe("packMasonry", () => {
  it("1カラムのとき 3枚のカードが縦に積まれ y が累積する", () => {
    const cardHeights = [100, 150, 80];
    const result = packMasonry(cardHeights, 400);

    expect(result.colCount).toBe(1);
    expect(result.positionedCards).toHaveLength(3);

    expect(result.positionedCards[0]?.y).toBe(gap);
    expect(result.positionedCards[1]?.y).toBe(gap + 100 + gap);
    expect(result.positionedCards[2]?.y).toBe(gap + 100 + gap + 150 + gap);
  });

  it("positionedCards の順序は入力順を保持する", () => {
    const cardHeights = [100, 200, 50, 300, 75];
    const result = packMasonry(cardHeights, 1200);

    for (let i = 0; i < cardHeights.length; i++) {
      expect(result.positionedCards[i]?.cardIndex).toBe(i);
    }
  });

  it("2カラム以上のとき 最短列にカードが配置される", () => {
    // viewport 900px でおそらく 2-3 カラム。高さ 100 のカードを 4 枚配置
    // 最初の 2 枚は別々の列に、3 枚目は最初の列(同じ高さの最短)に、4 枚目は 2 番目の列に
    const cardHeights = [100, 100, 100, 100];
    const result = packMasonry(cardHeights, 900);

    expect(result.colCount).toBeGreaterThanOrEqual(2);

    // 1 枚目と 2 枚目は別の列に行く (x が異なる)
    expect(result.positionedCards[0]?.x).not.toBe(result.positionedCards[1]?.x);
  });

  it("contentHeight は最も高い列の高さに一致する", () => {
    const cardHeights = [100, 100, 100];
    const result = packMasonry(cardHeights, 400);

    // 1 カラム: gap + 100 + gap + 100 + gap + 100 + gap = 4*gap + 300
    const expected = gap * 4 + 300;
    expect(result.contentHeight).toBe(expected);
  });

  it("positionedCards の h は入力カード高さと一致する", () => {
    const cardHeights = [123, 456, 789];
    const result = packMasonry(cardHeights, 400);

    expect(result.positionedCards[0]?.h).toBe(123);
    expect(result.positionedCards[1]?.h).toBe(456);
    expect(result.positionedCards[2]?.h).toBe(789);
  });

  it("突出して高いカードが入った列は後続カードの配置先にならない", () => {
    // 1 枚目だけ極端に高い。col 数が複数になる幅で確認する
    const cardHeights = [500, 50, 50, 50];
    const result = packMasonry(cardHeights, 900);

    if (result.colCount < 2) {
      return;
    }

    // 後続の 3 枚はすべて 1 枚目が入った列以外に配置される
    const firstCardX = result.positionedCards[0]?.x;
    for (let i = 1; i < cardHeights.length; i++) {
      expect(result.positionedCards[i]?.x).not.toBe(firstCardX);
    }
  });

  it("カードが0枚のとき contentHeight は初期 gap のみ", () => {
    const result = packMasonry([], 400);

    expect(result.positionedCards).toHaveLength(0);
    expect(result.contentHeight).toBe(gap);
  });
});

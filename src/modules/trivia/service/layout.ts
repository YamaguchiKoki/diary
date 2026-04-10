/**
 * pretext の masonry デモ(https://chenglou.me/pretext/masonry/)のレイアウト計算を
 * pure function として切り出したもの。
 *
 * 高さ計算自体(pretext の prepare/layout)は Client Component 側で行い、
 * 計算済みの高さ配列だけをこのモジュールに渡すことで、jsdom で動かない
 * Canvas API への依存をテストから分離している。
 */

export const MASONRY_CONFIG = {
  font: '15px "Sawarabi Mincho", "Helvetica Neue", Helvetica, Arial, sans-serif',
  lineHeight: 22,
  cardPadding: 16,
  gap: 12,
  maxColWidth: 400,
  singleColumnMaxViewportWidth: 520,
} as const;

export type PositionedCard = {
  cardIndex: number;
  x: number;
  y: number;
  h: number;
};

export type MasonryLayout = {
  colCount: number;
  colWidth: number;
  offsetLeft: number;
  contentHeight: number;
  positionedCards: PositionedCard[];
};

type ColumnsInfo = {
  colCount: number;
  colWidth: number;
  offsetLeft: number;
};

/**
 * viewport 幅から列数・列幅・中央寄せオフセットを計算します。
 */
export function computeColumns(viewportWidth: number): ColumnsInfo {
  const { gap, maxColWidth, singleColumnMaxViewportWidth } = MASONRY_CONFIG;

  let colCount: number;
  let colWidth: number;

  if (viewportWidth <= singleColumnMaxViewportWidth) {
    colCount = 1;
    colWidth = Math.min(maxColWidth, viewportWidth - gap * 2);
  } else {
    const minColWidth = 100 + viewportWidth * 0.1;
    colCount = Math.max(
      2,
      Math.floor((viewportWidth + gap) / (minColWidth + gap)),
    );
    colWidth = Math.min(
      maxColWidth,
      (viewportWidth - (colCount + 1) * gap) / colCount,
    );
  }

  const contentWidth = colCount * colWidth + (colCount - 1) * gap;
  const offsetLeft = (viewportWidth - contentWidth) / 2;

  return { colCount, colWidth, offsetLeft };
}

/**
 * 各カードの高さ配列から masonry 配置を決定します。
 * 最短列を探して次のカードを積む、デモと同じアルゴリズム。
 */
export function packMasonry(
  cardHeights: number[],
  viewportWidth: number,
): MasonryLayout {
  const { gap } = MASONRY_CONFIG;
  const { colCount, colWidth, offsetLeft } = computeColumns(viewportWidth);

  const colHeights = new Array<number>(colCount).fill(gap);
  const positionedCards: PositionedCard[] = [];

  for (let i = 0; i < cardHeights.length; i++) {
    let shortest = 0;
    for (let c = 1; c < colCount; c++) {
      if ((colHeights[c] ?? 0) < (colHeights[shortest] ?? 0)) {
        shortest = c;
      }
    }

    const h = cardHeights[i] ?? 0;
    positionedCards.push({
      cardIndex: i,
      x: offsetLeft + shortest * (colWidth + gap),
      y: colHeights[shortest] ?? 0,
      h,
    });

    colHeights[shortest] = (colHeights[shortest] ?? 0) + h + gap;
  }

  let contentHeight: number = gap;
  for (const colHeight of colHeights) {
    if (colHeight > contentHeight) {
      contentHeight = colHeight;
    }
  }

  return {
    colCount,
    colWidth,
    offsetLeft,
    contentHeight,
    positionedCards,
  };
}

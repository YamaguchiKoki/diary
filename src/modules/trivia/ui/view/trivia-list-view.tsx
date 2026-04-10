"use client";

import { layout, prepare } from "@chenglou/pretext";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  computeColumns,
  MASONRY_CONFIG,
  packMasonry,
} from "@/modules/trivia/service/layout";
import type { TriviaForListView } from "@/modules/trivia/types";

type TriviaListViewProps = {
  triviaList: TriviaForListView[];
};

export function TriviaListView({ triviaList }: TriviaListViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const preparedCards = useMemo(
    () =>
      triviaList.map((t) => ({
        id: t.id,
        title: t.title,
        prepared: prepare(t.title, MASONRY_CONFIG.font),
      })),
    [triviaList],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const masonry = useMemo(() => {
    if (containerWidth === 0) return null;
    const { colWidth } = computeColumns(containerWidth);
    const textWidth = colWidth - MASONRY_CONFIG.cardPadding * 2;
    const cardHeights = preparedCards.map((c) => {
      const { height } = layout(
        c.prepared,
        textWidth,
        MASONRY_CONFIG.lineHeight,
      );
      return height + MASONRY_CONFIG.cardPadding * 2;
    });
    return packMasonry(cardHeights, containerWidth);
  }, [preparedCards, containerWidth]);

  return (
    <div ref={containerRef} className="relative w-full">
      {masonry && (
        <div
          className="relative"
          style={{ height: `${masonry.contentHeight}px` }}
        >
          {masonry.positionedCards.map((p) => {
            const card = preparedCards[p.cardIndex];
            if (!card) return null;
            return (
              <div
                key={card.id}
                className="absolute overflow-hidden rounded-lg bg-white text-[15px] leading-[22px] text-gray-800 shadow-sm"
                style={{
                  left: `${p.x}px`,
                  top: `${p.y}px`,
                  width: `${masonry.colWidth}px`,
                  height: `${p.h}px`,
                  padding: `${MASONRY_CONFIG.cardPadding}px`,
                }}
              >
                {card.title}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

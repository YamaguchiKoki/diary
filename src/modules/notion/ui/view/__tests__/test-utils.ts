import type { RichText } from "@/modules/notion/types";

export const makeTextChild = (text: string): RichText => ({
  text,
  annotations: {
    bold: false,
    italic: false,
    code: false,
    strikethrough: false,
    underline: false,
  },
});

type CSSProperties = {
  [key: string]: string | number | CSSProperties;
};

export function css(
  strings: TemplateStringsArray,
  ...exprs: Array<string | number | CSSProperties>
): string;

export function styles(...classNames: Array<string | false | undefined | null | 0>): string;

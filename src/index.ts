export function css(
  strings: TemplateStringsArray,
  ...exprs: Array<string | number | CSSProperties>
): string {
  throw new Error(
    'Using the "css" tag in runtime is not supported. Make sure you have set up the Babel plugin correctly.'
  );
  console.log(strings, exprs);
}

export function styles(...classes: ClassValue[]): string {
  throw new Error(
    'Using the "styles" tag in runtime is not supported. Make sure you have set up the Babel plugin correctly.'
  );

  console.log(classes);
}

type CSSProperties = {
  [key: string]: string | number | CSSProperties;
};

interface ClassArray extends Array<ClassValue> {}

interface ClassDictionary {
  [id: string]: any;
}

type ClassValue =
  | string
  | number
  | ClassDictionary
  | ClassArray
  | undefined
  | null
  | boolean;

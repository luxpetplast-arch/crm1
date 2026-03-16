declare module 'uzbek-transliterator' {
  export function latinToCyrillic(text: string): string;
  export function cyrillicToLatin(text: string): string;
  export function transliterate(text: string, from: 'latin' | 'cyrillic', to: 'latin' | 'cyrillic'): string;
}

// O'zbek tilini lotin yozuvidan kirill yozuviga transliteratsiya qilish
// uzbek-transliterator kutubxonasidan foydalanish
import { latinToCyrillic as libLatinToCyrillic, cyrillicToLatin as libCyrillicToLatin } from 'uzbek-transliterator';

// Re-export kutubxona funksiyalarini
export const latinToCyrillic = libLatinToCyrillic;
export const cyrillicToLatin = libCyrillicToLatin;

// Qisqa nom bilan export (t - translate)
export const t = libLatinToCyrillic;

// Default export
export default {
  latinToCyrillic: libLatinToCyrillic,
  cyrillicToLatin: libCyrillicToLatin,
  t: libLatinToCyrillic
};

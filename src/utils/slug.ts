/**
 * Convertit une chaîne de caractères en slug URL-friendly
 * - Convertit les caractères accentués
 * - Remplace les espaces par des tirets
 * - Met en minuscules
 * - Ne garde que les caractères alphanumériques et les tirets
 */
export function slug(str: string): string {
  return str
    .normalize('NFD') // Décompose les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprime les diacritiques
    .toLowerCase() // Met en minuscules
    .trim() // Supprime les espaces au début et à la fin
    .replace(/[^a-z0-9\s-]/g, '') // Garde uniquement les lettres, chiffres, espaces et tirets
    .replace(/[\s]+/g, '-') // Remplace les espaces par des tirets
    .replace(/-+/g, '-'); // Évite les tirets multiples consécutifs
}

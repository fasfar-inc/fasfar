/**
 * Formate une adresse longue en une version plus courte et lisible
 *
 * @param address L'adresse complète à formater
 * @param options Options de formatage
 * @returns L'adresse formatée
 */
export function formatAddress(
  address: string,
  options: {
    includeNumber?: boolean
    includeStreet?: boolean
    includeCity?: boolean
    includePostalCode?: boolean
    maxLength?: number
  } = {},
) {
  const {
    includeNumber = true,
    includeStreet = true,
    includeCity = true,
    includePostalCode = true,
    maxLength = 60,
  } = options

  if (!address) return ""

  // Diviser l'adresse en parties
  const parts = address.split(",").map((part) => part.trim())

  // Extraire les composants de l'adresse
  const streetPart = parts[0] || "" // Numéro et rue
  const cityPart = extractCity(address)
  const postalCode = extractPostalCode(address)

  // Construire l'adresse formatée
  const formattedParts = []

  if (includeNumber && includeStreet && streetPart) {
    formattedParts.push(streetPart)
  } else if (!includeNumber && includeStreet) {
    // Extraire juste la rue sans le numéro
    const streetWithoutNumber = streetPart.replace(/^\d+[,\s]*/, "")
    if (streetWithoutNumber) formattedParts.push(streetWithoutNumber)
  }

  if (includeCity && cityPart) {
    formattedParts.push(cityPart)
  }

  if (includePostalCode && postalCode) {
    formattedParts.push(postalCode)
  }

  // Joindre les parties avec des virgules
  let result = formattedParts.join(", ")

  // Tronquer si nécessaire
  if (result.length > maxLength) {
    result = result.substring(0, maxLength - 3) + "..."
  }

  return result
}

/**
 * Extrait le nom de la ville d'une adresse
 *
 * @param address L'adresse complète
 * @returns Le nom de la ville
 */
export function extractCity(address: string): string {
  if (!address) return ""

  const parts = address.split(",").map((part) => part.trim())

  // La ville est généralement la 3ème ou 4ème partie de l'adresse
  // On cherche une partie qui n'est pas un code postal (pas uniquement des chiffres)
  // et qui n'est pas trop longue (pour éviter de prendre des descriptions de quartier)
  for (let i = 2; i < Math.min(parts.length, 5); i++) {
    const part = parts[i]
    if (
      part &&
      !/^\d+$/.test(part) && // Pas uniquement des chiffres
      part.length < 20 && // Pas trop long
      !/france/i.test(part)
    ) {
      // Pas le pays
      return part
    }
  }

  return ""
}

/**
 * Extrait le code postal d'une adresse
 *
 * @param address L'adresse complète
 * @returns Le code postal
 */
export function extractPostalCode(address: string): string {
  if (!address) return ""

  // Recherche d'un code postal français (5 chiffres)
  const postalCodeMatch = address.match(/\b\d{5}\b/)
  return postalCodeMatch ? postalCodeMatch[0] : ""
}

/**
 * Service pour gérer le téléchargement des images
 *
 * Note: Dans une application de production, vous devriez utiliser un service
 * de stockage comme Cloudinary, AWS S3 ou Firebase Storage au lieu de
 * cette implémentation qui convertit simplement les images en base64.
 */

/**
 * Télécharge une image et retourne son URL
 * @param file Le fichier image à télécharger
 * @returns Une promesse qui résout avec l'URL de l'image téléchargée
 */
export async function uploadImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // Vérifier que le fichier est une image
        if (!file.type.startsWith("image/")) {
          reject(new Error("Le fichier doit être une image"))
          return
        }
  
        // Limiter la taille du fichier (5MB)
        if (file.size > 5 * 1024 * 1024) {
          reject(new Error("L'image ne doit pas dépasser 5MB"))
          return
        }
  
        const reader = new FileReader()
  
        reader.onload = () => {
          // Le résultat est une URL data (base64)
          const base64String = reader.result as string
  
          // Dans une application réelle, vous enverriez le fichier à un service
          // de stockage cloud et recevriez une URL permanente en retour
  
          // Simuler un délai réseau
          setTimeout(() => {
            resolve(base64String)
          }, 500)
        }
  
        reader.onerror = () => {
          reject(new Error("Erreur lors de la lecture du fichier"))
        }
  
        // Lire le fichier comme une URL data
        reader.readAsDataURL(file)
      } catch (error) {
        reject(error)
      }
    })
  }
  
  /**
   * Télécharge plusieurs images et retourne leurs URLs
   * @param files Les fichiers images à télécharger
   * @returns Une promesse qui résout avec un tableau d'URLs des images téléchargées
   */
  export async function uploadMultipleImages(files: File[]): Promise<string[]> {
    try {
      const uploadPromises = files.map((file) => uploadImage(file))
      return await Promise.all(uploadPromises)
    } catch (error) {
      console.error("Erreur lors du téléchargement multiple:", error)
      throw new Error("Erreur lors du téléchargement des images")
    }
  }
  
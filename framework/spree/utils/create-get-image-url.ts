import { SpreeProductImage } from '../types'
import getImageUrl from './get-image-url'

const createGetImageUrl =
  (useOriginalImageSize: boolean = true) =>
  (
    image: SpreeProductImage,
    minWidth: number,
    minHeight: number
  ): string | null => {
    if (useOriginalImageSize) {
      return image.attributes.transformed_url || null
    }

    return getImageUrl(image, minWidth, minHeight)
  }

export default createGetImageUrl

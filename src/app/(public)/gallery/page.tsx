import { getGalleryItems } from '@/app/actions/gallery'
import GalleryPageContent from './GalleryPageContent'

export default async function GalleryPage() {
  const items = await getGalleryItems().catch(() => [])
  return <GalleryPageContent items={items} />
}

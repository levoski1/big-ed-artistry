import { getGalleryItems } from '@/app/actions/gallery'
import AdminGalleryContent from './AdminGalleryContent'

export default async function AdminGalleryPage() {
  const items = await getGalleryItems().catch(() => [])
  return <AdminGalleryContent items={items} />
}

import { Routes, Route } from 'react-router-dom'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { LibraryPage } from '../features/library/LibraryPage'
import { AddManhwaPage } from '../features/add-manhwa/AddManhwaPage'
import { SettingsPage } from '../features/settings/SettingsPage'
import { ManhwaDetailsPage } from '../features/details/ManhwaDetailsPage'
import { EditManhwaPage } from '../features/edit/EditManhwaPage'
import { AddChapterPage } from '../features/chapters/AddChapterPage'
import { BackupPage } from '../features/backup/BackupPage'
import { CategoriesPage } from '../features/categories/CategoriesPage'
import { CategoryViewPage } from '../features/categories/CategoryViewPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/add" element={<AddManhwaPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/category/:id" element={<CategoryViewPage />} />
      <Route path="/backup" element={<BackupPage />} />
      <Route path="/details/:id" element={<ManhwaDetailsPage />} />
      <Route path="/edit/:id" element={<EditManhwaPage />} />
      <Route path="/chapters/:id/add" element={<AddChapterPage />} />
    </Routes>
  )
}

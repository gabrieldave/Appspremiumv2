import { useState } from 'react';
import { AdminLayout } from '../components/admin/AdminLayout';
import { DownloadsManager } from '../components/admin/DownloadsManager';
import { AppsManager } from '../components/admin/AppsManager';
import { SupportManager } from '../components/admin/SupportManager';
import { UsersManager } from '../components/admin/UsersManager';
import MT4ProductsManager from '../components/admin/MT4ProductsManager';

type SectionType = 'downloads' | 'apps' | 'support' | 'mt4' | 'users';

export function AdminPage() {
  const [currentSection, setCurrentSection] = useState<SectionType>('users');

  const renderSection = () => {
    switch (currentSection) {
      case 'users':
        return <UsersManager />;
      case 'mt4':
        return <MT4ProductsManager />;
      case 'downloads':
        return <DownloadsManager />;
      case 'apps':
        return <AppsManager />;
      case 'support':
        return <SupportManager />;
      default:
        return <UsersManager />;
    }
  };

  return (
    <AdminLayout currentSection={currentSection} onNavigate={setCurrentSection}>
      {renderSection()}
    </AdminLayout>
  );
}

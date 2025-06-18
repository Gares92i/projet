import React, { ReactNode, useState } from "react";
import Navbar from "@components/Navbar";
import Sidebar from "@components/Sidebar";
import { useAuth } from "@features/auth/services/authService";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!isAuthenticated) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar open={sidebarOpen} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar onMenuClick={toggleSidebar} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
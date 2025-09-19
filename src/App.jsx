import React, { useState, useEffect } from 'react';
    import { Routes, Route, Navigate } from 'react-router-dom';
    import { useAppContext } from '@/contexts/AppContext';
    import CashFundModal from '@/components/modals/CashFundModal';
    import Sidebar from '@/components/pos/Sidebar';
    import POSPage from '@/pages/POSPage';
    import InventoryPage from '@/pages/InventoryPage';
    import TicketsPage from '@/pages/TicketsPage';
    import SettingsPage from '@/pages/SettingsPage';
    import DashboardPage from '@/pages/DashboardPage'; 
    import { cn } from '@/lib/utils';
    import AddIngredientModal from '@/components/modals/AddIngredientModal';
    import AddFundModal from '@/components/modals/AddFundModal';
    import CashCutModal from '@/components/modals/CashCutModal';
    import RegisterExpenseModal from '@/components/modals/RegisterExpenseModal';

    function App() {
      const { cashFund } = useAppContext();
      const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
      const [isAddIngredientModalOpen, setIsAddIngredientModalOpen] = useState(false);
      const [isAddFundModalOpen, setIsAddFundModalOpen] = useState(false);
      const [isCashCutModalOpen, setIsCashCutModalOpen] = useState(false);
      const [isRegisterExpenseModalOpen, setIsRegisterExpenseModalOpen] = useState(false);


      useEffect(() => {
        const collapsedPreference = localStorage.getItem('sidebarCollapsed');
        setIsSidebarCollapsed(collapsedPreference !== null ? collapsedPreference === 'true' : true);
      }, []);

      const toggleSidebar = () => {
        const newCollapsedState = !isSidebarCollapsed;
        setIsSidebarCollapsed(newCollapsedState);
        localStorage.setItem('sidebarCollapsed', newCollapsedState.toString());
      };
      
      const sidebarWidth = isSidebarCollapsed ? "md:w-20" : "md:w-64";
      const mainContentMargin = isSidebarCollapsed ? "md:ml-20" : "md:ml-64";

      return (
        <>
          {!cashFund.isSet && <CashFundModal />}
          {cashFund.isSet && (
            <div className="flex h-screen bg-brand-white-modern overflow-hidden">
              <Sidebar 
                isCollapsed={isSidebarCollapsed} 
                toggleSidebar={toggleSidebar} 
                sidebarWidthClass={sidebarWidth}
                openAddIngredientModal={() => setIsAddIngredientModalOpen(true)}
                openAddFundModal={() => setIsAddFundModalOpen(true)}
                openCashCutModal={() => setIsCashCutModalOpen(true)}
                openRegisterExpenseModal={() => setIsRegisterExpenseModalOpen(true)}
              />
              <main className={cn(
                "flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out",
                mainContentMargin, 
                "pt-16 md:pt-0" 
              )}>
                <Routes>
                  <Route path="/" element={<Navigate to="/pos" replace />} />
                  <Route path="/pos" element={<POSPage isSidebarCollapsed={isSidebarCollapsed} />} />
                  <Route path="/dashboard" element={<DashboardPage openAddFundModal={() => setIsAddFundModalOpen(true)} openCashCutModal={() => setIsCashCutModalOpen(true)} />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/tickets" element={<TicketsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </main>
            </div>
          )}
          <AddIngredientModal 
            isOpen={isAddIngredientModalOpen} 
            onClose={() => setIsAddIngredientModalOpen(false)} 
          />
          <AddFundModal
            isOpen={isAddFundModalOpen}
            onClose={() => setIsAddFundModalOpen(false)}
          />
          <CashCutModal
            isOpen={isCashCutModalOpen}
            onClose={() => setIsCashCutModalOpen(false)}
          />
          <RegisterExpenseModal
            isOpen={isRegisterExpenseModalOpen}
            onClose={() => setIsRegisterExpenseModalOpen(false)}
          />
        </>
      );
    }

    export default App;
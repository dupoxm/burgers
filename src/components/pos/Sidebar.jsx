import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Package, History, Settings, BarChart3, ChevronLeft, ChevronRight, PlusSquare, DollarSign, Scissors, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { to: "/pos", icon: Home, label: "Punto de Venta" },
  { to: "/dashboard", icon: BarChart3, label: "Dashboard" },
  { to: "/inventory", icon: Package, label: "Inventario" },
  { to: "/tickets", icon: History, label: "Tickets" },
  { to: "/settings", icon: Settings, label: "Configuración" },
];

const Sidebar = ({ isCollapsed, toggleSidebar, sidebarWidthClass, openAddIngredientModal, openAddFundModal, openCashCutModal, openRegisterExpenseModal }) => {
  const location = useLocation();

  const handleActionClick = (action) => {
    action();
    if (!isCollapsed && window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  return (
    <aside className={cn("fixed inset-y-0 left-0 z-50 flex flex-col bg-gradient-to-b from-[#1f2937] to-[#141b25] text-white shadow-2xl transition-all duration-300 ease-in-out", sidebarWidthClass, "md:translate-x-0", isCollapsed ? "max-md:translate-x-[-100%]" : "max-md:translate-x-0 max-md:w-64")}>
      {!isCollapsed && (
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-white hover:bg-white/20 md:hidden" onClick={toggleSidebar}>
          <ChevronLeft size={24} />
        </Button>
      )}
      
      <div className="flex items-center justify-center p-4 border-b border-white/10 min-h-[4rem] md:min-h-[4.5rem]">
        {isCollapsed ? (
          <ShoppingCart size={28} className="text-brand-yellow" />
        ) : (
          <div className="flex items-center space-x-2">
            <ShoppingCart size={28} className="text-brand-yellow" />
            <span className="text-xl font-bold whitespace-nowrap">Bugers&Dogs</span>
          </div>
        )}
      </div>

      <nav className="flex-grow p-3 space-y-2 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2.5 rounded-lg transition-colors duration-150 ease-in-out",
              "hover:bg-white/20",
              isActive ? "bg-brand-yellow text-[#141b25] font-semibold shadow-inner" : "text-gray-200 hover:text-white",
              isCollapsed && "justify-center"
            )}
            onClick={() => handleActionClick(() => {})}
            title={isCollapsed ? item.label : ""}
          >
            <item.icon size={20} className={cn(!isCollapsed && "mr-3")} />
            {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
          </NavLink>
        ))}
        
        <hr className="border-white/10 my-3" />
        
        <Button variant="ghost" className="w-full flex items-center justify-start px-3 py-2.5 text-gray-200 hover:bg-white/20 hover:text-white" onClick={() => handleActionClick(openAddFundModal)} title={isCollapsed ? "Agregar Fondo" : ""}>
          <DollarSign size={20} className={cn(!isCollapsed && "mr-3", "text-green-400")} />
          {!isCollapsed && <span className="whitespace-nowrap">Agregar Fondo</span>}
        </Button>
        <Button variant="ghost" className="w-full flex items-center justify-start px-3 py-2.5 text-gray-200 hover:bg-white/20 hover:text-white" onClick={() => handleActionClick(openCashCutModal)} title={isCollapsed ? "Corte de Caja" : ""}>
          <Scissors size={20} className={cn(!isCollapsed && "mr-3", "text-red-400")} />
          {!isCollapsed && <span className="whitespace-nowrap">Corte de Caja</span>}
        </Button>
        <Button variant="ghost" className="w-full flex items-center justify-start px-3 py-2.5 text-gray-200 hover:bg-white/20 hover:text-white" onClick={() => handleActionClick(openRegisterExpenseModal)} title={isCollapsed ? "Registrar Gasto" : ""}>
          <TrendingDown size={20} className={cn(!isCollapsed && "mr-3", "text-orange-400")} />
          {!isCollapsed && <span className="whitespace-nowrap">Registrar Gasto</span>}
        </Button>

        <hr className="border-white/10 my-3" />

        {!isCollapsed && (
          <Button variant="ghost" className="w-full flex items-center justify-start px-3 py-2.5 text-gray-200 hover:bg-white/20 hover:text-white" onClick={() => handleActionClick(openAddIngredientModal)}>
            <PlusSquare size={20} className="mr-3" />
            <span className="whitespace-nowrap">Agregar Insumo</span>
          </Button>
        )}
        {isCollapsed && (
          <Button variant="ghost" size="icon" className="w-full flex items-center justify-center px-3 py-2.5 text-gray-200 hover:bg-white/20 hover:text-white" onClick={() => handleActionClick(openAddIngredientModal)} title="Agregar Insumo">
            <PlusSquare size={20} />
          </Button>
        )}
      </nav>

      <div className="p-3 border-t border-white/10">
        <Button variant="ghost" className="w-full flex items-center text-gray-300 hover:bg-white/20 hover:text-white" onClick={toggleSidebar}>
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} className="mr-3" />}
          {!isCollapsed && <span className="whitespace-nowrap">Colapsar</span>}
        </Button>
      </div>
    </aside>
  );
};
export default Sidebar;
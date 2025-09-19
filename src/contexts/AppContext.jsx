import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/supabaseClient';
    import { 
      fetchProductsFromSupabase, 
      fetchIngredientsFromSupabase, 
      fetchCompletedTicketsFromSupabase,
      addProductToSupabase,
      updateProductInSupabase,
      addProductPurchaseInSupabase,
      addIngredientToSupabase,
      updateIngredientStockInSupabase,
      confirmOrderInSupabase,
      deleteTicketFromSupabase,
      deleteAllTicketsFromSupabase,
      addCashTransactionToSupabase
    } from './appContextActions';
    
    import { useOrderManagement } from './hooks/useOrderManagement';
    import { useProductManagement } from './hooks/useProductManagement';
    import { useIngredientManagement } from './hooks/useIngredientManagement';
    import { useCashFundManagement } from './hooks/useCashFundManagement';
    import { useTicketManagement } from './hooks/useTicketManagement';

    import { INITIAL_PRODUCTS_FRONTEND, INITIAL_INGREDIENTS_FRONTEND } from '@/data';


    const AppContext = createContext();

    export const AppProvider = ({ children }) => {
      const { toast } = useToast();
      const [isLoading, setIsLoading] = useState(true);

      const cashFundActions = useCashFundManagement(toast, supabase);
      const { products, setProducts, fetchProductsState, addProductState, updateProductState, addProductPurchaseState } = useProductManagement(toast, supabase, INITIAL_PRODUCTS_FRONTEND);
      const { ingredients, setIngredients, fetchIngredientsState, addNewIngredientState, updateIngredientStockState } = useIngredientManagement(toast, supabase, INITIAL_INGREDIENTS_FRONTEND);
      const { completedTickets, setCompletedTickets, fetchCompletedTicketsState, activeTicketId, setActiveTicketId, deleteTicketState, deleteAllTicketsState } = useTicketManagement(toast, supabase);
      
      const { 
        currentOrder, 
        setCurrentOrder, 
        addToOrder, 
        updateOrderItemQuantity, 
        addExtraToItem, 
        updateExtraQuantity, 
        removeFromOrder, 
        clearOrder, 
        confirmOrder: confirmOrderFromHook, 
        loadOrder 
      } = useOrderManagement(toast, supabase, products);

      const fetchInitialData = useCallback(async () => {
        setIsLoading(true);
        try {
          await Promise.all([
            fetchProductsState(),
            fetchIngredientsState(),
            fetchCompletedTicketsState(),
          ]);
        } catch (error) {
          console.error("Error fetching initial data:", error);
          toast({ title: "Error", description: "No se pudo cargar toda la información inicial.", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      }, [fetchProductsState, fetchIngredientsState, fetchCompletedTicketsState, toast]);

      useEffect(() => {
        cashFundActions.loadCashFund();
        loadOrder();
        fetchInitialData();
      }, [cashFundActions.loadCashFund, loadOrder, fetchInitialData]);
      
      const confirmOrderAndUpdateContext = async (paymentDetails) => {
        const orderData = await confirmOrderFromHook(currentOrder, paymentDetails);
        if (orderData) {
          setCompletedTickets(prev => [{ ...orderData, totalAmount: orderData.total_amount, id: orderData.id.toString() }, ...prev]);
          setCurrentOrder([]); 
          await fetchProductsState();
          await fetchIngredientsState();
          toast({ title: "Venta Exitosa", description: "El inventario ha sido actualizado.", variant: "success" });
        }
        return orderData;
      };

      const value = {
        isLoading,
        ...cashFundActions,
        
        currentOrder,
        addToOrder,
        updateOrderItemQuantity,
        addExtraToItem,
        updateExtraQuantity,
        removeFromOrder,
        clearOrder,
        confirmOrder: confirmOrderAndUpdateContext, 
        
        products,
        fetchProducts: fetchProductsState,
        addProduct: addProductState,
        updateProduct: updateProductState,
        addProductPurchase: addProductPurchaseState,
        
        ingredients,
        fetchIngredients: fetchIngredientsState,
        addNewIngredient: addNewIngredientState,
        updateIngredientStock: updateIngredientStockState,
        
        completedTickets,
        fetchCompletedTickets: fetchCompletedTicketsState,
        deleteTicket: deleteTicketState,
        deleteAllTickets: deleteAllTicketsState,
        activeTicketId,
        setActiveTicketId,
        
        supabase 
      };

      return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
    };

    export const useAppContext = () => {
      const context = useContext(AppContext);
      if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
      }
      return context;
    };

import { useState, useCallback, useEffect } from 'react';
import { confirmOrderInSupabase } from '../appContextActions';

export const useOrderManagement = (toast, supabase, products) => {
  const [currentOrder, setCurrentOrder] = useState([]);

  const loadOrder = useCallback(() => {
    const savedOrder = localStorage.getItem('currentOrder');
    if (savedOrder) {
      setCurrentOrder(JSON.parse(savedOrder));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('currentOrder', JSON.stringify(currentOrder));
  }, [currentOrder]);

  const addToOrderState = useCallback((product, options = {}) => {
    const { isCombo = false, complements = [] } = options;
    
    setCurrentOrder(prevOrder => {
      const uniqueComboId = isCombo ? `${product.id}-${complements.map(c => c.id).join('-')}` : product.id;
      const itemIdentifier = isCombo ? 'comboId' : 'id';

      const existingItem = prevOrder.find(item => item[itemIdentifier] === uniqueComboId && item.isCombo === isCombo);

      if (existingItem) {
        return prevOrder.map(item =>
          item[itemIdentifier] === uniqueComboId && item.isCombo === isCombo
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        let price, name;
        if (isCombo) {
          price = (product.price || 0) + (product.combo_price || 0);
          name = `${product.name} (Combo)`;
        } else {
          price = product.price;
          name = product.name;
        }
        
        const newItem = { 
          ...product, 
          id: product.id,
          comboId: isCombo ? uniqueComboId : null,
          name, 
          price, 
          quantity: 1, 
          originalPrice: product.price, 
          isCombo: isCombo, 
          extras: [],
          complements: complements.map(c => ({...c, price: 0}))
        };
        return [...prevOrder, newItem];
      }
    });
  }, []);

  const updateOrderItemQuantityState = useCallback((itemId, isCombo, newQuantity) => {
    const itemIdentifier = isCombo ? 'comboId' : 'id';
    setCurrentOrder(prevOrder =>
      prevOrder.map(item =>
        item[itemIdentifier] === itemId && item.isCombo === isCombo
          ? { ...item, quantity: Math.max(1, newQuantity) }
          : item
      )
    );
  }, []);

  const addExtraToItemState = useCallback((itemId, isCombo, extra) => {
    const itemIdentifier = isCombo ? 'comboId' : 'id';
    setCurrentOrder(prevOrder =>
      prevOrder.map(item => {
        if (item[itemIdentifier] === itemId && item.isCombo === isCombo) {
          const currentProduct = products.find(p => p.id === item.id);
          if (!currentProduct) return item;

          const existingExtra = item.extras.find(e => e.id === extra.id);
          let newExtras;
          if (existingExtra) {
            newExtras = item.extras.map(e => e.id === extra.id ? { ...e, quantity: (e.quantity || 0) + 1 } : e);
          } else {
            newExtras = [...item.extras, { ...extra, quantity: 1 }];
          }
          const extrasTotal = newExtras.reduce((sum, e) => sum + (e.price * e.quantity), 0);
          
          let basePrice = item.originalPrice;
          if (item.isCombo) {
            basePrice += currentProduct.combo_price || 0;
          }

          return { ...item, extras: newExtras, price: basePrice + extrasTotal };
        }
        return item;
      })
    );
  }, [products]);

  const updateExtraQuantityState = useCallback((itemId, isCombo, extraId, newQuantity) => {
    const itemIdentifier = isCombo ? 'comboId' : 'id';
    setCurrentOrder(prevOrder =>
      prevOrder.map(item => {
        if (item[itemIdentifier] === itemId && item.isCombo === isCombo) {
          const currentProduct = products.find(p => p.id === item.id);
          if (!currentProduct) return item;

          let newExtras;
          if (newQuantity <= 0) {
            newExtras = item.extras.filter(e => e.id !== extraId);
          } else {
            newExtras = item.extras.map(e => e.id === extraId ? { ...e, quantity: newQuantity } : e);
          }
          const extrasTotal = newExtras.reduce((sum, e) => sum + (e.price * e.quantity), 0);
          
          let basePrice = item.originalPrice;
          if (item.isCombo) {
            basePrice += currentProduct.combo_price || 0;
          }

          return { ...item, extras: newExtras, price: basePrice + extrasTotal };
        }
        return item;
      })
    );
  }, [products]);

  const removeFromOrderState = useCallback((itemId, isCombo) => {
    const itemIdentifier = isCombo ? 'comboId' : 'id';
    setCurrentOrder(prevOrder => prevOrder.filter(item => !(item[itemIdentifier] === itemId && item.isCombo === isCombo)));
  }, []);

  const clearOrderState = useCallback(() => {
    setCurrentOrder([]);
  }, []);

  const confirmOrderState = useCallback(async (orderToConfirm, paymentDetails) => {
    if (!orderToConfirm || orderToConfirm.length === 0) {
        toast({ title: "Error", description: "El pedido está vacío.", variant: "destructive" });
        return null;
    }
    const { data: orderData, error: orderError } = await confirmOrderInSupabase(supabase, orderToConfirm, paymentDetails);

    if (orderError && !orderData) {
      toast({ title: "Error Grave de Venta", description: `No se pudo guardar el pedido: ${orderError.message}`, variant: "destructive" });
      return null;
    }
    
    if (orderError && orderData) {
        toast({ title: "Aviso de Inventario", description: `Venta guardada, pero: ${orderError.message}`, variant: "warning", duration: 8000 });
    }
    
    return orderData;
  }, [supabase, toast]);


  return {
    currentOrder,
    setCurrentOrder,
    loadOrder,
    addToOrder: addToOrderState,
    updateOrderItemQuantity: updateOrderItemQuantityState,
    addExtraToItem: addExtraToItemState,
    updateExtraQuantity: updateExtraQuantityState,
    removeFromOrder: removeFromOrderState,
    clearOrder: clearOrderState,
    confirmOrder: confirmOrderState
  };
};

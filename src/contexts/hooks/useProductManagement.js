import { useState, useCallback } from 'react';
    import { fetchProductsFromSupabase, addProductToSupabase, updateProductInSupabase, addProductPurchaseInSupabase } from '../appContextActions';

    export const useProductManagement = (toast, supabase, initialProductsData) => {
      const [products, setProducts] = useState([]);

      const fetchProductsState = useCallback(async () => {
        const { data, error } = await fetchProductsFromSupabase(supabase);
        if (error) {
          toast({ title: "Error", description: "No se pudieron cargar los productos.", variant: "destructive" });
          setProducts(initialProductsData);
        } else {
          setProducts(data);
        }
      }, [supabase, toast, initialProductsData]);

      const addProductState = useCallback(async (newProductData, linkedIngredients) => {
        const { data, error } = await addProductToSupabase(supabase, newProductData, linkedIngredients);
        if (error) {
          toast({ title: "Error", description: `No se pudo agregar el producto: ${error.message}`, variant: "destructive" });
          return null;
        }
        setProducts(prev => [data, ...prev].sort((a, b) => a.name.localeCompare(b.name)));
        toast({ title: "Producto Agregado", description: `${data.name} ha sido agregado al catálogo.` });
        return data;
      }, [supabase, toast]);

      const updateProductState = useCallback(async (productId, updatedProductData, linkedIngredients = null) => {
        const { data, error } = await updateProductInSupabase(supabase, productId, updatedProductData, linkedIngredients);
        if (error) {
          toast({ title: "Error", description: `No se pudo actualizar el producto: ${error.message}`, variant: "destructive" });
          return null;
        }
        setProducts(prev => prev.map(p => p.id === productId ? data : p).sort((a, b) => a.name.localeCompare(b.name)));
        toast({ title: "Producto Actualizado", description: `${data.name} ha sido actualizado.` });
        return data;
      }, [supabase, toast]);

      const addProductPurchaseState = useCallback(async (purchaseData) => {
        const { data, error } = await addProductPurchaseInSupabase(supabase, purchaseData);
        if (error) {
          toast({ title: "Error", description: `No se pudo registrar la compra: ${error.message}`, variant: "destructive" });
          return null;
        }
        setProducts(prev => prev.map(p => p.id === purchaseData.productId ? data : p));
        toast({ title: "Compra Registrada", description: `Se actualizó el stock y costo de ${data.name}.` });
        return data;
      }, [supabase, toast]);

      return { products, setProducts, fetchProductsState, addProductState, updateProductState, addProductPurchaseState };
    };
import { useState, useCallback } from 'react';
    import { fetchIngredientsFromSupabase, addIngredientToSupabase, updateIngredientStockInSupabase } from '../appContextActions';

    export const useIngredientManagement = (toast, supabase, initialIngredientsData) => {
      const [ingredients, setIngredients] = useState([]);

      const fetchIngredientsState = useCallback(async () => {
        const { data, error } = await fetchIngredientsFromSupabase(supabase);
        if (error) {
          toast({ title: "Error", description: "No se pudieron cargar los ingredientes.", variant: "destructive" });
          setIngredients(initialIngredientsData); // Fallback
        } else {
          setIngredients(data);
        }
      }, [supabase, toast, initialIngredientsData]);

      const addNewIngredientState = useCallback(async (newIngredient) => {
        const { data, error } = await addIngredientToSupabase(supabase, newIngredient);
        if (error) {
          toast({ title: "Error", description: `No se pudo agregar el ingrediente: ${error.message}`, variant: "destructive" });
          return null;
        }
        setIngredients(prev => [data, ...prev.sort((a, b) => a.name.localeCompare(b.name))]);
        toast({ title: "Ingrediente Agregado", description: `${data.name} ha sido agregado al inventario.` });
        return data;
      }, [supabase, toast]);

      const updateIngredientStockState = useCallback(async (ingredientId, change) => {
        const ingredient = ingredients.find(ing => ing.id === ingredientId);
        if (!ingredient) return;
        
        const currentStock = ingredient.stock_quantity || 0;
        const newStock = Math.max(0, currentStock + change);

        const { data, error } = await updateIngredientStockInSupabase(supabase, ingredientId, newStock);
        if (error) {
          toast({ title: "Error", description: `No se pudo actualizar el stock: ${error.message}`, variant: "destructive" });
        } else {
          setIngredients(prev => prev.map(ing => ing.id === ingredientId ? data : ing).sort((a, b) => a.name.localeCompare(b.name)));
          // No toast here to avoid spamming for every stock change during order confirmation
        }
      }, [supabase, toast, ingredients]);

      return { ingredients, setIngredients, fetchIngredientsState, addNewIngredientState, updateIngredientStockState };
    };
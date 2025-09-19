
import { startOfDay, endOfDay } from 'date-fns';

    export const fetchProductsFromSupabase = async (supabase) => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });
      return { data, error };
    };

    export const fetchIngredientsFromSupabase = async (supabase) => {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('name', { ascending: true });
      return { data, error };
    };

    export const fetchCompletedTicketsFromSupabase = async (supabase, dateRange = null) => {
      let query = supabase
        .from('orders')
        .select('*')
        .order('order_timestamp', { ascending: false });

      if (dateRange?.from && dateRange?.to) {
        query = query.gte('order_timestamp', startOfDay(dateRange.from).toISOString());
        query = query.lte('order_timestamp', endOfDay(dateRange.to).toISOString());
      }
      
      const { data, error } = await query;
      return { data, error };
    };

    export const addProductToSupabase = async (supabase, newProductData, linkedIngredients) => {
      const productToInsert = {
        name: newProductData.name,
        description: newProductData.description,
        price: parseFloat(newProductData.price),
        cost_per_unit: newProductData.cost_per_unit,
        category: newProductData.category,
        emoji: newProductData.emoji,
        combo_available: !!newProductData.comboPrice,
        combo_price: newProductData.comboPrice ? parseFloat(newProductData.comboPrice) : null,
        is_available: newProductData.is_available !== undefined ? newProductData.is_available : true,
        stock_quantity: newProductData.stock_quantity || 0,
        low_stock_threshold: newProductData.low_stock_threshold || 10,
      };
      const { data: product, error } = await supabase
        .from('products')
        .insert([productToInsert])
        .select()
        .single();

      if (error) return { data: product, error };

      if (linkedIngredients && linkedIngredients.length > 0) {
        const linksToInsert = linkedIngredients.map(link => ({
          product_id: product.id,
          ingredient_id: link.ingredient_id,
          quantity_used: link.quantity_used
        }));
        const { error: linkError } = await supabase.from('product_ingredients').insert(linksToInsert);
        if (linkError) return { data: product, error: linkError };
      }

      return { data: product, error: null };
    };

    export const updateProductInSupabase = async (supabase, productId, updatedProductData, linkedIngredients) => {
      const productToUpdate = { ...updatedProductData };

      if (productToUpdate.hasOwnProperty('comboPrice')) {
        productToUpdate.combo_price = productToUpdate.comboPrice ? parseFloat(productToUpdate.comboPrice) : null;
        delete productToUpdate.comboPrice;
      }
      
      if (productToUpdate.price) productToUpdate.price = parseFloat(productToUpdate.price);
      if (productToUpdate.cost_per_unit) productToUpdate.cost_per_unit = parseFloat(productToUpdate.cost_per_unit);
      if (productToUpdate.stock_quantity) productToUpdate.stock_quantity = parseFloat(productToUpdate.stock_quantity);
      if (productToUpdate.low_stock_threshold) productToUpdate.low_stock_threshold = parseFloat(productToUpdate.low_stock_threshold);
      
      productToUpdate.updated_at = new Date().toISOString();

      const { data: product, error } = await supabase
        .from('products')
        .update(productToUpdate)
        .eq('id', productId)
        .select()
        .single();

      if (error) return { data: product, error };

      if (linkedIngredients !== null) {
        const { error: deleteError } = await supabase.from('product_ingredients').delete().eq('product_id', productId);
        if (deleteError) return { data: product, error: deleteError };

        if (linkedIngredients && linkedIngredients.length > 0) {
          const linksToInsert = linkedIngredients.map(link => ({
            product_id: productId,
            ingredient_id: link.ingredient_id,
            quantity_used: link.quantity_used
          }));
          const { error: linkError } = await supabase.from('product_ingredients').insert(linksToInsert);
          if (linkError) return { data: product, error: linkError };
        }
      }

      return { data: product, error: null };
    };

    export const addProductPurchaseInSupabase = async (supabase, purchaseData) => {
      const { data, error } = await supabase.rpc('add_product_purchase', {
        p_product_id: purchaseData.productId,
        p_quantity_purchased: purchaseData.quantity,
        p_new_cost_per_unit: purchaseData.costPerUnit,
        p_new_sale_price: purchaseData.salePrice
      });
      
      if (error) return { data: null, error };

      const { data: updatedProduct, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', purchaseData.productId)
        .single();

      return { data: updatedProduct, error: fetchError };
    };


    export const addIngredientToSupabase = async (supabase, newIngredient) => {
      const ingredientToInsert = {
        name: newIngredient.name,
        emoji: newIngredient.emoji,
        unit: newIngredient.unit,
        stock_quantity: parseInt(newIngredient.stock_quantity) || 0,
        low_stock_threshold: parseInt(newIngredient.low_stock_threshold) || 0,
        cost_per_unit: parseFloat(newIngredient.cost_per_unit) || 0,
        category: newIngredient.category || null,
      };
      const { data, error } = await supabase
        .from('ingredients')
        .insert([ingredientToInsert])
        .select()
        .single();
      return { data, error };
    };

    export const updateIngredientStockInSupabase = async (supabase, ingredientId, newStock) => {
      const { data, error } = await supabase
        .from('ingredients')
        .update({ stock_quantity: newStock, updated_at: new Date().toISOString() })
        .eq('id', ingredientId)
        .select()
        .single();
      return { data, error };
    };

    export const confirmOrderInSupabase = async (supabase, currentOrder, paymentDetails) => {
      const totalAmount = currentOrder.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const orderItemsForDb = currentOrder.map(item => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        priceAtPurchase: item.price,
        costAtPurchase: item.cost_per_unit || 0,
        isCombo: item.isCombo,
        extras: item.extras,
        originalPrice: item.originalPrice,
        complements: item.complements?.map(c => ({ productId: c.id, name: c.name })) || []
      }));

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{ 
          items: orderItemsForDb, 
          total_amount: totalAmount,
          payment_method: paymentDetails.method,
          payment_details: { 
            amountPaid: paymentDetails.amountPaid, 
            change: paymentDetails.change,
            exchangeRate: paymentDetails.exchangeRate,
            totalInUSD: paymentDetails.totalInUSD
          },
          status: 'completed' 
        }])
        .select()
        .single();

      if (orderError) {
        console.error("Error saving order:", orderError);
        return { data: null, error: orderError };
      }
      
      const stockDeductionErrors = [];
      const allItemsToDeduct = new Map();

      for (const item of currentOrder) {
          const mainProductQuantity = allItemsToDeduct.get(item.id) || 0;
          allItemsToDeduct.set(item.id, mainProductQuantity + item.quantity);

          if (item.complements && item.complements.length > 0) {
              for (const complement of item.complements) {
                  const complementQuantity = allItemsToDeduct.get(complement.id) || 0;
                  allItemsToDeduct.set(complement.id, complementQuantity + item.quantity);
              }
          }
      }

      for (const [productId, totalQuantityToDeduct] of allItemsToDeduct.entries()) {
          const { error: productStockError } = await supabase.rpc('decrement_product_stock', {
              p_id: productId,
              quantity: totalQuantityToDeduct
          });
          if (productStockError) {
              stockDeductionErrors.push(`Error al descontar producto ${productId}: ${productStockError.message}`);
          }
          const { data: productIngredients, error: piError } = await supabase
              .from('product_ingredients')
              .select('ingredient_id, quantity_used')
              .eq('product_id', productId);
          
          if (piError) {
              stockDeductionErrors.push(`Error al buscar insumos para producto ${productId}: ${piError.message}`);
              continue;
          }

          if (productIngredients) {
              for (const pi of productIngredients) {
                  const ingredientQuantityToDeduct = pi.quantity_used * totalQuantityToDeduct;
                  const { error: stockUpdateError } = await supabase.rpc('decrement_ingredient_stock', {
                      ing_id: pi.ingredient_id,
                      quantity: ingredientQuantityToDeduct
                  });
                  if (stockUpdateError) {
                      stockDeductionErrors.push(`Error al descontar insumo ${pi.ingredient_id}: ${stockUpdateError.message}`);
                  }
              }
          }
      }
      
      if (stockDeductionErrors.length > 0) {
          console.error("Stock deduction errors occurred:", stockDeductionErrors);
          return { data: orderData, error: { message: "Se guardó la venta, pero hubo errores al actualizar el stock.", details: stockDeductionErrors } };
      }

      return { data: orderData, error: null };
    };

    export const deleteTicketFromSupabase = async (supabase, ticketId) => {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', ticketId);
      return { error };
    };

    export const deleteAllTicketsFromSupabase = async (supabase) => {
      const { error } = await supabase
        .from('orders')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      return { error };
    };

    export const addCashTransactionToSupabase = async (supabase, transaction) => {
      const { data, error } = await supabase
        .from('cash_transactions')
        .insert([transaction])
        .select()
        .single();
      return { data, error };
    }

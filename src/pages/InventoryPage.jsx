
import React, { useState, useEffect, useMemo } from 'react';
    import { useAppContext } from '@/contexts/AppContext';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { PlusCircle, PackagePlus, AlertTriangle, Loader2, ShoppingBag, Trash2, Infinity } from 'lucide-react';
    import { motion } from 'framer-motion';
    import AddProductModal from '@/components/modals/AddProductModal';
    import EditProductModal from '@/components/modals/EditProductModal';
    import AddIngredientModal from '@/components/modals/AddIngredientModal';
    import AddPurchaseModal from '@/components/modals/AddPurchaseModal';
    import { CATEGORIES } from '@/data';
    import { useToast } from "@/components/ui/use-toast";
    import { cn } from "@/lib/utils";
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
    import { ScrollArea } from '@/components/ui/scroll-area';
    import StockStatusCards from '@/components/inventory/StockStatusCards';
    import StockStatusModal from '@/components/inventory/StockStatusModal';
    import { EditableCell, EditableStockCell } from '@/components/inventory/EditableCell';

    const ProductFinancialsTable = ({ products, onUpdateProduct, onOpenPurchaseModal, onOpenEditModal, onDeleteProduct, ingredientsMap, productIngredientsMap }) => {
      const handleCellSave = (productId, field, newValue) => {
        const value = parseFloat(newValue);
        if (!isNaN(value)) {
          onUpdateProduct(productId, { [field]: value });
        }
      };

      const calculateProductionCost = (productId) => {
        const links = productIngredientsMap[productId] || [];
        return links.reduce((totalCost, link) => {
          const ingredient = ingredientsMap.get(link.ingredient_id);
          if (ingredient) {
            return totalCost + (ingredient.cost_per_unit * link.quantity_used);
          }
          return totalCost;
        }, 0);
      };

      return (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="p-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Producto</th>
                <th className="p-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                <th className="p-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Costo Prod.</th>
                <th className="p-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Precio Venta</th>
                <th className="p-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Utilidad</th>
                <th className="p-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Margen</th>
                <th className="p-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {products.map(product => {
                const isDirectProduct = ['drinks', 'sides'].includes(product.category);
                const productionCost = isDirectProduct ? (product.cost_per_unit || 0) : calculateProductionCost(product.id);
                const utility = product.price - productionCost;
                const margin = product.price > 0 ? (utility / product.price) * 100 : 0;
                const isLowStock = isDirectProduct && product.stock_quantity !== null && product.stock_quantity <= product.low_stock_threshold;

                return (
                  <tr key={product.id} className="hover:bg-white/20 dark:hover:bg-gray-700/10 transition-colors">
                    <td className="p-3 whitespace-nowrap"><div className="flex items-center">{product.emoji && <span className="mr-2 text-lg">{product.emoji}</span>}<span className="font-medium text-gray-800 dark:text-gray-200">{product.name}</span></div></td>
                    <td className="p-3 text-center font-mono">
                      {isDirectProduct ? (
                          product.stock_quantity !== null ? (
                          <EditableStockCell value={product.stock_quantity} onSave={(val) => handleCellSave(product.id, 'stock_quantity', val)} className={isLowStock ? "text-red-500 font-bold" : "text-gray-700 dark:text-gray-300"} />
                        ) : ( <span className="text-gray-400">-</span> )
                      ) : (
                        <div className="flex justify-center items-center" title="Basado en insumos"><Infinity size={20} className="text-gray-400"/></div>
                      )}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {isDirectProduct ? (
                        <EditableCell value={productionCost} onSave={(val) => handleCellSave(product.id, 'cost_per_unit', val)} className="text-gray-600 dark:text-gray-400" />
                      ) : (
                        <span className="text-gray-600 dark:text-gray-400 px-2 py-1">${productionCost.toFixed(2)}</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-mono"><EditableCell value={product.price} onSave={(val) => handleCellSave(product.id, 'price', val)} /></td>
                    <td className={cn("p-3 text-right font-mono", utility < 0 ? "text-red-500" : "text-green-600")}>${utility.toFixed(2)}</td>
                    <td className={cn("p-3 text-right font-mono", utility < 0 ? "text-red-500" : "text-green-600")}>{margin.toFixed(1)}%</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        {isDirectProduct && <Button variant="outline" size="sm" className="h-8" onClick={() => onOpenPurchaseModal(product)}><PackagePlus size={14} className="mr-1" /> Compra</Button>}
                        <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 h-8 w-8" onClick={() => onOpenEditModal(product)}><PlusCircle size={16} /></Button>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 h-8 w-8" onClick={() => onDeleteProduct(product.id)}><Trash2 size={16} /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    };

    const InventoryPage = () => {
      const { products, ingredients, fetchProducts, fetchIngredients, updateProduct, isLoading: contextIsLoading, supabase } = useAppContext();
      const { toast } = useToast();
      const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
      const [isEditModalOpen, setIsEditModalOpen] = useState(false);
      const [selectedProduct, setSelectedProduct] = useState(null);
      const [isLoading, setIsLoading] = useState(contextIsLoading);
      const [searchTerm, setSearchTerm] = useState('');
      const [isAddIngredientModalOpen, setIsAddIngredientModalOpen] = useState(false);
      const [isAddPurchaseModalOpen, setIsAddPurchaseModalOpen] = useState(false);
      const [productForPurchase, setProductForPurchase] = useState(null);
      const [productIngredientsMap, setProductIngredientsMap] = useState({});
      const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
      const [modalContent, setModalContent] = useState({ title: '', items: [] });

      useEffect(() => {
        setIsLoading(contextIsLoading);
        if (!contextIsLoading) {
          if (products.length === 0) fetchProducts();
          if (ingredients.length === 0) fetchIngredients();
        }
      }, [contextIsLoading, products.length, ingredients.length, fetchProducts, fetchIngredients]);

      useEffect(() => {
        const fetchProductIngredients = async () => {
          const { data, error } = await supabase.from('product_ingredients').select('*');
          if (error) {
            console.error("Error fetching product ingredients:", error);
            return;
          }
          const map = data.reduce((acc, link) => {
            if (!acc[link.product_id]) {
              acc[link.product_id] = [];
            }
            acc[link.product_id].push(link);
            return acc;
          }, {});
          setProductIngredientsMap(map);
        };
        fetchProductIngredients();
      }, [products, supabase]);

      const handleUpdateProductField = async (productId, fieldUpdate) => {
        await updateProduct(productId, fieldUpdate, null);
        toast({ title: "Producto Actualizado", description: "El valor ha sido guardado." });
      };

      const handleOpenPurchaseModal = (product) => {
        setProductForPurchase(product);
        setIsAddPurchaseModalOpen(true);
      };
      
      const handleOpenEditModal = (product) => {
        setSelectedProduct(product);
        setIsEditModalOpen(true);
      };

      const handleDeleteProduct = async (productId) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.")) {
          try {
            setIsLoading(true);
            await supabase.from('product_ingredients').delete().eq('product_id', productId);
            const { error } = await supabase.from('products').delete().eq('id', productId);
            if (error) throw error;
            await fetchProducts();
            setModalContent(prev => ({...prev, items: prev.items.filter(item => item.id !== productId)}));
            toast({ title: "Producto Eliminado", description: "El producto ha sido eliminado correctamente." });
          } catch (error) {
            toast({ title: "Error al Eliminar", description: `No se pudo eliminar el producto: ${error.message}`, variant: "destructive" });
          } finally {
            setIsLoading(false);
          }
        }
      };

      const handleCardClick = (title, items) => {
        if (items.length > 0) {
            setModalContent({ title, items });
            setIsStatusModalOpen(true);
        } else {
            toast({
                title: "Todo en orden",
                description: `No hay productos en la categoría "${title}".`,
            });
        }
      };

      const filteredProducts = useMemo(() => {
        if (!searchTerm.trim()) return products;
        return products.filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase().trim()));
      }, [products, searchTerm]);

      const ingredientsMap = useMemo(() => new Map(ingredients.map(i => [i.id, i])), [ingredients]);

      const productsByCategory = useMemo(() => {
        const grouped = {};
        CATEGORIES.forEach(cat => {
          grouped[cat.dbValue] = [];
        });
        filteredProducts.forEach(p => {
          if (grouped[p.category]) {
            grouped[p.category].push(p);
          }
        });
        return grouped;
      }, [filteredProducts]);

      if (isLoading && (products.length === 0 || ingredients.length === 0)) {
        return (
          <div className="p-4 sm:p-6 md:p-8 flex-1 flex justify-center items-center bg-gradient-to-br from-slate-100 to-gray-200 dark:from-slate-800 dark:to-gray-900 h-full">
            <div className="text-center">
              <Loader2 className="h-16 w-16 animate-spin text-brand-blue dark:text-sky-400 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">Cargando inventario...</p>
            </div>
          </div>
        );
      }

      return (
        <ScrollArea className="h-screen">
        <div className="p-4 sm:p-6 md:p-8 flex-1 flex flex-col bg-gradient-to-br from-slate-100 to-gray-200 dark:from-slate-800 dark:to-gray-900">
          <header className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start gap-4 sticky top-0 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm py-4 z-10 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8">
            <div className="flex-grow">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-red-dark dark:text-brand-red-light flex items-center">
                <ShoppingBag size={32} className="mr-3 text-brand-blue dark:text-sky-400" /> Inventario
              </h1>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Input type="search" placeholder="Buscar por nombre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-xs h-10 bg-white dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white shadow-sm flex-grow sm:flex-grow-0"/>
              <Button onClick={() => setIsAddProductModalOpen(true)} className="bg-brand-blue hover:bg-brand-blue/90 dark:bg-sky-500 dark:hover:bg-sky-600 text-white h-10">
                <PackagePlus size={18} className="mr-2" /> Agregar Producto
              </Button>
            </div>
          </header>

          <StockStatusCards 
            products={products} 
            ingredients={ingredients} 
            onCardClick={handleCardClick}
          />

          <Tabs defaultValue={CATEGORIES[0].dbValue} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
              {CATEGORIES.map(cat => (
                <TabsTrigger key={cat.id} value={cat.dbValue}>{cat.emoji} {cat.name}</TabsTrigger>
              ))}
            </TabsList>
            {CATEGORIES.map(cat => (
              <TabsContent key={cat.id} value={cat.dbValue}>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                  {productsByCategory[cat.dbValue]?.length > 0 ? (
                    <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                      <ProductFinancialsTable 
                        products={productsByCategory[cat.dbValue]} 
                        onUpdateProduct={handleUpdateProductField}
                        onOpenPurchaseModal={handleOpenPurchaseModal}
                        onOpenEditModal={handleOpenEditModal}
                        onDeleteProduct={handleDeleteProduct}
                        ingredientsMap={ingredientsMap}
                        productIngredientsMap={productIngredientsMap}
                      />
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-16 bg-white dark:bg-gray-800 rounded-xl shadow">
                      <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-500 dark:text-yellow-400" />
                      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">{searchTerm ? `No hay ${cat.name} que coincidan` : `No hay ${cat.name}`}</h2>
                      <p className="mt-1">{searchTerm ? "Intenta con otra búsqueda." : "Agrega algunos para empezar."}</p>
                    </div>
                  )}
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
          
          <AddProductModal isOpen={isAddProductModalOpen} onClose={() => setIsAddProductModalOpen(false)}/>
          <AddIngredientModal isOpen={isAddIngredientModalOpen} onClose={() => setIsAddIngredientModalOpen(false)} />
          {isStatusModalOpen && (
              <StockStatusModal
                  isOpen={isStatusModalOpen}
                  onClose={() => setIsStatusModalOpen(false)}
                  title={modalContent.title}
                  items={modalContent.items}
                  onOpenPurchaseModal={(product) => {
                      setIsStatusModalOpen(false);
                      setTimeout(() => handleOpenPurchaseModal(product), 150);
                  }}
                  onDeleteProduct={handleDeleteProduct}
              />
          )}
          {productForPurchase && (
            <AddPurchaseModal 
              isOpen={isAddPurchaseModalOpen} 
              onClose={() => { setIsAddPurchaseModalOpen(false); setProductForPurchase(null); }} 
              product={productForPurchase}
            />
          )}
          {selectedProduct && (
            <EditProductModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedProduct(null); }} product={selectedProduct}/>
          )}
        </div>
        </ScrollArea>
      );
    };

    export default InventoryPage;
  
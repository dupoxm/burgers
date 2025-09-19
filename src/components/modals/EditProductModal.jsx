import React, { useState, useEffect } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { Switch } from "@/components/ui/switch";
    import { useAppContext } from '@/contexts/AppContext';
    import { CATEGORIES } from '@/data';
    import { motion } from 'framer-motion';
    import { PlusCircle, Trash2, Loader2 } from 'lucide-react';
    import { ScrollArea } from '@/components/ui/scroll-area';

    const EditProductModal = ({ isOpen, onClose, product }) => {
      const { updateProduct, ingredients, supabase } = useAppContext();
      const [name, setName] = useState('');
      const [description, setDescription] = useState('');
      const [price, setPrice] = useState('');
      const [costPerUnit, setCostPerUnit] = useState('');
      const [category, setCategory] = useState('');
      const [emoji, setEmoji] = useState('');
      const [comboAvailable, setComboAvailable] = useState(false);
      const [comboPrice, setComboPrice] = useState('');
      const [isAvailable, setIsAvailable] = useState(true);
      const [linkedIngredients, setLinkedIngredients] = useState([]);
      const [isLoadingLinks, setIsLoadingLinks] = useState(false);

      useEffect(() => {
        if (product) {
          setName(product.name || '');
          setDescription(product.description || '');
          setPrice(product.price?.toString() || '');
          setCostPerUnit(product.cost_per_unit?.toString() || '0');
          setCategory(product.category || '');
          setEmoji(product.emoji || '');
          setComboAvailable(product.combo_available || false);
          setComboPrice(product.combo_price?.toString() || '');
          setIsAvailable(product.is_available !== undefined ? product.is_available : true);
          
          const fetchLinks = async () => {
            setIsLoadingLinks(true);
            const { data } = await supabase.from('product_ingredients').select('*').eq('product_id', product.id);
            setLinkedIngredients(data || []);
            setIsLoadingLinks(false);
          };
          fetchLinks();
        }
      }, [product, supabase]);

      const handleAddIngredientLink = () => {
        setLinkedIngredients([...linkedIngredients, { product_id: product.id, ingredient_id: '', quantity_used: '' }]);
      };

      const handleRemoveIngredientLink = (index) => {
        const newList = linkedIngredients.filter((_, i) => i !== index);
        setLinkedIngredients(newList);
      };

      const handleIngredientLinkChange = (index, field, value) => {
        const newList = linkedIngredients.map((item, i) => {
          if (i === index) {
            return { ...item, [field]: value };
          }
          return item;
        });
        setLinkedIngredients(newList);
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!product) return;

        const updatedProductData = {
          name,
          description,
          price: parseFloat(price),
          cost_per_unit: parseFloat(costPerUnit),
          category: category,
          emoji,
          combo_available: comboAvailable,
          comboPrice: comboAvailable && comboPrice ? parseFloat(comboPrice) : null,
          is_available: isAvailable,
        };
        const finalLinkedIngredients = linkedIngredients.filter(
          link => link.ingredient_id && link.quantity_used > 0
        ).map(link => ({...link, quantity_used: parseFloat(link.quantity_used)}));

        await updateProduct(product.id, updatedProductData, finalLinkedIngredients);
        onClose();
      };

      if (!isOpen || !product) return null;

      const activeCategories = CATEGORIES.filter(c => c.id !== 'combos');
      const isComposedProduct = ['burgers', 'hotdogs'].includes(category);

      return (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl">Editar Producto: {product.name}</DialogTitle>
                <DialogDescription>Modifica los detalles y los insumos del producto.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <ScrollArea className="max-h-[70vh] pr-6">
                  <div className="grid gap-4 py-4">
                    <div><Label htmlFor="edit-product-name">Nombre del Producto</Label><Input id="edit-product-name" value={name} onChange={(e) => setName(e.target.value)} required /></div>
                    <div><Label htmlFor="edit-product-description">Descripción</Label><Input id="edit-product-description" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-product-cost">Costo por Unidad</Label>
                        <Input 
                          id="edit-product-cost" 
                          type="number" 
                          value={costPerUnit} 
                          onChange={(e) => setCostPerUnit(e.target.value)} 
                          required 
                          min="0" 
                          step="0.01"
                          disabled={isComposedProduct}
                          title={isComposedProduct ? "El costo se calcula basado en los insumos" : ""}
                        />
                      </div>
                      <div><Label htmlFor="edit-product-price">Precio de Venta</Label><Input id="edit-product-price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" step="0.01" /></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div><Label htmlFor="edit-product-category">Categoría</Label><Select value={category} onValueChange={setCategory} required><SelectTrigger id="edit-product-category"><SelectValue placeholder="Selecciona categoría" /></SelectTrigger><SelectContent>{activeCategories.map(cat => (<SelectItem key={cat.id} value={cat.dbValue}>{cat.name}</SelectItem>))}</SelectContent></Select></div>
                      <div><Label htmlFor="edit-product-emoji">Emoji (opcional)</Label><Input id="edit-product-emoji" value={emoji} onChange={(e) => setEmoji(e.target.value)} /></div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2"><Switch id="edit-product-available" checked={isAvailable} onCheckedChange={setIsAvailable} /><Label htmlFor="edit-product-available">Disponible para la venta</Label></div>

                    <div className="space-y-2 mt-2">
                      <div className="flex items-center space-x-2"><Switch id="edit-product-combo-available" checked={comboAvailable} onCheckedChange={setComboAvailable} /><Label htmlFor="edit-product-combo-available">Ofrecer como Combo</Label></div>
                      {comboAvailable && (<div><Label htmlFor="edit-product-combo-price">Precio Adicional Combo</Label><Input id="edit-product-combo-price" type="number" value={comboPrice} onChange={(e) => setComboPrice(e.target.value)} min="0" step="0.01" placeholder="Ej: 50" /></div>)}
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <h3 className="text-lg font-medium mb-2">Insumos Utilizados</h3>
                      {isLoadingLinks ? <Loader2 className="animate-spin" /> : (
                        <div className="space-y-2">
                          {linkedIngredients.map((link, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Select value={link.ingredient_id} onValueChange={(value) => handleIngredientLinkChange(index, 'ingredient_id', value)}>
                                <SelectTrigger><SelectValue placeholder="Selecciona insumo..." /></SelectTrigger>
                                <SelectContent>{ingredients.map(ing => <SelectItem key={ing.id} value={ing.id}>{ing.name}</SelectItem>)}</SelectContent>
                              </Select>
                              <Input type="number" placeholder="Cant." value={link.quantity_used} onChange={(e) => handleIngredientLinkChange(index, 'quantity_used', e.target.value)} className="w-24" min="0" step="any" />
                              <span className="text-sm text-gray-500">{ingredients.find(i => i.id === link.ingredient_id)?.unit || ''}</span>
                              <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveIngredientLink(index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                            </div>
                          ))}
                        </div>
                      )}
                      <Button type="button" variant="outline" size="sm" onClick={handleAddIngredientLink} className="mt-2"><PlusCircle className="h-4 w-4 mr-2" />Añadir Insumo</Button>
                    </div>
                  </div>
                </ScrollArea>
                <DialogFooter className="mt-4 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                  <Button type="submit" className="bg-brand-blue hover:bg-brand-blue/90">Guardar Cambios</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </motion.div>
        </Dialog>
      );
    };

    export default EditProductModal;
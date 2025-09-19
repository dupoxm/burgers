import React, { useState, useEffect, useMemo } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { Switch } from "@/components/ui/switch";
    import { useAppContext } from '@/contexts/AppContext';
    import { CATEGORIES } from '@/data';
    import { motion } from 'framer-motion';
    import { PlusCircle, Trash2, TrendingUp } from 'lucide-react';
    import { ScrollArea } from '@/components/ui/scroll-area';

    const AddProductModal = ({ isOpen, onClose }) => {
      const { addProduct, ingredients } = useAppContext();
      const [name, setName] = useState('');
      const [description, setDescription] = useState('');
      const [price, setPrice] = useState(''); // Precio de venta
      const [totalCost, setTotalCost] = useState(''); // Costo total del lote
      const [unitsObtained, setUnitsObtained] = useState(''); // Unidades en el lote
      const [category, setCategory] = useState('');
      const [emoji, setEmoji] = useState('');
      const [comboAvailable, setComboAvailable] = useState(false);
      const [comboPrice, setComboPrice] = useState('');
      const [isAvailable, setIsAvailable] = useState(true);
      const [linkedIngredients, setLinkedIngredients] = useState([]);

      const costPerUnit = useMemo(() => {
        const tc = parseFloat(totalCost);
        const uo = parseInt(unitsObtained, 10);
        if (tc > 0 && uo > 0) {
          return (tc / uo).toFixed(2);
        }
        return '0.00';
      }, [totalCost, unitsObtained]);

      const handleAddIngredientLink = () => {
        setLinkedIngredients([...linkedIngredients, { ingredient_id: '', quantity_used: '' }]);
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

      const resetForm = () => {
        setName(''); setDescription(''); setPrice(''); setTotalCost(''); setUnitsObtained(''); setCategory(''); setEmoji('');
        setComboAvailable(false); setComboPrice(''); setIsAvailable(true);
        setLinkedIngredients([]);
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        const newProductData = {
          name,
          description,
          price: parseFloat(price),
          cost_per_unit: parseFloat(costPerUnit),
          category: category,
          emoji,
          comboPrice: comboAvailable && comboPrice ? parseFloat(comboPrice) : null,
          is_available: isAvailable,
        };
        const finalLinkedIngredients = linkedIngredients.filter(
          link => link.ingredient_id && link.quantity_used > 0
        ).map(link => ({...link, quantity_used: parseFloat(link.quantity_used)}));

        await addProduct(newProductData, finalLinkedIngredients);
        onClose();
        resetForm();
      };

      if (!isOpen) return null;

      const activeCategories = CATEGORIES.filter(c => c.id !== 'combos');

      return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); resetForm(); } }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl">Agregar Nuevo Producto</DialogTitle>
                <DialogDescription>Completa los detalles de costo, venta y vincula los insumos que utiliza.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <ScrollArea className="max-h-[70vh] pr-6">
                  <div className="grid gap-4 py-4">
                    <div><Label htmlFor="product-name">Nombre del Producto</Label><Input id="product-name" value={name} onChange={(e) => setName(e.target.value)} required /></div>
                    <div><Label htmlFor="product-description">Descripción</Label><Input id="product-description" value={description} onChange={(e) => setDescription(e.target.value)} /></div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                       <div><Label htmlFor="product-total-cost">Costo Total Lote</Label><Input id="product-total-cost" type="number" value={totalCost} onChange={(e) => setTotalCost(e.target.value)} placeholder="Ej: 300" min="0" step="0.01" /></div>
                       <div><Label htmlFor="product-units">Unidades Obtenidas</Label><Input id="product-units" type="number" value={unitsObtained} onChange={(e) => setUnitsObtained(e.target.value)} placeholder="Ej: 50" min="1" step="1" /></div>
                        <div className="flex flex-col justify-end">
                            <Label>Costo por Unidad</Label>
                            <div className="flex items-center h-10 px-3 rounded-md border bg-gray-100 dark:bg-gray-800">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">${costPerUnit}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div><Label htmlFor="product-price">Precio de Venta</Label><Input id="product-price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" step="0.01" placeholder="Precio al público" /></div>
                      <div><Label htmlFor="product-category">Categoría</Label><Select value={category} onValueChange={setCategory} required><SelectTrigger id="product-category"><SelectValue placeholder="Selecciona categoría" /></SelectTrigger><SelectContent>{activeCategories.map(cat => (<SelectItem key={cat.id} value={cat.dbValue}>{cat.name}</SelectItem>))}</SelectContent></Select></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div><Label htmlFor="product-emoji">Emoji (opcional)</Label><Input id="product-emoji" value={emoji} onChange={(e) => setEmoji(e.target.value)} /></div>
                      <div className="flex items-center space-x-2 pt-6"><Switch id="product-available" checked={isAvailable} onCheckedChange={setIsAvailable} /><Label htmlFor="product-available">Disponible</Label></div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2"><Switch id="product-combo-available" checked={comboAvailable} onCheckedChange={setComboAvailable} /><Label htmlFor="product-combo-available">Ofrecer como Combo</Label></div>
                      {comboAvailable && (<div><Label htmlFor="product-combo-price">Precio Adicional Combo</Label><Input id="product-combo-price" type="number" value={comboPrice} onChange={(e) => setComboPrice(e.target.value)} min="0" step="0.01" placeholder="Ej: 50" /></div>)}
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <h3 className="text-lg font-medium mb-2">Insumos Utilizados</h3>
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
                      <Button type="button" variant="outline" size="sm" onClick={handleAddIngredientLink} className="mt-2"><PlusCircle className="h-4 w-4 mr-2" />Añadir Insumo</Button>
                    </div>
                  </div>
                </ScrollArea>
                <DialogFooter className="mt-4 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => { onClose(); resetForm(); }}>Cancelar</Button>
                  <Button type="submit" className="bg-brand-green hover:bg-brand-green/90">Agregar Producto</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </motion.div>
        </Dialog>
      );
    };

    export default AddProductModal;
import React, { useState } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { useAppContext } from '@/contexts/AppContext';

    const AddIngredientModal = ({ isOpen, onClose }) => {
      const { addNewIngredient } = useAppContext();
      const [name, setName] = useState('');
      const [emoji, setEmoji] = useState('');
      const [unit, setUnit] = useState('');
      const [stockQuantity, setStockQuantity] = useState('');
      const [lowStockThreshold, setLowStockThreshold] = useState('');
      const [costPerUnit, setCostPerUnit] = useState('');
      const [category, setCategory] = useState('');
      const [isSubmitting, setIsSubmitting] = useState(false);

      const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const newIngredientData = { 
          name, 
          emoji, 
          unit, 
          stock_quantity: parseInt(stockQuantity) || 0,
          low_stock_threshold: parseInt(lowStockThreshold) || 0,
          cost_per_unit: parseFloat(costPerUnit) || 0,
          category
        };
        
        const result = await addNewIngredient(newIngredientData);
        if (result) {
          setName(''); 
          setEmoji(''); 
          setUnit(''); 
          setStockQuantity(''); 
          setLowStockThreshold(''); 
          setCostPerUnit('');
          setCategory('');
          onClose();
        }
        setIsSubmitting(false);
      };

      return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Ingrediente</DialogTitle>
              <DialogDescription>Completa los detalles del nuevo ingrediente para el inventario.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div>
                <Label htmlFor="ing-name">Nombre del Ingrediente</Label>
                <Input id="ing-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Tomate Fresco" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ing-emoji">Emoji (opcional)</Label>
                  <Input id="ing-emoji" value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="🍅" />
                </div>
                <div>
                  <Label htmlFor="ing-unit">Unidad de Medida</Label>
                  <Input id="ing-unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="kg, pza, lt" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ing-stock">Stock Inicial</Label>
                  <Input id="ing-stock" type="number" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} placeholder="0" required min="0" />
                </div>
                <div>
                  <Label htmlFor="ing-low-stock">Umbral Bajo Stock (opcional)</Label>
                  <Input id="ing-low-stock" type="number" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} placeholder="0" min="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ing-cost">Costo por Unidad (opcional)</Label>
                  <Input id="ing-cost" type="number" value={costPerUnit} onChange={(e) => setCostPerUnit(e.target.value)} placeholder="0.00" min="0" step="0.01" />
                </div>
                 <div>
                  <Label htmlFor="ing-category">Categoría (opcional)</Label>
                  <Input id="ing-category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ej: Vegetal, Lácteo"/>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                <Button type="submit" className="bg-brand-green hover:bg-brand-green/90" disabled={isSubmitting}>
                  {isSubmitting ? "Agregando..." : "Agregar Ingrediente"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      );
    };

    export default AddIngredientModal;
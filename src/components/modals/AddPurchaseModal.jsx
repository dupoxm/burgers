import React, { useState, useMemo } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { useAppContext } from '@/contexts/AppContext';
    import { motion } from 'framer-motion';
    import { PackagePlus } from 'lucide-react';

    const AddPurchaseModal = ({ isOpen, onClose, product }) => {
      const { addProductPurchase } = useAppContext();
      const [purchaseCost, setPurchaseCost] = useState('');
      const [purchaseQuantity, setPurchaseQuantity] = useState('');
      const [newSalePrice, setNewSalePrice] = useState('');

      const newCostPerUnit = useMemo(() => {
        const cost = parseFloat(purchaseCost);
        const quantity = parseInt(purchaseQuantity, 10);
        if (cost > 0 && quantity > 0) {
          return (cost / quantity).toFixed(2);
        }
        return '0.00';
      }, [purchaseCost, purchaseQuantity]);

      const resetForm = () => {
        setPurchaseCost('');
        setPurchaseQuantity('');
        setNewSalePrice('');
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!product) return;

        const purchaseData = {
          productId: product.id,
          quantity: parseInt(purchaseQuantity, 10),
          costPerUnit: parseFloat(newCostPerUnit),
          salePrice: newSalePrice ? parseFloat(newSalePrice) : product.price,
        };

        await addProductPurchase(purchaseData);
        onClose();
        resetForm();
      };

      if (!isOpen || !product) return null;

      return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); resetForm(); } }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center">
                  <PackagePlus className="mr-2 h-6 w-6 text-brand-blue" />
                  Agregar Compra: {product.name}
                </DialogTitle>
                <DialogDescription>
                  Registra una nueva compra para actualizar el stock y los costos de este producto.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="purchase-quantity">Unidades Adquiridas</Label>
                    <Input id="purchase-quantity" type="number" value={purchaseQuantity} onChange={(e) => setPurchaseQuantity(e.target.value)} required min="1" step="1" placeholder="Ej: 24" />
                  </div>
                  <div>
                    <Label htmlFor="purchase-cost">Costo Total del Lote</Label>
                    <Input id="purchase-cost" type="number" value={purchaseCost} onChange={(e) => setPurchaseCost(e.target.value)} required min="0" step="0.01" placeholder="Ej: 480" />
                  </div>
                  <div className="flex flex-col justify-end">
                    <Label>Nuevo Costo por Unidad</Label>
                    <div className="flex items-center h-10 px-3 rounded-md border bg-gray-100 dark:bg-gray-800">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">${newCostPerUnit}</span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="new-sale-price">Nuevo Precio de Venta (Opcional)</Label>
                    <Input id="new-sale-price" type="number" value={newSalePrice} onChange={(e) => setNewSalePrice(e.target.value)} min="0" step="0.01" placeholder={`Actual: $${product.price.toFixed(2)}`} />
                  </div>
                </div>
                <DialogFooter className="mt-4 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => { onClose(); resetForm(); }}>Cancelar</Button>
                  <Button type="submit" className="bg-brand-green hover:bg-brand-green/90">Confirmar Compra</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </motion.div>
        </Dialog>
      );
    };

    export default AddPurchaseModal;
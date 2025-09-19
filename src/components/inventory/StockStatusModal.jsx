
import React from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { useAppContext } from '@/contexts/AppContext';
    import { useToast } from "@/components/ui/use-toast";
    import { ScrollArea } from '@/components/ui/scroll-area';
    import { EditableStockCell } from '@/components/inventory/EditableCell';
    import { Trash2, PackagePlus } from 'lucide-react';

    const StockStatusModal = ({ isOpen, onClose, title, items, onOpenPurchaseModal, onDeleteProduct }) => {
        const { updateProduct, updateIngredientStock } = useAppContext();
        const { toast } = useToast();

        const handleStockUpdate = async (item, newStock) => {
            const value = parseInt(newStock, 10);
            if (!isNaN(value)) {
                if (item.unit) { // It's an ingredient
                    await updateIngredientStock(item.id, value);
                } else { // It's a product
                    await updateProduct(item.id, { stock_quantity: value }, null);
                }
                toast({ title: "Stock Actualizado", description: `El stock de ${item.name} ha sido actualizado.` });
            }
        };

        const handleDelete = async (item) => {
            if (item.unit) { // It's an ingredient
                 toast({ title: "Acción no disponible", description: "La eliminación de insumos se realiza desde su propia tabla." });
            } else {
                await onDeleteProduct(item.id);
            }
        };

        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl">{title}</DialogTitle>
                        <DialogDescription>Gestiona los productos con este estado de inventario.</DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh]">
                        <div className="overflow-x-auto pr-4">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="p-2 text-left text-xs font-semibold uppercase tracking-wider">Producto</th>
                                        <th className="p-2 text-center text-xs font-semibold uppercase tracking-wider">Stock Actual</th>
                                        <th className="p-2 text-center text-xs font-semibold uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(item => (
                                        <tr key={item.id} className="border-b">
                                            <td className="p-2 whitespace-nowrap"><div className="flex items-center">{item.emoji && <span className="mr-2">{item.emoji}</span>}<span>{item.name}</span></div></td>
                                            <td className="p-2 text-center">
                                                <EditableStockCell value={item.stock_quantity} onSave={(val) => handleStockUpdate(item, val)} />
                                            </td>
                                            <td className="p-2 text-center">
                                                <div className="flex justify-center items-center space-x-2">
                                                    {!item.unit && (
                                                      <>
                                                        <Button variant="outline" size="sm" onClick={() => onOpenPurchaseModal(item)}>
                                                            <PackagePlus size={14} className="mr-1" /> Compra
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(item)}>
                                                            <Trash2 size={16} />
                                                        </Button>
                                                      </>
                                                    )}
                                                     {item.unit && <span className="text-xs text-gray-400">Gestionar en Insumos</span>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </ScrollArea>
                    <DialogFooter>
                        <Button onClick={onClose}>Cerrar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    export default StockStatusModal;
  
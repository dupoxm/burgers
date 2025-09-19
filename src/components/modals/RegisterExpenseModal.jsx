import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppContext } from '@/contexts/AppContext';

const EXPENSE_CATEGORIES = [
    "Insumos", "Servicios", "Nómina", "Mantenimiento", "Marketing", "Renta", "Otros"
];

const RegisterExpenseModal = ({ isOpen, onClose }) => {
  const { addExpense } = useAppContext();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0 || !category) {
      // Basic validation feedback needed
      return;
    }
    
    setIsSubmitting(true);
    await addExpense(numericAmount, category, notes || 'Gasto registrado');
    setIsSubmitting(false);
    setAmount('');
    setCategory('');
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Gasto</DialogTitle>
          <DialogDescription>
            Registra una salida de dinero de la caja. Se descontará en el corte.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="expense-amount">Monto del Gasto</Label>
              <Input
                id="expense-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ej: 350.50"
                required
                min="0.01"
                step="0.01"
              />
            </div>
            <div>
                <Label htmlFor="expense-category">Categoría</Label>
                <Select onValueChange={setCategory} value={category}>
                    <SelectTrigger id="expense-category">
                        <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                        {EXPENSE_CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
              <Label htmlFor="expense-notes">Notas (Opcional)</Label>
              <Textarea
                id="expense-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Compra de servilletas y desinfectante"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-red-500 hover:bg-red-600" disabled={isSubmitting || !category || !amount}>
              {isSubmitting ? 'Registrando...' : 'Registrar Gasto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterExpenseModal;
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingDown, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ExpensesCard = ({ expenses }) => {
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
      <Card className="lg:col-span-3 shadow-xl border-t-4 border-orange-500 bg-orange-50/30">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-orange-700 flex items-center">
            <TrendingDown size={20} className="mr-2" /> Gastos Registrados (Rango)
          </CardTitle>
          <CardDescription className="text-orange-600">
            Total de gastos en el período seleccionado: <span className="font-bold">${totalExpenses.toFixed(2)}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length > 0 ? (
            <ScrollArea className="h-64">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-orange-100">
                    <tr>
                      <th className="p-2 text-left text-orange-800 font-semibold">Fecha</th>
                      <th className="p-2 text-left text-orange-800 font-semibold">Categoría</th>
                      <th className="p-2 text-left text-orange-800 font-semibold">Monto</th>
                      <th className="p-2 text-left text-orange-800 font-semibold">Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map(expense => (
                      <tr key={expense.id} className="border-b border-orange-200 hover:bg-orange-50 transition-colors">
                        <td className="p-2 text-gray-500 text-xs">{format(new Date(expense.created_at), 'P', { locale: es })}</td>
                        <td className="p-2 text-gray-600 capitalize">{expense.category || 'General'}</td>
                        <td className="p-2 font-medium text-red-600">${expense.amount.toFixed(2)}</td>
                        <td className="p-2 text-gray-700 truncate max-w-xs">{expense.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-10">
              <AlertTriangle size={32} className="mx-auto text-orange-500" />
              <p className="mt-2 text-sm text-gray-500">No se registraron gastos en este rango.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ExpensesCard;
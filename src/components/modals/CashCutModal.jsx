import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppContext } from '@/contexts/AppContext';
import { Loader2, Printer, AlertTriangle, TrendingUp, TrendingDown, ShoppingBag, DollarSign, CreditCard, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ScrollArea } from '../ui/scroll-area';

const StatItem = ({ icon: Icon, label, value, colorClass = 'text-gray-800', valueColorClass = 'text-gray-900' }) => (
    <div className="flex justify-between items-center py-2 border-b">
        <div className="flex items-center">
            <Icon className={`h-4 w-4 mr-2 ${colorClass}`} />
            <span className={`text-sm ${colorClass}`}>{label}</span>
        </div>
        <span className={`text-sm font-semibold ${valueColorClass}`}>{value}</span>
    </div>
);

const CashCutModal = ({ isOpen, onClose }) => {
  const { cashFund, performCashCut, supabase, products } = useAppContext();
  const [shiftData, setShiftData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [finalCash, setFinalCash] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      const fetchShiftData = async () => {
        setIsLoading(true);
        const shiftStartTime = localStorage.getItem('shiftStartTime');
        if (!shiftStartTime) {
          setIsLoading(false);
          return;
        }

        const startTimeISO = new Date(parseInt(shiftStartTime)).toISOString();

        const { data: tickets, error: ticketsError } = await supabase.from('orders').select('*').gte('created_at', startTimeISO);
        const { data: transactions, error: transError } = await supabase.from('cash_transactions').select('*').gte('created_at', startTimeISO);

        if (ticketsError || transError) {
          console.error("Error fetching shift data", ticketsError || transError);
          setIsLoading(false);
          return;
        }
        
        const productMap = new Map(products.map(p => [p.id, p]));
        let salesByMethod = { cash: 0, card: 0, dollars: 0, transfer: 0, mercadopago: 0, other: 0 };
        let totalProfit = 0;
        const productCounts = {};

        tickets.forEach(t => {
            const method = t.payment_method?.toLowerCase() || 'other';
            if (method.includes('efectivo')) salesByMethod.cash += t.total_amount;
            else if (method.includes('tarjeta')) salesByMethod.card += t.total_amount;
            else if (method.includes('dólares')) salesByMethod.dollars += t.total_amount;
            else if (method.includes('transferencia')) salesByMethod.transfer += t.total_amount;
            else if (method.includes('mercado pago')) salesByMethod.mercadopago += t.total_amount;
            else salesByMethod.other += t.total_amount;

            t.items.forEach(item => {
                const itemProfit = (item.priceAtPurchase - (item.costAtPurchase || 0)) * item.quantity;
                totalProfit += itemProfit;
                const productInfo = productMap.get(item.productId) || { name: item.name, profit: itemProfit };
                if (!productCounts[item.productId]) {
                    productCounts[item.productId] = { name: productInfo.name, count: 0, profit: 0 };
                }
                productCounts[item.productId].count += item.quantity;
                productCounts[item.productId].profit += itemProfit;
            });
        });

        const topProducts = Object.values(productCounts).sort((a, b) => b.count - a.count).slice(0, 5);
        const topProfitProducts = Object.values(productCounts).sort((a, b) => b.profit - a.profit).slice(0, 1);

        const fundsAdded = transactions.filter(t => t.transaction_type === 'add_fund').reduce((sum, t) => sum + t.amount, 0);
        const withdrawals = transactions.filter(t => t.transaction_type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions.filter(t => t.transaction_type === 'expense');
        const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);

        const totalSales = tickets.reduce((sum, t) => sum + t.total_amount, 0);
        const expectedCash = (cashFund.amount || 0) + salesByMethod.cash + fundsAdded - withdrawals - totalExpenses;

        setShiftData({
          startTime: new Date(parseInt(shiftStartTime)),
          endTime: new Date(),
          initialFund: cashFund.amount || 0,
          totalSales,
          totalProfit,
          salesByMethod,
          totalTickets: tickets.length,
          fundsAdded,
          withdrawals,
          totalExpenses,
          expenses,
          expectedCash,
          topProducts,
          topProfitProduct: topProfitProducts[0]
        });

        setIsLoading(false);
      };

      fetchShiftData();
    }
  }, [isOpen, supabase, cashFund.amount, products]);

  const handlePerformCut = async () => {
    if (!shiftData) return;
    const finalCashAmount = parseFloat(finalCash) || 0;
    const cutData = {
        start_time: shiftData.startTime.toISOString(),
        end_time: shiftData.endTime.toISOString(),
        initial_fund: shiftData.initialFund,
        total_sales: shiftData.totalSales,
        total_profit: shiftData.totalProfit,
        total_tickets: shiftData.totalTickets,
        total_expenses: shiftData.totalExpenses,
        funds_added: shiftData.fundsAdded,
        withdrawals: shiftData.withdrawals,
        expected_cash_in_box: shiftData.expectedCash,
        final_cash_in_box: finalCashAmount,
        difference: finalCashAmount - shiftData.expectedCash,
        sales_by_method: shiftData.salesByMethod,
        top_products: shiftData.topProducts,
        notes: notes,
    };

    const { error } = await supabase.from('cash_cuts').insert([cutData]);
    if (error) {
        alert("Error al guardar el corte de caja: " + error.message);
    } else {
        performCashCut();
        onClose();
    }
  };
  
  const handlePrint = () => {
    if (!shiftData) return;
    const doc = new jsPDF();
    const finalCashAmount = parseFloat(finalCash) || 0;
    
    doc.setFontSize(18);
    doc.text("Corte de Caja - Bugers&Dogs", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Fecha de corte: ${format(shiftData.endTime, "PPP p", { locale: es })}`, 14, 30);
    doc.text(`Turno iniciado: ${format(shiftData.startTime, "PPP p", { locale: es })}`, 14, 36);

    const financialData = [
      ["Fondo Inicial", `$${shiftData.initialFund.toFixed(2)}`],
      ["+ Ventas en Efectivo", `$${shiftData.salesByMethod.cash.toFixed(2)}`],
      ["+ Fondos Agregados", `$${shiftData.fundsAdded.toFixed(2)}`],
      ["- Retiros de Caja", `-$${shiftData.withdrawals.toFixed(2)}`],
      ["- Gastos", `-$${shiftData.totalExpenses.toFixed(2)}`],
      [{ content: "Total Esperado en Caja", styles: { fontStyle: 'bold' } }, { content: `$${shiftData.expectedCash.toFixed(2)}`, styles: { fontStyle: 'bold' } }],
      ["Dinero Real en Caja", `$${finalCashAmount.toFixed(2)}`],
      [{ content: "Diferencia", styles: { fontStyle: 'bold', textColor: (finalCashAmount - shiftData.expectedCash) < 0 ? [255,0,0] : [0,128,0] } }, { content: `$${(finalCashAmount - shiftData.expectedCash).toFixed(2)}`, styles: { fontStyle: 'bold' } }],
    ];

    const salesData = [
        ["Ventas Totales (Global)", `$${shiftData.totalSales.toFixed(2)}`],
        ["Utilidad Bruta (Ventas - Costo)", `$${shiftData.totalProfit.toFixed(2)}`],
        ["Número de Tickets", `${shiftData.totalTickets}`],
        ["Ventas con Tarjeta", `$${shiftData.salesByMethod.card.toFixed(2)}`],
        ["Ventas en Dólares", `$${shiftData.salesByMethod.dollars.toFixed(2)}`],
        ["Otras formas de pago", `$${(shiftData.salesByMethod.transfer + shiftData.salesByMethod.mercadopago + shiftData.salesByMethod.other).toFixed(2)}`],
    ];

    doc.autoTable({
        startY: 45,
        head: [['Resumen Financiero', 'Monto']],
        body: financialData,
        theme: 'striped',
        headStyles: { fillColor: [31, 41, 55] },
    });

    doc.autoTable({
        startY: doc.lastAutoTable.finalY + 10,
        head: [['Resumen de Operaciones', 'Valor']],
        body: salesData,
        theme: 'striped',
        headStyles: { fillColor: [31, 41, 55] },
    });

    if (notes) {
        doc.text("Observaciones:", 14, doc.lastAutoTable.finalY + 10);
        doc.text(notes, 14, doc.lastAutoTable.finalY + 15, { maxWidth: 180 });
    }

    doc.save(`corte_caja_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`);
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-96"><Loader2 className="h-12 w-12 animate-spin text-brand-blue" /></div>;
    }
    if (!shiftData) {
      return (
         <div className="flex flex-col justify-center items-center h-96 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
            <p className="font-semibold text-lg">No se pudo cargar la información del turno.</p>
            <p className="text-sm text-gray-500">Asegúrate de haber iniciado el día con un fondo de caja.</p>
        </div>
      );
    }
    const difference = (parseFloat(finalCash) || 0) - shiftData.expectedCash;
    return (
      <ScrollArea className="h-[70vh]">
        <div className="space-y-4 pr-6">
            <div className="p-4 bg-slate-100 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Resumen del Turno</h3>
                <p className="text-xs text-gray-500">Desde: {format(shiftData.startTime, "PPP p", { locale: es })}</p>
            </div>

            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Resumen Financiero</h4>
                <StatItem icon={TrendingUp} label="Fondo Inicial" value={`$${shiftData.initialFund.toFixed(2)}`} />
                <StatItem icon={DollarSign} label="Ventas en Efectivo" value={`+ $${shiftData.salesByMethod.cash.toFixed(2)}`} colorClass="text-green-600" valueColorClass="text-green-700" />
                <StatItem icon={DollarSign} label="Fondos Agregados" value={`+ $${shiftData.fundsAdded.toFixed(2)}`} colorClass="text-green-600" valueColorClass="text-green-700" />
                <StatItem icon={TrendingDown} label="Retiros de Caja" value={`- $${shiftData.withdrawals.toFixed(2)}`} colorClass="text-red-600" valueColorClass="text-red-700" />
                <StatItem icon={TrendingDown} label="Gastos Registrados" value={`- $${shiftData.totalExpenses.toFixed(2)}`} colorClass="text-red-600" valueColorClass="text-red-700" />
                <div className="flex justify-between items-center py-2 mt-2 border-t-2">
                    <span className="text-md font-bold">Total Esperado en Caja</span>
                    <span className="text-md font-bold">${shiftData.expectedCash.toFixed(2)}</span>
                </div>
            </div>

            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Resumen de Operaciones</h4>
                <StatItem icon={TrendingUp} label="Ventas Totales (Global)" value={`$${shiftData.totalSales.toFixed(2)}`} />
                <StatItem icon={TrendingUp} label="Utilidad Bruta" value={`$${shiftData.totalProfit.toFixed(2)}`} />
                <StatItem icon={ShoppingBag} label="Tickets Generados" value={shiftData.totalTickets} />
                <StatItem icon={CreditCard} label="Ventas con Tarjeta" value={`$${shiftData.salesByMethod.card.toFixed(2)}`} />
                <StatItem icon={FileText} label="Otros Métodos de Pago" value={`$${(shiftData.salesByMethod.dollars + shiftData.salesByMethod.transfer + shiftData.salesByMethod.mercadopago + shiftData.salesByMethod.other).toFixed(2)}`} />
            </div>

            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Top 5 Productos Vendidos</h4>
                <ul className="text-sm space-y-1">
                    {shiftData.topProducts.map(p => <li key={p.name} className="flex justify-between"><span>{p.name}</span> <span className="font-medium">{p.count} uds.</span></li>)}
                </ul>
            </div>

            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Conteo Final</h4>
                <div>
                    <Label htmlFor="final-cash">Dinero Real en Caja</Label>
                    <Input id="final-cash" type="number" placeholder="Ingresa el monto contado" value={finalCash} onChange={e => setFinalCash(e.target.value)} />
                </div>
                <div className="flex justify-between items-center mt-2">
                    <span className="text-sm font-bold">Diferencia</span>
                    <span className={`text-sm font-bold ${difference === 0 ? '' : difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {difference.toFixed(2)}
                    </span>
                </div>
            </div>

            <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Observaciones</h4>
                <Textarea placeholder="Anota cualquier incidencia o comentario relevante del turno..." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
        </div>
      </ScrollArea>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Realizar Corte de Caja</DialogTitle>
          <DialogDescription>
            Revisa el resumen del turno, ingresa el monto final y confirma para cerrar la sesión.
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
        <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button variant="outline" onClick={handlePrint} disabled={isLoading || !shiftData}>
                <Printer className="mr-2 h-4 w-4" /> Exportar PDF
            </Button>
            <Button variant="destructive" onClick={handlePerformCut} disabled={isLoading || !shiftData || !finalCash}>
              Confirmar y Guardar Corte
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CashCutModal;
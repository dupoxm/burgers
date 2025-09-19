import React, { useEffect, useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { ScrollArea } from "@/components/ui/scroll-area";
import { startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import KeyMetrics from '@/components/dashboard/KeyMetrics';
import SalesCharts from '@/components/dashboard/SalesCharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import ProductPerformance from '@/components/dashboard/ProductPerformance';
import ExpensesCard from '@/components/dashboard/ExpensesCard';

const TopProductsCard = ({ data }) => (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
        <Card className="lg:col-span-1 shadow-xl border-t-4 border-brand-yellow bg-yellow-50/30">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-yellow-700 flex items-center">
                    <TrendingUp size={20} className="mr-2" /> Productos Más Vendidos (Rango)
                </CardTitle>
            </CardHeader>
            <CardContent>
                {data.length > 0 ? (
                    <ul className="space-y-2">
                        {data.map(p => (
                            <li key={p.name} className="flex justify-between items-center text-sm p-2 rounded-md bg-white hover:bg-yellow-50 transition-colors">
                                <span className="text-gray-700">{p.name}</span>
                                <span className="font-semibold text-yellow-600">{p.count} uds.</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500">No hay datos de ventas suficientes para este rango.</p>
                )}
            </CardContent>
        </Card>
    </motion.div>
);

const RecentOrdersCard = ({ data }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="lg:col-span-2 shadow-xl border-t-4 border-brand-blue bg-blue-50/30">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-blue-700 flex items-center">
                    <Clock size={20} className="mr-2" /> Órdenes Recientes (Rango)
                </CardTitle>
            </CardHeader>
            <CardContent>
                {data.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-blue-100">
                                <tr>
                                    <th className="p-2 text-left text-blue-800 font-semibold">Ticket ID</th>
                                    <th className="p-2 text-left text-blue-800 font-semibold">Total</th>
                                    <th className="p-2 text-left text-blue-800 font-semibold">Método Pago</th>
                                    <th className="p-2 text-left text-blue-800 font-semibold">Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map(ticket => (
                                    <tr key={ticket.id} className="border-b border-blue-200 hover:bg-blue-50 transition-colors">
                                        <td className="p-2 text-gray-700">#{ticket.id.toString().substring(0, 6)}...</td>
                                        <td className="p-2 font-medium text-green-600">${ticket.total_amount.toFixed(2)}</td>
                                        <td className="p-2 text-gray-600">{ticket.payment_method}</td>
                                        <td className="p-2 text-gray-500 text-xs">{new Date(ticket.order_timestamp || ticket.created_at).toLocaleString('es-MX')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">No hay órdenes recientes para este rango.</p>
                )}
            </CardContent>
        </Card>
    </motion.div>
);

const LowStockCard = ({ data }) => (
    data.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="mt-6 md:mt-8 shadow-xl border-t-4 border-red-500 bg-red-50/50">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-red-700 flex items-center">
                        <AlertTriangle size={20} className="mr-2" /> Alertas de Inventario Bajo
                    </CardTitle>
                    <CardDescription className="text-red-600">
                        Los siguientes ingredientes necesitan reposición urgente.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {data.map(ing => (
                            <li key={ing.id} className="flex justify-between items-center text-sm p-2 rounded-md bg-white hover:bg-red-50 transition-colors">
                                <span className="text-gray-800">{ing.name} ({ing.emoji})</span>
                                <span className="font-bold text-red-600">{ing.stock_quantity} {ing.unit} restantes</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </motion.div>
    )
);


const DashboardPage = ({ openAddFundModal, openCashCutModal }) => {
    const {
        completedTickets,
        ingredients,
        products,
        cashFund,
        isLoading: contextIsLoading,
        fetchCompletedTickets,
        supabase
    } = useAppContext();

    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState({ from: startOfDay(new Date()), to: endOfDay(new Date()) });
    const [activeDatePreset, setActiveDatePreset] = useState('today');
    const [expenses, setExpenses] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const fetchTicketsPromise = fetchCompletedTickets(dateRange);
            
            const fetchExpensesPromise = supabase
                .from('cash_transactions')
                .select('*')
                .eq('transaction_type', 'expense')
                .gte('created_at', startOfDay(dateRange.from).toISOString())
                .lte('created_at', endOfDay(dateRange.to).toISOString());

            const [ticketsResult, { data: expensesData, error: expensesError }] = await Promise.all([
                fetchTicketsPromise,
                fetchExpensesPromise
            ]);

            if (expensesError) {
                console.error("Error fetching expenses", expensesError);
            } else {
                setExpenses(expensesData || []);
            }

            setIsLoading(false);
        };
        fetchData();
    }, [dateRange, fetchCompletedTickets, supabase]);

    const handleSetDateRange = (preset) => {
        setActiveDatePreset(preset);
        let fromDate, toDate;
        const today = new Date();
        if (preset === 'today') {
            fromDate = startOfDay(today);
            toDate = endOfDay(today);
        } else if (preset === 'week') {
            fromDate = startOfWeek(today, { locale: es });
            toDate = endOfWeek(today, { locale: es });
        }
        setDateRange({ from: fromDate, to: toDate });
    };

    const handleCustomDateChange = (range) => {
        if (range?.from) {
            setDateRange({ from: startOfDay(range.from), to: range.to ? endOfDay(range.to) : endOfDay(range.from) });
            setActiveDatePreset('custom');
        }
    };

    const dashboardData = useMemo(() => {
        const productMap = new Map(products.map(p => [p.id, p]));
        
        const filteredTickets = completedTickets; 
        let sales = 0;
        let cashSales = 0;
        let cardSales = 0;
        const productCounts = {};
        const salesData = {};

        filteredTickets.forEach(ticket => {
            sales += ticket.total_amount;
            if (ticket.payment_method?.toLowerCase() === 'efectivo') {
                cashSales += ticket.total_amount;
            } else if (ticket.payment_method?.toLowerCase() === 'tarjeta') {
                cardSales += ticket.total_amount;
            }

            ticket.items.forEach(item => {
                const productInfo = productMap.get(item.productId) || { category: 'unknown', name: item.name };
                
                productCounts[item.name] = (productCounts[item.name] || 0) + item.quantity;
                
                if (!salesData[item.productId]) {
                    salesData[item.productId] = {
                        id: item.productId,
                        name: item.name,
                        category: productInfo.category,
                        quantity: 0,
                        revenue: 0,
                        cost: 0,
                        profit: 0,
                    };
                }
                const costPerUnit = item.costAtPurchase || productInfo.cost_per_unit || 0;
                const itemRevenue = item.priceAtPurchase * item.quantity;
                const itemCost = costPerUnit * item.quantity;

                salesData[item.productId].quantity += item.quantity;
                salesData[item.productId].revenue += itemRevenue;
                salesData[item.productId].cost += itemCost;
                salesData[item.productId].profit += (itemRevenue - itemCost);
            });
        });

        const topProductsArray = Object.entries(productCounts).sort(([, a], [, b]) => b - a).slice(0, 5).map(([name, count]) => ({ name, count }));
        const lowStock = ingredients.filter(ing => ing.stock_quantity !== null && ing.low_stock_threshold !== null && ing.stock_quantity <= ing.low_stock_threshold);
        
        const netCashAfterFundCalc = cashFund.amount ? cashFund.amount + cashSales : cashSales;

        return {
            totalSalesInRange: sales,
            totalOrdersInRange: filteredTickets.length,
            averageOrderValueInRange: filteredTickets.length > 0 ? sales / filteredTickets.length : 0,
            salesByCashInRange: cashSales,
            salesByCardInRange: cardSales,
            topProductsInRange: topProductsArray,
            lowStockIngredients: lowStock,
            recentOrdersInRange: filteredTickets.slice(0, 5),
            totalProducts: products.length,
            totalIngredients: ingredients.length,
            netCashAfterFund: netCashAfterFundCalc,
            salesChartData: salesData,
            expensesInRange: expenses,
        };
    }, [completedTickets, ingredients, products, cashFund, expenses]);

    if (contextIsLoading) {
        return (
            <div className="p-6 flex-1 flex flex-col justify-center items-center bg-gradient-to-br from-slate-50 to-gray-100 h-screen">
                <Loader2 className="h-16 w-16 animate-spin text-brand-blue" />
                <p className="text-xl font-semibold text-brand-blue">Cargando tablero...</p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-screen flex-1">
            <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-gray-100">
                <DashboardHeader
                    dateRange={dateRange}
                    handleSetDateRange={handleSetDateRange}
                    handleCustomDateChange={handleCustomDateChange}
                    activeDatePreset={activeDatePreset}
                    onAddFund={openAddFundModal}
                    onCashCut={openCashCutModal}
                />
                
                {isLoading ? (
                    <div className="text-center p-10">
                        <Loader2 className="h-8 w-8 animate-spin text-brand-blue mx-auto" />
                        <p>Cargando datos del rango...</p>
                    </div>
                ) : (
                    <>
                        <KeyMetrics data={dashboardData} activeDatePreset={activeDatePreset} dateRange={dateRange} />
                        
                        <SalesCharts salesData={dashboardData.salesChartData} />
                        
                        <ProductPerformance salesData={dashboardData.salesChartData} />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8">
                            <TopProductsCard data={dashboardData.topProductsInRange} />
                            <RecentOrdersCard data={dashboardData.recentOrdersInRange} />
                        </div>

                        <div className="mt-6 md:mt-8">
                            <ExpensesCard expenses={dashboardData.expensesInRange} />
                        </div>
                        
                        <LowStockCard data={dashboardData.lowStockIngredients} />
                    </>
                )}
            </div>
        </ScrollArea>
    );
};

export default DashboardPage;
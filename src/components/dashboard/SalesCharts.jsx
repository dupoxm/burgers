import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { CATEGORIES } from '@/data';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-bold text-gray-800 dark:text-gray-200">{label}</p>
        <p className="text-sm text-green-600">Ingresos: ${data.revenue.toFixed(2)}</p>
        <p className="text-sm text-red-600">Costo Total: ${data.cost.toFixed(2)}</p>
        <p className="text-sm text-blue-600">Utilidad: ${data.profit.toFixed(2)}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">Unidades Vendidas: {data.quantity}</p>
      </div>
    );
  }
  return null;
};

const SalesCharts = ({ salesData }) => {
  const [metric, setMetric] = useState('profit');

  const chartDataByCategory = useMemo(() => {
    const grouped = {};
    CATEGORIES.forEach(cat => {
      grouped[cat.dbValue] = {
        name: cat.name,
        emoji: cat.emoji,
        products: [],
        totalProfit: 0,
        totalRevenue: 0,
      };
    });

    Object.values(salesData).forEach(productData => {
      if (grouped[productData.category]) {
        grouped[productData.category].products.push(productData);
        grouped[productData.category].totalProfit += productData.profit;
        grouped[productData.category].totalRevenue += productData.revenue;
      }
    });

    Object.keys(grouped).forEach(cat => {
        grouped[cat].products.sort((a,b) => b[metric] - a[metric]);
    });

    return Object.values(grouped).filter(cat => cat.products.length > 0);
  }, [salesData, metric]);

  const barColors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  
  return (
    <motion.div 
      className="mt-6 md:mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="shadow-xl border-t-4 border-brand-purple bg-purple-50/30">
        <CardHeader className="flex-row justify-between items-center">
          <div>
            <CardTitle className="text-lg font-semibold text-purple-700 flex items-center">
              <TrendingUp size={20} className="mr-2" />
              Análisis de Ventas por Producto
            </CardTitle>
            <CardDescription className="text-purple-600">
              Desglose de rendimiento por categoría y producto en el rango seleccionado.
            </CardDescription>
          </div>
          <div className="w-48">
            <Select value={metric} onValueChange={setMetric}>
                <SelectTrigger>
                    <SelectValue placeholder="Ver por..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="profit">Utilidad</SelectItem>
                    <SelectItem value="quantity">Cantidad Vendida</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={chartDataByCategory[0]?.name}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              {chartDataByCategory.map(cat => (
                <TabsTrigger key={cat.name} value={cat.name}>{cat.emoji} {cat.name}</TabsTrigger>
              ))}
            </TabsList>

            {chartDataByCategory.map((cat, catIndex) => {
              const categoryMargin = cat.totalRevenue > 0 ? (cat.totalProfit / cat.totalRevenue) * 100 : 0;
              return (
                <TabsContent key={cat.name} value={cat.name}>
                  {cat.products.length > 0 ? (
                    <div className='mt-4'>
                      <div className="h-80 w-full">
                         <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={cat.products} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3}/>
                              <XAxis dataKey="name" angle={-15} textAnchor="end" height={50} interval={0} fontSize={12} />
                              <YAxis allowDecimals={false} tickFormatter={(value) => metric === 'profit' ? `$${value}`: value} />
                              <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(233, 213, 255, 0.2)'}} />
                              <Bar dataKey={metric} name={metric === 'profit' ? 'Utilidad' : 'Cantidad'}>
                                {cat.products.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                                ))}
                              </Bar>
                           </BarChart>
                         </ResponsiveContainer>
                      </div>
                      <div className="mt-4 p-4 bg-white/50 dark:bg-gray-800/20 rounded-lg flex justify-around text-center">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Utilidad Total (Categoría)</p>
                            <p className="text-xl font-bold text-green-600">${cat.totalProfit.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Margen Promedio</p>
                            <p className={`text-xl font-bold ${categoryMargin < 0 ? 'text-red-500' : 'text-blue-600'}`}>{categoryMargin.toFixed(1)}%</p>
                          </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <AlertTriangle size={48} className="mx-auto text-yellow-500" />
                      <p className="mt-2 text-gray-600">No hay datos de ventas para esta categoría en el rango seleccionado.</p>
                    </div>
                  )}
                </TabsContent>
              )
            })}
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SalesCharts;
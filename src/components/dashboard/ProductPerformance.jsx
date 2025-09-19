
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, Percent, Package, DollarSign, AlertTriangle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

const ProductPerformanceCard = ({ product }) => {
  const { name, category, quantity, revenue, profit } = product;
  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

  return (
    <motion.div variants={itemVariants}>
      <Card className="h-full flex flex-col justify-between bg-white/60 dark:bg-gray-800/40 hover:shadow-lg transition-shadow duration-200 border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-200 truncate">{name}</CardTitle>
          <CardDescription className="text-xs capitalize text-gray-500 dark:text-gray-400">{category}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-end text-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300 flex items-center"><Package size={14} className="mr-1.5" /> Vendidos:</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{quantity}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300 flex items-center"><DollarSign size={14} className="mr-1.5" /> Ingresos:</span>
            <span className="font-bold text-green-600 dark:text-green-400">${revenue.toFixed(2)}</span>
          </div>
           <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300 flex items-center"><TrendingUp size={14} className="mr-1.5" /> Utilidad:</span>
            <span className={`font-bold ${profit >= 0 ? 'text-cyan-600 dark:text-cyan-400' : 'text-red-500 dark:text-red-400'}`}>${profit.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-gray-200 dark:border-gray-700/50">
            <span className="text-gray-600 dark:text-gray-300 flex items-center"><Percent size={14} className="mr-1.5" /> Margen:</span>
            <span className={`font-bold ${profitMargin >= 0 ? 'text-purple-600 dark:text-purple-400' : 'text-red-500 dark:text-red-400'}`}>{profitMargin.toFixed(1)}%</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ProductPerformance = ({ salesData }) => {
  const productsArray = Object.values(salesData || {}).sort((a,b) => b.revenue - a.revenue);

  if (!productsArray || productsArray.length === 0) {
    return (
        <Card className="mt-6 md:mt-8 text-center py-10 bg-yellow-50/50 border-yellow-400 border-dashed">
            <CardHeader>
                <CardTitle className="text-yellow-700 flex items-center justify-center">
                    <AlertTriangle size={24} className="mr-2" />
                    Sin Datos de Rendimiento
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-yellow-600">No hay ventas registradas en este rango para mostrar el rendimiento de los productos.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <motion.div 
      className="mt-6 md:mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Rendimiento de Productos</h2>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {productsArray.map(product => (
          <ProductPerformanceCard key={product.id} product={product} />
        ))}
      </motion.div>
    </motion.div>
  );
};

export default ProductPerformance;

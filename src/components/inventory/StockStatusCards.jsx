
import React from 'react';
    import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
    import { AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
    import { motion } from 'framer-motion';

    const StockStatusCard = ({ icon, title, count, description, colorClass, onClick }) => (
      <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
        onClick={onClick}
        className={onClick && count > 0 ? "cursor-pointer" : "cursor-default"}
      >
        <Card className={`overflow-hidden border-2 ${colorClass}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{count}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </CardContent>
        </Card>
      </motion.div>
    );

    const StockStatusCards = ({ products, ingredients, onCardClick }) => {
      const allItems = [...products.filter(p => ['drinks', 'sides'].includes(p.category)), ...ingredients];

      const lowStockItems = allItems.filter(item => item.stock_quantity > 0 && item.stock_quantity <= item.low_stock_threshold);
      const outOfStockItems = allItems.filter(item => item.stock_quantity !== null && item.stock_quantity <= 0);
      const availableItemsCount = allItems.length - lowStockItems.length - outOfStockItems.length;

      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <StockStatusCard
            icon={<AlertTriangle className="h-5 w-5 text-yellow-500" />}
            title="Stock Bajo"
            count={lowStockItems.length}
            description="Productos a punto de agotarse"
            colorClass="border-yellow-500 bg-yellow-500/10"
            onClick={() => onCardClick('Stock Bajo', lowStockItems)}
          />
          <StockStatusCard
            icon={<XCircle className="h-5 w-5 text-red-500" />}
            title="Agotados"
            count={outOfStockItems.length}
            description="Productos sin existencias"
            colorClass="border-red-500 bg-red-500/10"
            onClick={() => onCardClick('Agotados', outOfStockItems)}
          />
          <StockStatusCard
            icon={<CheckCircle className="h-5 w-5 text-green-500" />}
            title="Stock Disponible"
            count={availableItemsCount}
            description="Productos con inventario saludable"
            colorClass="border-green-500 bg-green-500/10"
          />
        </div>
      );
    };

    export default StockStatusCards;
  
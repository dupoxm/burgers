import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PlusCircle, Edit2, Plus, ShoppingBag } from 'lucide-react';
import { CATEGORIES } from '@/data';

const DesktopProductCard = ({ product, onAddToCart, onEditProduct, onMakeCombo }) => {
  const [makeCombo, setMakeCombo] = React.useState(false);
  const price = makeCombo && product.combo_available && product.combo_price ? product.price + product.combo_price : product.price;

  const handleComboChange = (checked) => {
    setMakeCombo(checked);
    if (checked && product.combo_available && product.combo_price) {
      onMakeCombo(product);
    }
  };

  const handleAddToCart = () => {
    if (makeCombo && product.combo_available && product.combo_price) {
      onMakeCombo(product);
    } else {
      onAddToCart(product, false);
    }
    setMakeCombo(false);
  };

  if (!product.is_available) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="hidden md:flex" 
    >
      <Card className="w-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white rounded-xl relative flex flex-col">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 h-8 w-8 text-gray-400 hover:text-brand-blue z-10"
          onClick={() => onEditProduct(product)}
        >
          <Edit2 size={16} />
        </Button>
        <div className="flex-grow flex flex-col">
          <CardHeader className="p-4 md:p-5">
            <div className="flex justify-between items-start">
              <CardTitle className="text-md md:text-lg font-bold text-brand-blue pr-8">{product.name}</CardTitle>
              <span className="text-xl md:text-2xl">{product.emoji}</span>
            </div>
            <CardDescription className="text-xs md:text-sm text-gray-600 h-12 overflow-hidden">
              {product.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-5 pt-0 flex-grow">
            <p className="text-xl md:text-2xl font-extrabold text-brand-blue mb-3">${price.toFixed(2)}</p>
            {product.combo_available && product.combo_price && (
              <div className="flex items-center space-x-2 mb-3">
                <Switch id={`combo-${product.id}-desktop`} checked={makeCombo} onCheckedChange={handleComboChange} />
                <Label htmlFor={`combo-${product.id}-desktop`} className="text-sm md:text-base text-gray-700">Hacer Combo (+${product.combo_price.toFixed(2)})</Label>
              </div>
            )}
          </CardContent>
        </div>
        <CardFooter className="p-4 md:p-5 bg-gray-50 mt-auto">
          <Button 
            onClick={handleAddToCart} 
            className="w-full bg-brand-green hover:bg-brand-green/90 text-white font-semibold py-2.5 md:py-3 text-sm md:text-base"
            disabled={!product.is_available}
          >
            <PlusCircle size={20} className="mr-2" /> Añadir
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const MobileProductCard = ({ product, onAddToCart, onEditProduct, onMakeCombo }) => {
  const [makeCombo, setMakeCombo] = React.useState(false);
  const price = makeCombo && product.combo_available && product.combo_price ? product.price + product.combo_price : product.price;

  const handleComboToggle = () => {
    const newComboState = !makeCombo;
    setMakeCombo(newComboState);
    if (newComboState && product.combo_available && product.combo_price) {
      onMakeCombo(product);
    }
  };

  const handleAddToCart = () => {
    if (makeCombo && product.combo_available && product.combo_price) {
      onMakeCombo(product);
    } else {
      onAddToCart(product, false);
    }
    setMakeCombo(false);
  };

  if (!product.is_available) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="md:hidden bg-white p-4 rounded-2xl shadow-md mb-3"
    >
      <div className="flex">
        <div className="flex-grow">
          <h3 className="text-lg font-bold text-gray-800 mb-0.5">
            {product.emoji} {product.name}
          </h3>
          <p className="text-xs text-gray-500 mb-2 h-10 overflow-hidden">{product.description}</p>
          <p className="text-xl font-bold text-green-600">${price.toFixed(2)}</p>
        </div>
        <div className="flex flex-col items-center justify-between ml-3 shrink-0 w-[70px] space-y-2">
          <Button
            size="icon"
            className="bg-green-500 hover:bg-green-600 text-white rounded-lg h-10 w-10"
            onClick={handleAddToCart}
          >
            <Plus size={24} />
          </Button>
          {product.combo_available && product.combo_price && (
            <Button
              variant={makeCombo ? "default" : "outline"}
              size="sm"
              className={`w-full h-auto py-1 px-1.5 text-xs rounded-full transition-colors
                          ${makeCombo ? 'bg-brand-yellow text-brand-red-dark border-brand-yellow' 
                                     : 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100'}`}
              onClick={handleComboToggle}
            >
              <ShoppingBag size={12} className="mr-1" /> Combo
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const ProductDisplay = ({ products, selectedCategory, onAddToCart, onEditProduct, onMakeCombo }) => {
  const activeCategories = CATEGORIES.filter(cat => cat.id !== 'combos');
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={selectedCategory}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="mt-4 md:mt-6"
      >
        {activeCategories.map(category => (
          <TabsContent key={category.id} value={category.id} forceMount={selectedCategory === category.id}>
             {selectedCategory === category.id && (
                <>
                  <motion.div 
                    layout="position" 
                    className="hidden md:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                  >
                    <AnimatePresence>
                      {products.length > 0 ? (
                        products.map(product => (
                          <DesktopProductCard 
                            key={`${product.id}-desktop`}
                            product={product} 
                            onAddToCart={onAddToCart} 
                            onEditProduct={onEditProduct}
                            onMakeCombo={onMakeCombo}
                          />
                        ))
                      ) : (
                        <p className="col-span-full text-center text-gray-500 py-10 text-base md:text-lg">No hay productos disponibles en esta categoría o que coincidan con tu búsqueda.</p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div className="md:hidden space-y-3">
                    <AnimatePresence>
                      {products.length > 0 ? (
                        products.map(product => (
                          <MobileProductCard
                            key={`${product.id}-mobile`}
                            product={product}
                            onAddToCart={onAddToCart}
                            onEditProduct={onEditProduct} 
                            onMakeCombo={onMakeCombo}
                          />
                        ))
                      ) : (
                         <p className="text-center text-gray-500 py-10 text-base">No hay productos disponibles.</p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </>
             )}
          </TabsContent>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductDisplay;
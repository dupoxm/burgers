import React from 'react';
    export const CATEGORIES = [
      { id: 'burgers', name: 'Hamburguesas', emoji: '🍔', dbValue: 'burgers' },
      { id: 'hotdogs', name: 'Hot Dogs', emoji: '🌭', dbValue: 'hotdogs' },
      { id: 'sides', name: 'Acompañamientos', emoji: '🍟', dbValue: 'sides' },
      { id: 'drinks', name: 'Bebidas', emoji: '🥤', dbValue: 'drinks' },
    ];

    export const INGREDIENT_CATEGORIES = [
      { id: 'meats', name: 'Carnes y Proteínas' },
      { id: 'bakery', name: 'Panadería' },
      { id: 'dairy', name: 'Lácteos' },
      { id: 'vegetables', name: 'Vegetales' },
      { id: 'sauces', name: 'Salsas y Aderezos' },
      { id: 'general', name: 'General' },
      { id: 'drinks', name: 'Bebidas (Insumo)' },
    ];

    export const INITIAL_PRODUCTS_FRONTEND = [
      { id: 'prod_1', name: 'BigBurger', emoji: '👑', description: 'Carne doble en BBQ o búfalo, tocino, aros de cebolla, cebolla caramelizada, quesos, jamón, 2 salchichas, champiñones.', price: 150, category: 'burgers', combo_available: true, combo_price: 50, is_available: true },
      { id: 'prod_2', name: 'Cheese Burger', emoji: '🍔', description: 'Carne de res y queso amarillo.', price: 80, category: 'burgers', combo_available: true, combo_price: 50, is_available: true },
      { id: 'prod_3', name: 'Clásica', emoji: '🍔', description: 'Carne de res, queso amarillo, lechuga, tomate y cebolla.', price: 90, category: 'burgers', combo_available: true, combo_price: 50, is_available: true },
      { id: 'prod_4', name: 'Hawaiana', emoji: '🍍', description: 'Carne de res, queso blanco, jamón, piña, lechuga, tomate y cebolla.', price: 110, category: 'burgers', combo_available: true, combo_price: 50, is_available: true },
      { id: 'prod_5', name: 'Ranchera', emoji: '🐮', description: 'Carne de res en salsa BBQ, tocino, queso blanco, aros de cebolla, pepinillos, lechuga, tomate, cebolla y aderezo de la casa.', price: 110, category: 'burgers', combo_available: true, combo_price: 50, is_available: true },
      { id: 'prod_6', name: 'Hot Dog', emoji: '🌭', description: 'Salchicha clásica con pan suave.', price: 38, category: 'hotdogs', combo_available: true, combo_price: 50, is_available: true },
      { id: 'prod_7', name: 'Aros de cebolla', emoji: '🧅', description: 'Crujientes aros de cebolla empanizados.', price: 75, category: 'sides', is_available: true },
      { id: 'prod_8', name: 'Máxima Tentación', emoji: '✨', description: 'Papas fritas con queso cheddar, tocino y jalapeños.', price: 140, category: 'sides', is_available: true },
      { id: 'prod_9', name: 'Papas fritas', emoji: '🍟', description: 'Papas fritas clásicas, crujientes por fuera, suaves por dentro.', price: 80, category: 'sides', is_available: true },
      { id: 'prod_10', name: 'Salchipapas', emoji: '🍟', description: 'Papas fritas con trozos de salchicha.', price: 95, category: 'sides', is_available: true },
      { id: 'prod_11', name: 'Refrescos', emoji: '🥤', description: 'Coca-Cola, Pepsi, Sprite, etc.', price: 30, category: 'drinks', is_available: true },
    ];

    export const INITIAL_INGREDIENTS_FRONTEND = [
      { id: 'ing_1_static', name: 'Carne de res', emoji: '🥩', unit: 'gr', stock_quantity: 5000, low_stock_threshold: 500, cost_per_unit: 0.2, category: 'meats' },
      { id: 'ing_2_static', name: 'Pan de hamburguesa', emoji: '🍞', unit: 'pza', stock_quantity: 100, low_stock_threshold: 10, cost_per_unit: 5, category: 'bakery' },
      { id: 'ing_3_static', name: 'Queso amarillo', emoji: '🧀', unit: 'reb', stock_quantity: 200, low_stock_threshold: 20, cost_per_unit: 2, category: 'dairy' },
      { id: 'ing_4_static', name: 'Papas', emoji: '🥔', unit: 'kg', stock_quantity: 20, low_stock_threshold: 2, cost_per_unit: 30, category: 'vegetables' },
      { id: 'ing_5_static', name: 'Salchicha', emoji: '🌭', unit: 'pza', stock_quantity: 150, low_stock_threshold: 15, cost_per_unit: 7, category: 'meats' },
    ];

    export const PAYMENT_METHODS = [
      { id: 'cash', name: 'Efectivo' },
      { id: 'card', name: 'Tarjeta' },
      { id: 'transfer', name: 'Transferencia' },
      { id: 'mercadopago', name: 'Mercado Pago' },
      { id: 'dollars', name: 'Dólares' },
    ];

    export const EXTRA_INGREDIENTS = [
      { id: 'extra_1', name: 'Queso extra', emoji: '🧀', price: 15, ingredient_id_link: null },
      { id: 'extra_2', name: 'Tocino', emoji: '🥓', price: 20, ingredient_id_link: null },
      { id: 'extra_3', name: 'Aguacate', emoji: '🥑', price: 25, ingredient_id_link: null },
      { id: 'extra_4', name: 'Jalapeños', emoji: '🌶️', price: 10, ingredient_id_link: null },
    ];
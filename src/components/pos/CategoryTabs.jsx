import React from 'react';
    import { TabsList, TabsTrigger } from '@/components/ui/tabs';
    import { CATEGORIES } from '@/data';
    import { motion } from 'framer-motion';
    import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
    import { cn } from '@/lib/utils';

    const CategoryTabs = ({ selectedCategory, onSelectCategory, categories }) => {
      const activeCategories = categories || CATEGORIES.filter(c => c.id !== 'combos');
      
      return (
        <div className="w-full md:pb-0">
          {/* Mobile: Uses ScrollArea with horizontal scrollbar */}
          <ScrollArea className="w-full whitespace-nowrap md:hidden">
            <TabsList className="flex flex-row justify-start h-auto p-1.5 bg-transparent space-x-2 overflow-x-auto">
              {activeCategories.map((category) => (
                <TabsTrigger
                  key={`${category.id}-mobile`}
                  value={category.id} 
                  onClick={() => onSelectCategory(category.id)} 
                  className={cn(`relative shrink-0 px-4 py-2.5 text-sm font-semibold transition-all duration-200 ease-in-out rounded-full
                              focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-background
                              data-[state=active]:text-brand-red-dark data-[state=active]:bg-brand-yellow data-[state=active]:shadow-md 
                              data-[state=inactive]:bg-white data-[state=inactive]:text-gray-700 data-[state=inactive]:border data-[state=inactive]:border-gray-300
                              hover:bg-brand-yellow/50 hover:text-brand-red-dark
                              `)}
                >
                  <span className="relative z-10 flex items-center justify-center w-full">
                    <span className="text-base mr-1.5">{category.emoji.split(' ')[0]}</span>
                    <span className="ml-0">{category.name.split(' ')[0]}</span>
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" className="md:hidden" />
          </ScrollArea>

          {/* Desktop/Tablet: Uses ScrollArea with horizontal scrollbar for md screens */}
          <ScrollArea className="hidden md:block w-full whitespace-nowrap">
            <TabsList className="flex flex-row justify-start h-auto p-1.5 bg-brand-blue/5 rounded-lg space-x-2 overflow-x-auto">
              {activeCategories.map((category) => (
                <TabsTrigger
                  key={`${category.id}-desktop`}
                  value={category.id} 
                  onClick={() => onSelectCategory(category.id)} 
                  className={cn(`relative shrink-0 px-4 py-2.5 text-sm font-semibold transition-all duration-200 ease-in-out rounded-md
                              focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-background
                              data-[state=active]:text-brand-white-modern data-[state=active]:shadow-md 
                              data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-600 data-[state=inactive]:border-none
                              hover:bg-brand-yellow/20 hover:text-brand-yellow-darker
                              `)}
                >
                  {selectedCategory === category.id && ( 
                    <motion.div
                      layoutId="activeCategoryIndicatorDesktop"
                      className="absolute inset-0 bg-gradient-to-r from-brand-red-light to-brand-red-medium rounded-md z-0"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center w-full">
                    <span className="text-sm mr-1.5">{category.emoji.split(' ')[0]}</span>
                    <span className="ml-0">{category.name}</span>
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      );
    };

    export default CategoryTabs;
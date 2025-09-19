
import React, { useState, useEffect } from 'react';
    import { Input } from '@/components/ui/input';
    import { cn } from '@/lib/utils';

    export const EditableCell = ({ value, onSave, type = 'number', className = '' }) => {
      const [isEditing, setIsEditing] = useState(false);
      const [currentValue, setCurrentValue] = useState(value);
      const inputRef = React.useRef(null);

      useEffect(() => {
        setCurrentValue(value);
      }, [value]);

      useEffect(() => {
        if (isEditing) {
          inputRef.current?.focus();
          inputRef.current?.select();
        }
      }, [isEditing]);

      const handleSave = () => {
        if (currentValue !== value) {
          onSave(currentValue);
        }
        setIsEditing(false);
      };

      const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') {
          setCurrentValue(value);
          setIsEditing(false);
        }
      };

      return (
        <div onClick={() => setIsEditing(true)} className={cn("cursor-pointer px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 min-h-[32px] flex items-center justify-end", className)}>
          {isEditing ? (
            <Input
              ref={inputRef}
              type={type}
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="h-8 w-24 text-right"
            />
          ) : (
            <span>{type === 'number' ? `${parseFloat(value || 0).toFixed(2)}` : value}</span>
          )}
        </div>
      );
    };

    export const EditableStockCell = ({ value, onSave, className = '' }) => {
      const [isEditing, setIsEditing] = useState(false);
      const [currentValue, setCurrentValue] = useState(value);
      const inputRef = React.useRef(null);

      useEffect(() => {
        setCurrentValue(value);
      }, [value]);
      
      useEffect(() => {
        if (isEditing) {
          inputRef.current?.focus();
          inputRef.current?.select();
        }
      }, [isEditing]);

      const handleSave = () => {
        if (currentValue !== value) {
          onSave(currentValue);
        }
        setIsEditing(false);
      };
      
      const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') {
          setCurrentValue(value);
          setIsEditing(false);
        }
      };

      return (
        <div onClick={() => setIsEditing(true)} className={cn("cursor-pointer px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 min-h-[32px] flex items-center justify-center", className)}>
          {isEditing ? (
            <Input
              ref={inputRef}
              type="number"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="h-8 w-20 text-center"
            />
          ) : (
            <span>{value}</span>
          )}
        </div>
      );
    };
  
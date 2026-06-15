'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommandItem {
  id: string;
  label: string;
  icon: string;
  hint?: string;
  action: () => void;
}

interface CommandPaletteProps {
  items: CommandItem[];
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({
  items,
  isOpen,
  onClose,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      // Focus input after animation
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Global Cmd+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle is handled by parent
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filtered[activeIndex]) {
            filtered[activeIndex].action();
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    },
    [filtered, activeIndex, onClose]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="command-palette-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            className="command-palette"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          >
            {/* Search Input */}
            <div className="command-palette__input-wrapper">
              <input
                ref={inputRef}
                className="command-palette__input"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search commands..."
              />
            </div>

            {/* Results */}
            <div className="command-palette__results">
              {filtered.length === 0 ? (
                <div className="command-palette__empty">
                  No results found for &ldquo;{query}&rdquo;
                </div>
              ) : (
                filtered.map((item, index) => (
                  <div
                    key={item.id}
                    className={`command-palette__item ${
                      index === activeIndex
                        ? 'command-palette__item--active'
                        : ''
                    }`}
                    onClick={() => {
                      item.action();
                      onClose();
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <span className="command-palette__item-icon material-symbols-outlined">
                      {item.icon}
                    </span>
                    <span className="command-palette__item-label">
                      {item.label}
                    </span>
                    {item.hint && (
                      <span className="command-palette__item-hint">
                        {item.hint}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="command-palette__footer">
              <span>
                <kbd>↑↓</kbd> Navigate
              </span>
              <span>
                <kbd>↵</kbd> Select
              </span>
              <span>
                <kbd>Esc</kbd> Close
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

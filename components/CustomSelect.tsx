import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
    value: string;
    label: string;
}

interface CustomSelectProps {
    options: (Option | string)[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    disabled?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, placeholder, label, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [openUpwards, setOpenUpwards] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    // Refs
    const wrapperRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const searchBuffer = useRef("");
    const searchTimeout = useRef<NodeJS.Timeout>(null);

    // Initial highlight sync
    useEffect(() => {
        if (isOpen) {
            const index = options.findIndex(opt =>
                (typeof opt === 'string' ? opt : opt.value) === value
            );
            setHighlightedIndex(index >= 0 ? index : -1);
        }
    }, [isOpen, value, options]);

    // Scroll highlighted into view
    useEffect(() => {
        if (isOpen && listRef.current && highlightedIndex >= 0) {
            const element = listRef.current.children[highlightedIndex] as HTMLElement;
            if (element) {
                element.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [highlightedIndex, isOpen]);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (disabled) return;

        // Toggle open/close
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (isOpen && highlightedIndex >= 0) {
                const opt = options[highlightedIndex];
                const val = typeof opt === 'string' ? opt : opt.value;
                handleSelect(val);
            } else {
                setIsOpen(!isOpen);
            }
            return;
        }

        if (e.key === 'Escape') {
            setIsOpen(false);
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!isOpen) {
                setIsOpen(true);
                setHighlightedIndex(0);
            } else {
                setHighlightedIndex(prev => Math.min(prev + 1, options.length - 1));
            }
            return;
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (isOpen) {
                setHighlightedIndex(prev => Math.max(prev - 1, 0));
            }
            return;
        }

        // Typing search logic
        if (e.key.length === 1 && e.key.match(/\S/)) {
            // Stop propagation to prevent form submits or other listeners
            e.stopPropagation();

            // Clear previous timeout
            if (searchTimeout.current) clearTimeout(searchTimeout.current);

            // Add char to buffer
            searchBuffer.current += e.key.toLowerCase();

            // Set timeout to clear buffer
            searchTimeout.current = setTimeout(() => {
                searchBuffer.current = "";
            }, 500);

            // Find matching option
            const matchIndex = options.findIndex(opt => {
                const label = typeof opt === 'string' ? opt : opt.label;
                return label.toLowerCase().startsWith(searchBuffer.current);
            });

            if (matchIndex >= 0) {
                // If closed, open it and highlight
                if (!isOpen) {
                    setIsOpen(true);
                    setHighlightedIndex(matchIndex);
                } else {
                    // Just highlight/scroll
                    setHighlightedIndex(matchIndex);
                }
            }
        }
    };

    return (
        <div className="space-y-2 relative" ref={wrapperRef}>
            {label && <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>}
            <div
                className={`relative w-full bg-[#f8f9fa] border border-gray-100 rounded-full px-4 py-3 md:px-6 md:py-4 cursor-pointer flex items-center justify-between transition-all outline-none focus:ring-2 focus:ring-black/5 ${isOpen ? 'bg-white border-black' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-200'}`}
                tabIndex={disabled ? -1 : 0}
                onKeyDown={handleKeyDown}
                onClick={() => {
                    if (disabled) return;
                    if (!isOpen && wrapperRef.current) {
                        const rect = wrapperRef.current.getBoundingClientRect();
                        const spaceBelow = window.innerHeight - rect.bottom;
                        const spaceAbove = rect.top;

                        // Open upwards logic
                        if (spaceBelow < 250 && spaceAbove > spaceBelow) {
                            setOpenUpwards(true);
                        } else {
                            setOpenUpwards(false);
                        }
                    }
                    setIsOpen(!isOpen);
                }}
            >
                <span className={`font-bold ${value ? 'text-gray-800' : 'text-gray-400'}`}>
                    {value || placeholder || "Select"}
                </span>
                <ChevronDown size={18} className={`text-gray-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && !disabled && (
                <div
                    ref={listRef}
                    className={`absolute left-0 right-0 ${openUpwards ? 'bottom-full mb-2' : 'top-full mt-2'} bg-white border border-gray-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto z-[100] custom-scrollbar p-2 animate-in fade-in zoom-in-95 duration-200`}
                >
                    {options.map((opt, idx) => {
                        const optValue = typeof opt === 'string' ? opt : opt.value;
                        const optLabel = typeof opt === 'string' ? opt : opt.label;
                        const isSelected = value === optValue;
                        const isHighlighted = highlightedIndex === idx;

                        return (
                            <div
                                key={idx}
                                onClick={() => handleSelect(optValue)}
                                className={`px-4 py-3 rounded-xl cursor-pointer text-sm font-bold transition-colors mb-1 last:mb-0 
                                    ${isSelected ? 'bg-black text-white' : ''} 
                                    ${!isSelected && isHighlighted ? 'bg-gray-100 text-black' : ''}
                                    ${!isSelected && !isHighlighted ? 'text-gray-600 hover:bg-black hover:text-white' : ''}
                                `}
                            >
                                {optLabel}
                            </div>
                        );
                    })}
                    {options.length === 0 && (
                        <div className="px-4 py-3 text-sm text-gray-400 font-medium text-center">No options available</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;

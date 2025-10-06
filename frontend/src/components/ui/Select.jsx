// components/ui/Select.jsx
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X, Search } from "lucide-react";
import { createPortal } from "react-dom";
import { cn } from "../../utils/cn";
import Input from "./Input";
import Button from "./Button";

const SelectMenu = ({
    options,
    value,
    position,
    onSelect,
    onClose
}) => {
    if (!position) return null;
    
    return createPortal(
        <div
            className="fixed inset-0 z-50"
            onClick={onClose}
        >
            <div
                className={cn(
                    "fixed z-[51] overflow-auto",
                    "bg-white border border-gray-200 rounded-md shadow-md"
                )}
                style={{
                    top: position.top,
                    left: position.left,
                    width: position.width,
                    maxHeight: position.maxHeight,
                }}
                onClick={e => e.stopPropagation()}
            >
                <div className="py-1">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={cn(
                                "px-3 py-2 text-sm cursor-pointer select-none",
                                "hover:bg-gray-100",
                                value !== undefined && value !== '' && value === option.value && "bg-gray-100 font-medium",
                                "flex items-center justify-between"
                            )}
                            onClick={() => onSelect(option)}
                        >
                            <span>{option.label}</span>
                            {value !== undefined && value !== '' && value === option.value && (
                                <Check className="h-4 w-4" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>,
        document.body
    );
};

const Select = React.forwardRef(({
    className,
    options = [],
    value,
    placeholder = "Select an option",
    disabled = false,
    required = false,
    label,
    error,
    name,
    onChange,
    ...props
}, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const [menuPosition, setMenuPosition] = useState(null);

    useEffect(() => {
        const handleScroll = () => {
            if (isOpen) {
                setMenuPosition(getMenuPosition());
            }
        };

        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                setMenuPosition(null);
            }
        };

        if (isOpen) {
            window.addEventListener('scroll', handleScroll, true);
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            window.removeEventListener('scroll', handleScroll, true);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const getMenuPosition = () => {
        if (!containerRef.current) return null;

        const rect = containerRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;
        const menuHeight = Math.min(options.length * 36 + 16, 200);
        const spaceBelow = windowHeight - rect.bottom;
        const spaceAbove = rect.top;

        // Determine if we should position below or above
        const positionBelow = spaceBelow >= menuHeight || spaceBelow >= spaceAbove;

        let top, left, maxHeight;

        if (positionBelow) {
            maxHeight = Math.min(menuHeight, spaceBelow - 8);
            top = rect.bottom + 4;
        } else {
            maxHeight = Math.min(menuHeight, spaceAbove - 8);
            top = rect.top - maxHeight - 4;
        }

        // Ensure dropdown doesn't go off the right edge
        left = Math.max(8, Math.min(rect.left, windowWidth - rect.width - 8));

        return {
            top,
            left,
            width: rect.width,
            maxHeight,
        };
    };

    const handleOpen = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setIsOpen(true);
            setMenuPosition(getMenuPosition());
        }
    };

    const handleSelect = (option) => {
        if (option && option.value !== undefined) {
            console.log('Selecting option:', option);
            setIsOpen(false);
            setMenuPosition(null);
            onChange(option.value);
        }
    };

    const selectedOption = options.find(opt => opt && opt.value === value);

    return (
        <div className="space-y-2">
            {label && (
                <label className={cn(
                    "block text-sm font-medium",
                    error ? "text-red-500" : "text-gray-700"
                )}>
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div ref={containerRef} className="relative">
                <button
                    type="button"
                    className={cn(
                        "relative w-full cursor-pointer rounded-md border bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-1 sm:text-sm",
                        error ? "border-red-300 focus:border-red-500 focus:ring-red-500" :
                               "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                        disabled && "cursor-not-allowed bg-gray-50 text-gray-500",
                        className
                    )}
                    onClick={handleOpen}
                    ref={ref}
                    disabled={disabled}
                >
                    <span className={cn(
                        "block truncate",
                        (!selectedOption || value === undefined || value === '') && "text-gray-500"
                    )}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronDown className={cn(
                            "h-4 w-4 text-gray-400",
                            isOpen && "transform rotate-180"
                        )} />
                    </span>
                </button>
                
                {isOpen && (
                    <SelectMenu
                        options={options}
                        value={value}
                        position={menuPosition}
                        onSelect={handleSelect}
                        onClose={() => setIsOpen(false)}
                    />
                )}

                {error && (
                    <p className="mt-1 text-sm text-red-500">
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
});

Select.displayName = "Select";

export default Select;
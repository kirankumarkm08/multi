// src/components/cart-item-row.tsx (FIXED VERSION)
"use client";

import { useState } from "react";

// Shadcn imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Minus, Plus } from "lucide-react";

// Placeholder for formatCurrency
const formatCurrency = (amount: number, currency: string = "USD") => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

interface CartItemRowProps {
    id: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
    total: number;
    image: string;
    tier?: string;
    onQuantityChange: (itemId: string, newQuantity: number) => Promise<void>;
    onRemove: (itemId: string) => Promise<void>;
    loading?: boolean;
}

export function CartItemRow(props: CartItemRowProps) {
    const { 
        id, 
        name, 
        description, 
        price, 
        quantity, 
        total, 
        image, 
        tier,
        onQuantityChange,
        onRemove,
        loading = false
    } = props;

    // Use a local state for input, but sync on blur/button click
    const [localQuantity, setLocalQuantity] = useState(quantity);
    const [updating, setUpdating] = useState(false);

    const priceTotal = total || price * quantity;

    // Handler to call the API action
    const handleUpdateQuantity = async (newQuantity: number) => {
        if (newQuantity === quantity || newQuantity < 1) return;

        setUpdating(true);
        setLocalQuantity(newQuantity);
        try {
            await onQuantityChange(id, newQuantity);
        } catch (error) {
            // Revert local state on API failure for immediate user feedback
            setLocalQuantity(quantity);
            console.error("Failed to update cart item quantity:", error);
        } finally {
            setUpdating(false);
        }
    };

    const handleRemoveItem = async () => {
        setUpdating(true);
        try {
            await onRemove(id);
        } catch (error) {
            console.error("Failed to remove cart item:", error);
        } finally {
            setUpdating(false);
        }
    };

    const isDisabled = loading || updating;

    return (
        <div className="flex space-x-4 border-b pb-4 last:border-b-0 last:pb-0">
            {/* Product Image */}
            <div className="h-20 w-20 flex-shrink-0 rounded-md bg-gray-100 overflow-hidden">
                {image ? (
                    <img
                        src={image}
                        alt={name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                            e.currentTarget.style.display = "none";
                        }}
                    />
                ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                )}
            </div>

            <div className="flex-1 space-y-1">
                <div className="flex justify-between">
                    <h3 className="text-base font-semibold">{name}</h3>
                    <span className="text-base font-medium">
                        {formatCurrency(priceTotal)}
                    </span>
                </div>
                {description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {description}
                    </p>
                )}
                {/* {tier && <p className="text-sm text-muted-foreground">{tier}</p>} */}

                <div className="flex items-center space-x-2 pt-2 p-2 m-2">
                    {/* Quantity Controls */}
                    <div className="flex items-center border rounded-md">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleUpdateQuantity(localQuantity - 1)}
                            disabled={isDisabled || localQuantity <= 1}
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                            type="number"
                            value={localQuantity}
                            onChange={(e) => setLocalQuantity(parseInt(e.target.value) || 0)}
                            onBlur={(e) =>
                                handleUpdateQuantity(parseInt(e.target.value) || 1)
                            }
                            className="h-7 w-12 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            disabled={isDisabled}
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleUpdateQuantity(localQuantity + 1)}
                            disabled={isDisabled}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Remove Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-700"
                        onClick={handleRemoveItem}
                        disabled={isDisabled}
                        title="Remove item"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
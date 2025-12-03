// src/components/cards/TicketsCard.tsx

"use client";

import React, { useState } from "react";
import { DollarSign, ShoppingCart, Loader2, CalendarDays, Hourglass } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart"; 
import { 
    formatPrice, 
    formatTicketDate, 
    getStatusBadge, 
    getAvailabilityPercentage 
} from "@/utils/ticketutils"; 

// --- ⚠️ TYPES: In a real app, these should be imported from '@/types' ⚠️ ---
interface EventEdition {
    id: number;
    event_name: string;
    venue_name?: string;
    start_date?: string;
    end_date?: string;
}

interface Ticket {
    id: number;
    name: string;
    description?: string;
    price: string; 
    quantity: number;
    available_quantity: number;
    ticket_end_date?: string;
    ticket_logo?: string;
    status: string;
    event_editions?: EventEdition[];
}

interface TicketCardProps {
    ticket: Ticket;
}
// --------------------------------------------------------------------------

// ------------------------------
// Component
// ------------------------------
export const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { addToCart } = useCart(); 

    const availabilityPercentage = getAvailabilityPercentage(ticket);
    const isSaleEnded =
        ticket.status === "expired" ||
        (ticket.ticket_end_date && new Date(ticket.ticket_end_date) < new Date());
        
    const isSoldOut = ticket.status === "sold_out" || (ticket.available_quantity !== undefined && ticket.available_quantity <= 0);
    
    const isDisabled = isSoldOut || isSaleEnded || isLoading;

    const primaryEventName = ticket.event_editions?.[0]?.event_name;
    const primaryEventDate = ticket.event_editions?.[0]?.start_date;

    // ------------------------------
    // Add to Cart Logic
    // ------------------------------
    const handleAddToCart = async () => {
        if (isDisabled) return;
        setIsLoading(true);

        try {
            await addToCart({
                productId: String(ticket.id),
                quantity: 1, 
            });

            toast.success("Ticket Added!", {
                description: `1 x ${ticket.name} for ${primaryEventName || 'the event'} has been reserved.`,
                duration: 3000,
            });

        } catch (error: any) {
            toast.error("Cart Update Failed", {
                description: error.message || "Could not add ticket. Please try again.",
                duration: 5000,
            });

        } finally {
            setIsLoading(false);
        }
    };

    const getButtonText = () => {
        if (isLoading) return "Adding...";
        if (isSoldOut) return "Sold Out";
        if (isSaleEnded) return "Sale Ended";
        return "Purchase Ticket";
    };

    const isLimitedStock = ticket.quantity > 0 && availabilityPercentage <= 20 && !isSoldOut;

    // ------------------------------
    // UI Render
    // ------------------------------
    return (
        <div
            id={`ticket-card-${ticket.id}`}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 border border-gray-100 dark:bg-gray-800 dark:border-gray-700 flex flex-col overflow-hidden"
        >
            {/* Ticket Image (Optional) */}
            {ticket.ticket_logo && (
                <div className="w-full h-40 overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <img
                        src={ticket.ticket_logo}
                        alt={ticket.name}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                </div>
            )}

            <div className="p-6 flex flex-col flex-grow justify-between">
                
                {/* Header (Title + Status) */}
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-snug pr-2">
                        {ticket.name}
                    </h3>
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusBadge(
                            ticket.status
                        )}`}
                    >
                        {ticket.status.toUpperCase().replace('_', ' ')}
                    </span>
                </div>

                {/* Description */}
                {ticket.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {ticket.description}
                    </p>
                )}

                {/* Event & Sales Info Block */}
                <div className="space-y-2 mb-4">
                    {primaryEventName && (
                        <div className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <CalendarDays className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <span className="truncate">
                                {primaryEventName} 
                                {primaryEventDate && ` (${formatTicketDate(primaryEventDate)})`}
                            </span>
                        </div>
                    )}
                    {ticket.ticket_end_date && !isSaleEnded && (
                        <div className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <Hourglass className="w-4 h-4 text-purple-500 flex-shrink-0" />
                            <span className="truncate">
                                Sales end: {formatTicketDate(ticket.ticket_end_date)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Price & Availability */}
                <div className="mb-4">
                    <div className="flex justify-between items-end mb-3">
                        <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-semibold">
                            <DollarSign className="w-5 h-5 text-green-500" /> Ticket Price
                        </span>
                        <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                            {formatPrice(ticket.price)}
                        </span>
                    </div>

                    {/* Availability Bar */}
                    {ticket.quantity > 0 && (
                        <div className="mt-2">
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                <span>{ticket.available_quantity} of {ticket.quantity} remaining</span>
                                {isLimitedStock && <span className="font-bold text-red-500">LOW STOCK!</span>}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                <div 
                                    className={`h-2.5 rounded-full transition-all duration-500 
                                        ${isLimitedStock ? 'bg-red-500' : 'bg-green-500'}`} 
                                    style={{ width: `${availabilityPercentage}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>


                {/* Add to Cart Button */}
                <button
                    onClick={handleAddToCart}
                    disabled={isDisabled}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition duration-200 ease-in-out
                        hover:bg-blue-700 
                        disabled:bg-gray-200 disabled:text-gray-500 disabled:shadow-none
                        dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <ShoppingCart className="w-4 h-4" />
                    )}
                    {getButtonText()}
                </button>
            </div>
        </div>
    );
};

export default TicketCard;
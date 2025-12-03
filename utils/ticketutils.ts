// utils/ticketUtils.ts

// --- ⚠️ TYPES: In a real app, these should be imported from '@/types' ⚠️ ---
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
    event_editions?: any[];
}
// --------------------------------------------------------------------------

export const formatPrice = (price: string | number): string => {
    const numericPrice = parseFloat(price.toString());
    return `$${numericPrice.toFixed(2)}`;
};

export const formatTicketDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

export const getStatusBadge = (status: string): string => {
    switch (status.toLowerCase()) {
        case "active":
            return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
        case "sold_out":
            return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
        case "expired":
            return "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
        case "upcoming":
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
        default:
            return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
    }
};

export const getAvailabilityPercentage = (ticket: Ticket): number => {
    if (!ticket.quantity || ticket.quantity <= 0) return 0;
    
    const remaining = ticket.available_quantity || 0; 
    const percentage = (remaining / ticket.quantity) * 100;
    
    return Math.max(0, Math.min(100, percentage)); 
};
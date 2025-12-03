"use client";

import { Ticket } from "@/services/ticket.service"; // Ensure this import points to your defined interface
import TicketCard from "../cards/TicketsCard";
import { CartService } from "@/services/cart.service";

// --- Type Definitions (Use the extended Ticket interface) ---

interface DynamicTicketsProps {
  tickets: Ticket[];
  title?: string;
  showOnlyActive?: boolean;
}

// --- Helper Functions (Extracted for purity/testability) ---

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    price
  );

const formatDate = (dateString?: string) => {
  if (!dateString) return null;
  // Ensure we can handle ISO string dates
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getAvailabilityPercentage = (ticket: Ticket): number => {
  // Handle division by zero and null/undefined
  if (!ticket.quantity || ticket.quantity <= 0) return 0;

  const available = ticket.quantity - (ticket.sold || 0);
  const percentage = (available / ticket.quantity) * 100;
  return Math.round(Math.max(0, percentage)); // Ensure it's not negative
};

const getAvailabilityColor = (percentage: number) => {
  if (percentage > 50) return "text-green-600 bg-green-50";
  if (percentage > 20) return "text-yellow-600 bg-yellow-50";
  return "text-red-600 bg-red-50";
};

const getStatusBadge = (status: Ticket["status"]) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "inactive":
      return "bg-gray-100 text-gray-800";
    case "sold_out":
      return "bg-red-100 text-red-800";
    case "expired":
      return "bg-pink-100 text-pink-800"; // Added expired status
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// --- Ticket Card Sub-Component ---

interface TicketCardProps {
  ticket: Ticket;
}

// Use the actual cart service
const addToCartService = async (ticketId: number, quantity: number) => {
  try {
    console.log("Adding ticket to cart:", { ticketId, quantity });
    const result = await CartService.addItem({
      productId: String(ticketId),
      quantity: quantity,
    });
    console.log("Add to cart result:", result);
    return result;
  } catch (error) {
    console.error("Cart API Error:", error);
    throw error;
  }
};

// --- Main Component ---

export default function DynamicTickets({
  tickets,
  title = "Available Tickets",
  showOnlyActive = true,
}: DynamicTicketsProps) {
  // Filter logic remains clean and simple
  const displayTickets = showOnlyActive
    ? tickets.filter((t) => t.status === "active")
    : tickets;

  // Handle all tickets array empty
  if (!tickets || tickets.length === 0) {
    return (
      <section className="">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            {title}
          </h2>
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-600 rounded-lg p-8">
            <h3 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
              No Tickets Found
            </h3>
            <p className="text-red-600 dark:text-red-300 text-sm">
              There are no tickets configured for this event at this time.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Handle filtered array empty when showOnlyActive is true
  if (showOnlyActive && displayTickets.length === 0) {
    return (
      <section className="">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            {title}
          </h2>
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-600 rounded-lg p-8">
            <div className="text-4xl mb-4">🔔</div>
            <h3 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Tickets Coming Soon!
            </h3>
            <p className="text-yellow-600 dark:text-yellow-300 text-sm">
              All tickets are currently inactive, sold out, or sale dates have
              not started.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="text-gray-900 dark:text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">{title}</h2>

        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {displayTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Component Registration System for Page Builder
// This file exports all available components for the page builder

// Import all components
import DynamicSpeakers from "./DynamicSpeakers";
import DynamicTickets from "./DynamicTickets";
import DynamicEvents from "./DynamicEvents";
import DynamicEventsEnhanced from "./DynamicEventsEnhanced";

import Navbar from "./Navbar";

// Enhanced imports (when available)
// import DynamicSpeakersEnhanced from './DynamicSpeakersEnhanced';
// import DynamicTicketsEnhanced from './DynamicTicketsEnhanced';

// Component Registry for Page Builder
export const COMPONENT_REGISTRY = {
  // Event Components
  "dynamic-speakers": DynamicSpeakers,
  "dynamic-tickets": DynamicTickets,
  "dynamic-events": DynamicEvents,
  "dynamic-events-enhanced": DynamicEventsEnhanced,
  "navbar": Navbar,

  // Add more components as they're created
};


export {
  DynamicSpeakers,
  DynamicTickets,
  DynamicEvents,
  DynamicEventsEnhanced,
  Navbar,
};

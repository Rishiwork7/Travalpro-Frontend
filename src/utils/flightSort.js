/**
 * Convert ISO 8601 duration (e.g., "PT6H30M" or "6h30m") to total minutes
 * @param {string} duration - ISO duration string or simplified format
 * @returns {number} Total duration in minutes
 */
const parseDuration = (duration) => {
  if (!duration) return 0;
  
  // Handle both "PT6H30M" (ISO format) and "6h30m" (backend format)
  const hoursMatch = duration.match(/(\d+)[Hh]/);
  const minutesMatch = duration.match(/(\d+)[Mm]/);
  
  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
  
  return hours * 60 + minutes;
};

/**
 * Calculate stops penalty for relevance scoring
 * @param {number} stops - Number of stops
 * @returns {number} Penalty value (0, 0.2, or 0.4)
 */
const getStopsPenalty = (stops) => {
  if (stops === 0) return 0;
  if (stops === 1) return 0.2;
  return 0.4; // 2+ stops
};

/**
 * Calculate relevance score for a flight
 * Lower score = more relevant
 * @param {object} flight - Flight offer object
 * @param {number} maxPrice - Maximum price in the dataset
 * @param {number} maxDuration - Maximum duration in the dataset (in minutes)
 * @returns {number} Relevance score
 */
const calculateRelevanceScore = (flight, maxPrice, maxDuration) => {
  // Handle both Amadeus format and backend simplified format
  const price = flight.price?.total 
    ? parseFloat(flight.price.total) 
    : parseFloat(flight.price || 0);
  
  const duration = flight.itineraries?.[0]?.duration
    ? parseDuration(flight.itineraries[0].duration)
    : parseDuration(flight.duration || "0h0m");
  
  const stops = flight.itineraries?.[0]?.segments?.length
    ? flight.itineraries[0].segments.length - 1
    : (flight.stops ?? 0);
  
  // Handle edge cases
  if (isNaN(price) || isNaN(duration) || !isFinite(price) || !isFinite(duration)) {
    return Infinity; // Put invalid flights at the end
  }
  
  // Normalize price and duration (0 to 1)
  const normalizedPrice = maxPrice > 0 ? price / maxPrice : 0;
  const normalizedDuration = maxDuration > 0 ? duration / maxDuration : 0;
  const stopsPenalty = getStopsPenalty(stops);
  
  // Weighted score: 50% price, 30% duration, 20% stops
  const score = (
    normalizedPrice * 0.5 +
    normalizedDuration * 0.3 +
    stopsPenalty * 0.2
  );
  
  return score;
};

/**
 * Sort flights based on the specified sort type
 * Handles both Amadeus API format and backend simplified format
 * @param {Array} flights - Array of flight offers
 * @param {string} sortType - Sort type: "price_asc", "price_desc", "duration_asc", "relevant"
 * @returns {Array} Sorted array (does not mutate original)
 */
export const sortFlights = (flights, sortType) => {
  if (!flights || flights.length === 0) {
    return [];
  }
  
  // Create a shallow copy to avoid mutating the original array
  const flightsCopy = [...flights];
  
  // Helper to extract price (handles both formats)
  const getPrice = (flight) => {
    return flight.price?.total 
      ? parseFloat(flight.price.total) 
      : parseFloat(flight.price || 0);
  };
  
  // Helper to extract duration (handles both formats)
  const getDuration = (flight) => {
    return flight.itineraries?.[0]?.duration
      ? parseDuration(flight.itineraries[0].duration)
      : parseDuration(flight.duration || "0h0m");
  };
  
  switch (sortType) {
    case "price_asc":
      return flightsCopy.sort((a, b) => {
        return getPrice(a) - getPrice(b);
      });
    
    case "price_desc":
      return flightsCopy.sort((a, b) => {
        return getPrice(b) - getPrice(a);
      });
    
    case "duration_asc":
      return flightsCopy.sort((a, b) => {
        return getDuration(a) - getDuration(b);
      });
    
    case "relevant":
      // Find max price and duration for normalization
      const prices = flights.map(getPrice).filter(p => !isNaN(p) && isFinite(p));
      const durations = flights.map(getDuration).filter(d => !isNaN(d) && isFinite(d));
      
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 1;
      const maxDuration = durations.length > 0 ? Math.max(...durations) : 1;
      
      return flightsCopy.sort((a, b) => {
        const scoreA = calculateRelevanceScore(a, maxPrice, maxDuration);
        const scoreB = calculateRelevanceScore(b, maxPrice, maxDuration);
        return scoreA - scoreB; // Lower score = more relevant
      });
    
    default:
      // If unknown sort type, return copy as-is
      return flightsCopy;
  }
};

export default sortFlights;

/**
 * Utility functions for safely handling address objects
 */

/**
 * Safely formats an address object into a readable string
 * @param {Object|string} address - The address object or string
 * @returns {string} - Formatted address string
 */
export const formatAddress = (address) => {
  if (!address) {
    return 'Address not available';
  }
  
  if (typeof address === 'string') {
    return address;
  }
  
  if (typeof address === 'object') {
    const {
      firstName = '',
      lastName = '',
      address: streetAddress = '',
      city = '',
      state = '',
      zipCode = '',
      country = ''
    } = address;
    
    const parts = [
      firstName && lastName ? `${firstName} ${lastName}` : '',
      streetAddress,
      city && state ? `${city}, ${state}` : city || state,
      zipCode,
      country
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : 'Address not available';
  }
  
  return 'Address not available';
};

/**
 * Safely renders an address object in JSX
 * @param {Object|string} address - The address object or string
 * @returns {string|JSX.Element} - Safe address rendering
 */
export const renderAddress = (address) => {
  return formatAddress(address);
};

/**
 * Checks if an address object is valid
 * @param {Object|string} address - The address to check
 * @returns {boolean} - Whether the address is valid
 */
export const isValidAddress = (address) => {
  if (!address) return false;
  if (typeof address === 'string') return address.trim().length > 0;
  if (typeof address === 'object') {
    return address.address || address.streetAddress || address.city || address.state;
  }
  return false;
};

import { HERMES_KEY, HERMES_URL, HERMES_USER } from '../constants/index.js';
import { generateMockSuggestions } from './mockData.js';

/**
 * Call Hermes API to get travel suggestions
 * @param {Object} travelData - Travel form data
 * @returns {Promise} API response
 */
export const getTravelSuggestions = async (travelData) => {
  try {
    const response = await my.request({
      url: HERMES_URL,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HERMES_KEY}`,
        'X-User': HERMES_USER
      },
      data: {
        user: HERMES_USER,
        destination: travelData.destination,
        departure_date: travelData.departure_date,
        return_date: travelData.return_date,
        adults: travelData.adults,
        children: travelData.children,
        activity_reference: travelData.activity_reference
      }
    });

    if (response.statusCode === 200) {
      return {
        success: true,
        data: response.data
      };
    } else {
      throw new Error(`API Error: ${response.statusCode}`);
    }
  } catch (error) {
    console.error('Hermes API Error:', error);
    
    // Log detailed error information for debugging
    if (error.data) {
      console.error('API Error Details:', {
        code: error.data.code,
        message: error.data.message,
        status: error.status
      });
    }
    
    // Fallback to mock data if API fails (for testing and development)
    if (error.status === 400 || error.status === 401 || error.status === 500) {
      console.warn('API failed, using mock data as fallback');
      return {
        success: true,
        data: generateMockSuggestions(travelData.destination)
      };
    }
    
    return {
      success: false,
      error: (error.data && error.data.message) || error.message || 'Failed to get travel suggestions'
    };
  }
};

/**
 * Save travel data to local storage
 * @param {Object} data - Data to save
 */
export const saveTravelData = (data) => {
  try {
    my.setStorageSync({
      key: 'travel_data',
      data: JSON.stringify(data)
    });
  } catch (error) {
    console.error('Failed to save travel data:', error);
  }
};

/**
 * Get travel data from local storage
 * @returns {Object|null} Saved travel data
 */
export const getTravelData = () => {
  try {
    const result = my.getStorageSync({
      key: 'travel_data'
    });
    return result.data ? JSON.parse(result.data) : null;
  } catch (error) {
    console.error('Failed to get travel data:', error);
    return null;
  }
};

/**
 * Save travel suggestions to local storage
 * @param {Object} suggestions - Travel suggestions data
 */
export const saveTravelSuggestions = (suggestions) => {
  try {
    my.setStorageSync({
      key: 'travel_suggestions',
      data: JSON.stringify(suggestions)
    });
  } catch (error) {
    console.error('Failed to save travel suggestions:', error);
  }
};

/**
 * Get travel suggestions from local storage
 * @returns {Object|null} Saved travel suggestions
 */
export const getSavedTravelSuggestions = () => {
  try {
    const result = my.getStorageSync({
      key: 'travel_suggestions'
    });
    return result.data ? JSON.parse(result.data) : null;
  } catch (error) {
    console.error('Failed to get travel suggestions:', error);
    return null;
  }
};

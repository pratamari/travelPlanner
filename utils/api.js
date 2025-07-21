import { HERMES_KEY, HERMES_URL, HERMES_USER } from '../constants/index.js';
import { generateMockSuggestions } from './mockData.js';

/**
 * Call Hermes API to get travel suggestions
 * @param {Object} travelData - Travel form data
 * @returns {Promise} API response
 */
export const getTravelSuggestions = async (travelData) => {
  try {
    // Debug: Log the input data (Updated: 2025-07-17)
    console.log('=== NEW API VERSION LOADED ===');
    console.log('Input travelData:', travelData);
    
    // Helper function to convert date format from YYYY-MM-DD to DD-MM-YYYY
    const formatDateForAPI = (dateString) => {
      if (!dateString) return dateString;
      const parts = dateString.split('-');
      const year = parts[0];
      const month = parts[1];
      const day = parts[2];
      return day + '-' + month + '-' + year;
    };
    
    const payload = {
      inputs: {
        destination: travelData.destination,
        departure_date: formatDateForAPI(travelData.departure_date),
        return_date: formatDateForAPI(travelData.return_date),
        adult: travelData.adult,
        children: travelData.children, // Fixed: API now uses correct 'children' spelling
        activity_reference: travelData.activity_reference
      },
      response_mode: "blocking",
      user: HERMES_USER
    };
    
    // Debug: Log the payload being sent
    console.log('Sending payload to Hermes API:', JSON.stringify(payload, null, 2));
    
    const response = await my.request({
      url: HERMES_URL,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + HERMES_KEY,
        'X-User': HERMES_USER
      },
      data: payload
    });

    // Debug: Log the full response
    console.log('API Response:', response);
    
    // Handle workflow-based API response
    if (response.statusCode === 200 || response.status === 200) {
      const responseData = response.data;
      
      // Check if workflow completed successfully (API returns 'succeeded' status)
      if (responseData && responseData.data && responseData.data.status === 'succeeded') {
        // Transform the API response to match our expected format
        const apiOutputs = responseData.data.outputs;
        
        if (apiOutputs && apiOutputs.itinerary) {
          // Debug: Log the itinerary data being returned
          console.log('=== ITINERARY DATA DEBUG ===');
          console.log('Total days found:', apiOutputs.itinerary.length);
          console.log('Full itinerary data:', JSON.stringify(apiOutputs.itinerary, null, 2));
          
          // Verify each day has the expected structure
          apiOutputs.itinerary.forEach((day, index) => {
            console.log('Day ' + (index + 1) + ' (' + day.day + '):', {
              id: day.id,
              timeSlots: day.time ? day.time.length : 0,
              packingItems: day.packingItem ? day.packingItem.length : 0
            });
          });
          
          return {
            success: true,
            data: {
              itinerary: apiOutputs.itinerary
            }
          };
        } else {
          console.warn('No itinerary in API response, using fallback data');
          return {
            success: true,
            data: generateMockSuggestions(travelData.destination)
          };
        }
      } 
      // If workflow failed, show error but use fallback
      else if (responseData && responseData.data && responseData.data.status === 'failed') {
        console.warn('Workflow failed, using fallback data:', responseData.data.error);
        return {
          success: true,
          data: generateMockSuggestions(travelData.destination)
        };
      }
      // If workflow is still running, use fallback for now
      else {
        console.warn('Workflow status unclear, using fallback data. Status:', responseData && responseData.data ? responseData.data.status : 'unknown');
        return {
          success: true,
          data: generateMockSuggestions(travelData.destination)
        };
      }
    } else {
      console.error('API Error Details:', {
        statusCode: response.statusCode,
        status: response.status,
        data: response.data,
        headers: response.headers
      });
      throw new Error('API Error: ' + (response.statusCode || response.status) + ' - ' + JSON.stringify(response.data));
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

/**
 * Clear all travel data from local storage
 */
export const clearAllTravelData = () => {
  try {
    // Clear travel form data
    my.removeStorageSync({
      key: 'travel_data'
    });
    
    // Clear travel suggestions
    my.removeStorageSync({
      key: 'travel_suggestions'
    });
    
    console.log('All travel data cleared successfully');
  } catch (error) {
    console.error('Failed to clear travel data:', error);
  }
};

/**
 * Save itinerary with unique key for multiple saved trips
 * @param {Object} itineraryData - Itinerary data to save
 * @param {Object} travelParams - Travel parameters
 * @returns {string} Unique key for the saved itinerary
 */
export const saveItinerary = (itineraryData, travelParams) => {
  try {
    // Generate unique key based on destination and timestamp
    const timestamp = new Date().getTime();
    const destination = travelParams.destination.replace(/[^a-zA-Z0-9]/g, '_');
    const uniqueKey = 'saved_itinerary_' + destination + '_' + timestamp;
    
    const saveData = {
      itinerary: itineraryData,
      travelParams: travelParams,
      savedAt: new Date().toISOString(),
      displayName: travelParams.destination + ' - ' + travelParams.departure_date
    };
    
    my.setStorageSync({
      key: uniqueKey,
      data: JSON.stringify(saveData)
    });
    
    // Also maintain a list of saved itinerary keys
    const savedKeys = getSavedItineraryKeys();
    savedKeys.push(uniqueKey);
    my.setStorageSync({
      key: 'saved_itinerary_keys',
      data: JSON.stringify(savedKeys)
    });
    
    console.log('Itinerary saved with key:', uniqueKey);
    return uniqueKey;
  } catch (error) {
    console.error('Failed to save itinerary:', error);
    return null;
  }
};

/**
 * Get list of saved itinerary keys
 * @returns {Array} Array of saved itinerary keys
 */
export const getSavedItineraryKeys = () => {
  try {
    const result = my.getStorageSync({
      key: 'saved_itinerary_keys'
    });
    return result.data ? JSON.parse(result.data) : [];
  } catch (error) {
    console.error('Failed to get saved itinerary keys:', error);
    return [];
  }
};

/**
 * Get saved itinerary by key
 * @param {string} key - Unique key for the saved itinerary
 * @returns {Object|null} Saved itinerary data
 */
export const getSavedItinerary = (key) => {
  try {
    const result = my.getStorageSync({
      key: key
    });
    return result.data ? JSON.parse(result.data) : null;
  } catch (error) {
    console.error('Failed to get saved itinerary:', error);
    return null;
  }
};

import { getTravelSuggestions, saveTravelSuggestions, getSavedTravelSuggestions, getTravelData, clearAllTravelData, saveItinerary } from '../../utils/api.js';

Page({
  data: {
    itinerary: [],
    loading: true,
    error: '',
    destination: '',
    departure_date: '',
    return_date: '',
    expandedDays: {} // Track which days are expanded
  },

  onLoad(query) {
    console.info(`Suggestions page loaded with query: ${JSON.stringify(query)}`);
    this.loadTravelData();
    this.loadSuggestions();
  },

  onReady() {
    // Page loading is complete
  },

  onShow() {
    // Page display
  },

  onHide() {
    // Page hidden
  },

  onUnload() {
    // Page is closed
  },

  // Load travel form data
  loadTravelData() {
    const travelData = getTravelData();
    if (travelData) {
      this.setData({
        destination: travelData.destination,
        departure_date: travelData.departure_date,
        return_date: travelData.return_date
      });
    }
  },

  // Load travel suggestions
  async loadSuggestions() {
    try {
      this.setData({ loading: true, error: '' });
      
      // Debug: Check travel data dates
      const debugTravelData = getTravelData();
      if (debugTravelData) {
        console.log('=== TRAVEL DATA DEBUG ===');
        console.log('Departure date:', debugTravelData.departure_date);
        console.log('Return date:', debugTravelData.return_date);
        
        // Calculate expected days
        if (debugTravelData.departure_date && debugTravelData.return_date) {
          const startDate = new Date(debugTravelData.departure_date);
          const endDate = new Date(debugTravelData.return_date);
          const timeDiff = endDate.getTime() - startDate.getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end days
          console.log('Expected days based on dates:', daysDiff);
        }
      }

      // First try to get from local storage
      const savedSuggestions = getSavedTravelSuggestions();
      if (savedSuggestions && savedSuggestions.itinerary && 
          this.validateSavedSuggestions(savedSuggestions, debugTravelData)) {
        // Filter saved data by date range first
        const filteredSavedItinerary = this.filterItineraryByDateRange(
          savedSuggestions.itinerary, 
          debugTravelData.departure_date, 
          debugTravelData.return_date
        );
        
        // Generate activity summaries and initialize checkbox states for saved data
        const savedItineraryWithSummaries = filteredSavedItinerary.map(function(day) {
          // Convert old format to new format
          const convertedTimeData = this.convertTimeDataFormat(day.time || []);
          const activitySummary = this.generateActivitySummary(convertedTimeData);
          
          // Initialize checked states for converted time activities
          const timeWithChecked = convertedTimeData.map(function(timeSlot) {
            return Object.assign({}, timeSlot, {
              checked: timeSlot.checked || false
            });
          });
          
          // Initialize checked states for packing items if not present
          const packingWithChecked = (day.packingItem || []).map(function(item) {
            if (typeof item === 'string') {
              return { name: item, checked: false };
            }
            return Object.assign({}, item, {
              checked: item.checked || false
            });
          });
          
          return Object.assign({}, day, {
            activitySummary: activitySummary,
            time: timeWithChecked,
            packingItem: packingWithChecked
          });
        }.bind(this));
        
        // Initialize all days as collapsed (no auto-expand)
        const expandedDays = {};
        
        this.setData({
          itinerary: savedItineraryWithSummaries,
          loading: false,
          expandedDays: expandedDays
        });
        
        return;
      }

      // If no saved data, get from API
      const travelData = getTravelData();
      if (!travelData) {
        throw new Error('No travel data found');
      }

      const response = await getTravelSuggestions(travelData);
      
      console.log('=== API RESPONSE DEBUG ===');
      console.log('API Response success:', response.success);
      if (response.data && response.data.itinerary) {
        console.log('API returned days:', response.data.itinerary.length);
        console.log('Day IDs:', response.data.itinerary.map(function(day) { return day.id; }));
      }
      
      if (response.success && response.data && response.data.itinerary) {
        // Filter API data by date range first
        const filteredApiItinerary = this.filterItineraryByDateRange(
          response.data.itinerary,
          travelData.departure_date,
          travelData.return_date
        );
        
        // Save filtered suggestions locally with travel parameters for validation
        saveTravelSuggestions({ 
          itinerary: filteredApiItinerary,
          travelParams: {
            destination: travelData.destination,
            departure_date: travelData.departure_date,
            return_date: travelData.return_date,
            adult: travelData.adult,
            children: travelData.children,
            activity_reference: travelData.activity_reference
          }
        });
        
        // Generate activity summaries and initialize checkbox states for each day
        const itineraryWithSummaries = filteredApiItinerary.map(function(day) {
          // Convert old format to new format
          const convertedTimeData = this.convertTimeDataFormat(day.time || []);
          const activitySummary = this.generateActivitySummary(convertedTimeData);
          
          // Initialize checked states for converted time activities
          const timeWithChecked = convertedTimeData.map(function(timeSlot) {
            return Object.assign({}, timeSlot, {
              checked: false
            });
          });
          
          // Initialize checked states for packing items
          const packingWithChecked = (day.packingItem || []).map(function(item) {
            if (typeof item === 'string') {
              return { name: item, checked: false };
            }
            return Object.assign({}, item, {
              checked: false
            });
          });
          
          return Object.assign({}, day, {
            activitySummary: activitySummary,
            time: timeWithChecked,
            packingItem: packingWithChecked
          });
        }.bind(this));
        
        // Initialize all days as collapsed (no auto-expand)
        const expandedDays = {};
        
        this.setData({
          itinerary: itineraryWithSummaries,
          loading: false,
          expandedDays: expandedDays
        });
      } else {
        throw new Error(response.error || 'Failed to load suggestions');
      }
    } catch (error) {
      console.error('Load suggestions error:', error);
      this.setData({
        loading: false,
        error: error.message || 'Failed to load travel suggestions'
      });
    }
  },

  // Validate if saved suggestions match current travel data
  validateSavedSuggestions(savedSuggestions, currentTravelData) {
    if (!savedSuggestions || !currentTravelData) {
      return false;
    }
    
    // Check if saved data has travel parameters
    if (!savedSuggestions.travelParams) {
      console.log('Saved data missing travel parameters - fetching fresh data');
      return false;
    }
    
    const saved = savedSuggestions.travelParams;
    const current = currentTravelData;
    
    // Compare key parameters
    const destinationMatch = saved.destination === current.destination;
    const departureDateMatch = saved.departure_date === current.departure_date;
    const returnDateMatch = saved.return_date === current.return_date;
    const adultMatch = saved.adult === current.adult;
    const childrenMatch = saved.children === current.children;
    const activityMatch = saved.activity_reference === current.activity_reference;
    
    console.log('=== SAVED DATA VALIDATION ===');
    console.log('Destination match:', destinationMatch, '(saved:', saved.destination, 'current:', current.destination, ')');
    console.log('Departure date match:', departureDateMatch);
    console.log('Return date match:', returnDateMatch);
    console.log('Adult count match:', adultMatch);
    console.log('Children count match:', childrenMatch);
    console.log('Activity reference match:', activityMatch);
    
    const isValid = destinationMatch && departureDateMatch && returnDateMatch && 
                   adultMatch && childrenMatch && activityMatch;
    
    console.log('Saved data is valid:', isValid);
    return isValid;
  },

  // Filter itinerary based on date range
  filterItineraryByDateRange(itinerary, departureDate, returnDate) {
    if (!departureDate || !returnDate || !itinerary) {
      return itinerary;
    }
    
    try {
      const startDate = new Date(departureDate);
      const endDate = new Date(returnDate);
      const timeDiff = endDate.getTime() - startDate.getTime();
      const expectedDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end days
      
      console.log('Filtering itinerary: Expected days =', expectedDays, 'Received days =', itinerary.length);
      
      // If we have more days than expected, trim to the expected number
      if (itinerary.length > expectedDays) {
        console.log('Trimming itinerary from', itinerary.length, 'to', expectedDays, 'days');
        return itinerary.slice(0, expectedDays);
      }
      
      return itinerary;
    } catch (error) {
      console.warn('Error filtering itinerary by date range:', error);
      return itinerary;
    }
  },

  // Convert old format time data to new format
  convertTimeDataFormat(timeData) {
    if (!timeData || timeData.length === 0) {
      return [];
    }

    // If it's already an array of objects with slot/activity, return as is (new format)
    if (Array.isArray(timeData) && timeData.length > 0 && timeData[0].slot && timeData[0].activity) {
      return timeData;
    }

    // If it's an array of old format objects, convert each one
    if (Array.isArray(timeData)) {
      const convertedData = [];
      timeData.forEach(function(timeSlot) {
        const converted = this.convertSingleTimeSlot(timeSlot);
        // Use concat instead of spread operator for compatibility
        convertedData.push.apply(convertedData, converted);
      }.bind(this));
      return convertedData;
    }

    // If it's a single object, convert it
    return this.convertSingleTimeSlot(timeData);
  },

  // Convert a single time slot object from old format to new format
  convertSingleTimeSlot(timeSlot) {
    const result = [];
    const timeSlots = ['morning', 'afternoon', 'evening'];
    
    timeSlots.forEach(function(slot) {
      if (timeSlot[slot] && timeSlot[slot].trim().length > 0) {
        result.push({
          slot: slot,
          activity: timeSlot[slot],
          checked: timeSlot.checked || false
        });
      }
    });
    
    // If no time-specific properties found, but there's a generic activity, use it
    if (result.length === 0 && timeSlot.activity && timeSlot.activity !== 'Activity not available') {
      result.push({
        slot: 'morning', // Default to morning if no specific time
        activity: timeSlot.activity,
        checked: timeSlot.checked || false
      });
    }
    
    return result;
  },

  // Generate activity summary for a day
  generateActivitySummary(timeSlots) {
    if (!timeSlots || timeSlots.length === 0) {
      return 'No activities planned';
    }
    
    const activities = timeSlots.map(function(slot) {
      // Handle new format: {period: 'morning', activity: 'description'}
      if (slot.activity) {
        return slot.activity;
      }
      // Handle old format: {morning: 'description', afternoon: 'description', evening: 'description'}
      const oldFormatActivities = [];
      if (slot.morning) oldFormatActivities.push(slot.morning);
      if (slot.afternoon) oldFormatActivities.push(slot.afternoon);
      if (slot.evening) oldFormatActivities.push(slot.evening);
      return oldFormatActivities.join(' ');
    }).filter(function(activity) {
      return activity.length > 0;
    });
    
    if (activities.length === 0) {
      return 'No activities planned';
    }
    
    // Extract activity themes/types from descriptions
    const themes = [];
    const allActivities = activities.join(' ').toLowerCase();
    
    // Cultural/Religious themes
    if (allActivities.includes('temple') || allActivities.includes('cultural') || 
        allActivities.includes('traditional') || allActivities.includes('heritage') ||
        allActivities.includes('museum') || allActivities.includes('historic')) {
      themes.push('cultural sites');
    }
    
    // Beach/Water themes
    if (allActivities.includes('beach') || allActivities.includes('water') || 
        allActivities.includes('swim') || allActivities.includes('surf') ||
        allActivities.includes('diving') || allActivities.includes('snorkel')) {
      themes.push('beach activities');
    }
    
    // Nature/Adventure themes
    if (allActivities.includes('hike') || allActivities.includes('trek') || 
        allActivities.includes('mountain') || allActivities.includes('nature') ||
        allActivities.includes('park') || allActivities.includes('forest') ||
        allActivities.includes('safari') || allActivities.includes('zoo')) {
      themes.push('nature & adventure');
    }
    
    // Food/Dining themes
    if (allActivities.includes('dinner') || allActivities.includes('lunch') || 
        allActivities.includes('food') || allActivities.includes('restaurant') ||
        allActivities.includes('culinary') || allActivities.includes('market')) {
      themes.push('dining');
    }
    
    // Shopping themes
    if (allActivities.includes('shop') || allActivities.includes('market') || 
        allActivities.includes('souvenir') || allActivities.includes('craft')) {
      themes.push('shopping');
    }
    
    // Entertainment themes
    if (allActivities.includes('show') || allActivities.includes('performance') || 
        allActivities.includes('dance') || allActivities.includes('entertainment')) {
      themes.push('entertainment');
    }
    
    // Relaxation themes
    if (allActivities.includes('relax') || allActivities.includes('spa') || 
        allActivities.includes('rest') || allActivities.includes('pool') ||
        allActivities.includes('hot spring')) {
      themes.push('relaxation');
    }
    
    // If no specific themes found, create generic summary
    if (themes.length === 0) {
      if (activities.length === 1) {
        return activities[0].substring(0, 50) + (activities[0].length > 50 ? '...' : '');
      } else {
        return activities.length + ' activities planned';
      }
    }
    
    // Remove duplicates and join themes
    const uniqueThemes = themes.filter(function(theme, index) {
      return themes.indexOf(theme) === index;
    });
    
    return uniqueThemes.join(', ');
  },

  // Toggle day expansion
  onDayToggle(e) {
    const dayId = e.currentTarget.dataset.dayId;
    const expandedDays = Object.assign({}, this.data.expandedDays);
    
    // Toggle the expanded state
    expandedDays[dayId] = !expandedDays[dayId];
    
    this.setData({ expandedDays: expandedDays });
  },

  // Toggle activity checkbox
  onActivityToggle(e) {
    const dayId = e.currentTarget.dataset.dayId;
    const timeIndex = parseInt(e.currentTarget.dataset.timeIndex);
    
    if (dayId === undefined || timeIndex === undefined) return;

    const itinerary = this.data.itinerary.slice();
    const dayIndex = itinerary.findIndex(function(day) {
      return day.id == dayId;
    });
    
    if (dayIndex !== -1 && itinerary[dayIndex].time && itinerary[dayIndex].time[timeIndex]) {
      // Toggle the checked state
      itinerary[dayIndex].time[timeIndex].checked = !itinerary[dayIndex].time[timeIndex].checked;
      
      this.setData({
        itinerary: itinerary
      });
    }
  },

  // Toggle packing item checkbox
  onPackingToggle(e) {
    const dayId = e.currentTarget.dataset.dayId;
    const packingIndex = parseInt(e.currentTarget.dataset.packingIndex);
    
    if (dayId === undefined || packingIndex === undefined) return;

    const itinerary = this.data.itinerary.slice();
    const dayIndex = itinerary.findIndex(function(day) {
      return day.id == dayId;
    });
    
    if (dayIndex !== -1 && itinerary[dayIndex].packingItem && itinerary[dayIndex].packingItem[packingIndex]) {
      const packingItem = itinerary[dayIndex].packingItem[packingIndex];
      
      // Handle both string and object formats
      if (typeof packingItem === 'string') {
        // Convert string to object with checked state
        itinerary[dayIndex].packingItem[packingIndex] = {
          name: packingItem,
          checked: true
        };
      } else {
        // Toggle existing object
        packingItem.checked = !packingItem.checked;
      }
      
      this.setData({
        itinerary: itinerary
      });
    }
  },

  // Retry loading
  onRetry() {
    this.loadSuggestions();
  },

  // Go back to form (Plan New Trip)
  onBack() {
    console.log('Planning new trip - navigating back to form...');
    
    // Navigate back to form page (form will clear data on show)
    my.navigateBack();
  },

  // Save itinerary
  onSave() {
    try {
      const travelParams = {
        destination: this.data.destination,
        departure_date: this.data.departure_date,
        return_date: this.data.return_date,
        adult: getTravelData().adult || 1,
        children: getTravelData().children || 0,
        activity_reference: getTravelData().activity_reference || ''
      };
      
      const savedKey = saveItinerary(this.data.itinerary, travelParams);
      
      if (savedKey) {
        // Show success toast
        my.showToast({
          content: 'Itinerary saved successfully!',
          type: 'success',
          duration: 2000
        });
        console.log('Itinerary saved successfully with key:', savedKey);
      } else {
        // Show error toast
        my.showToast({
          content: 'Failed to save itinerary',
          type: 'fail',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Error saving itinerary:', error);
      my.showToast({
        content: 'Failed to save itinerary',
        type: 'fail',
        duration: 2000
      });
    }
  },

  onShareAppMessage() {
    const destination = this.data.destination;
    const departure_date = this.data.departure_date;
    const return_date = this.data.return_date;
    
    return {
      title: 'Check out my ' + destination + ' travel plan!',
      desc: departure_date + ' - ' + return_date,
      path: 'pages/suggestions/suggestions'
    };
  },
});

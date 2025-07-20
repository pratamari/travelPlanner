import { getTravelSuggestions, saveTravelSuggestions, getSavedTravelSuggestions, getTravelData } from '../../utils/api.js';

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
    console.log('DEBUGGING - loadSuggestions called');
    try {
      this.setData({ loading: true, error: '' });
      console.log('DEBUGGING - Set loading state');

      // First try to get from local storage
      console.log('DEBUGGING - Checking saved suggestions');
      const savedSuggestions = null; // Force using fresh API data
      console.log('DEBUGGING - Saved suggestions (forced null):', savedSuggestions);
      if (savedSuggestions && savedSuggestions.itinerary) {
        console.log('DEBUGGING - Using saved data, processing', savedSuggestions.itinerary.length, 'days');
        console.log('DEBUGGING - First saved day structure:', savedSuggestions.itinerary[0]);
        
        // Generate activity summaries for saved data
        const savedItineraryWithSummaries = savedSuggestions.itinerary.map(function(day) {
          console.log('DEBUGGING - Processing saved day:', day.id, 'with time:', day.time);
          const activitySummary = this.generateActivitySummary(day.time || []);
          console.log('DEBUGGING - Generated summary for saved day', day.id, ':', activitySummary);
          return Object.assign({}, day, { activitySummary: activitySummary });
        }.bind(this));
        
        console.log('DEBUGGING - Final saved itinerary with summaries:', savedItineraryWithSummaries);
        
        // Initialize all days as collapsed (no auto-expand)
        const expandedDays = {};
        
        this.setData({
          itinerary: savedItineraryWithSummaries,
          loading: false,
          expandedDays: expandedDays
        });
        
        console.log('DEBUGGING - Set saved data, page itinerary length:', this.data.itinerary.length);
        return;
      }

      // If no saved data, get from API
      console.log('DEBUGGING - No saved data, getting from API');
      const travelData = getTravelData();
      console.log('DEBUGGING - Travel data:', travelData);
      if (!travelData) {
        throw new Error('No travel data found');
      }

      console.log('DEBUGGING - Calling getTravelSuggestions');
      const response = await getTravelSuggestions(travelData);
      console.log('DEBUGGING - Got API response:', response);
      
      if (response.success && response.data && response.data.itinerary) {
      
      // DEBUG: Check what we received
      console.log('DEBUGGING - Raw API data:');
      console.log('Total days:', response.data.itinerary.length);
      console.log('Full itinerary:', response.data.itinerary);
      
      // Save suggestions locally
      saveTravelSuggestions(response.data);
      
      // Generate activity summaries for each day
      const itineraryWithSummaries = response.data.itinerary.map(function(day) {
        console.log('Processing day:', day.id, 'with time slots:', day.time);
        const activitySummary = this.generateActivitySummary(day.time || []);
        console.log('Generated summary for day', day.id, ':', activitySummary);
        return Object.assign({}, day, { activitySummary: activitySummary });
      }.bind(this));
      
      console.log('Final itinerary with summaries:', itineraryWithSummaries);
      
      // Initialize all days as collapsed (no auto-expand)
      const expandedDays = {};
      
      this.setData({
        itinerary: itineraryWithSummaries,
        loading: false,
        expandedDays: expandedDays
      });
      
      // DEBUG: Check what was actually set
      console.log('DEBUGGING - After setData:');
      console.log('Page itinerary length:', this.data.itinerary.length);
      console.log('Page itinerary:', this.data.itinerary);
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

  // Handle activity tap
  onActivityTap(e) {
    const activity = e.currentTarget.dataset.activity;
    const day = e.currentTarget.dataset.day;
    
    if (!activity) return;

    // Navigate to detail page with activity data
    my.navigateTo({
      url: '/pages/detail/detail?activity=' + encodeURIComponent(activity) + '&day=' + encodeURIComponent(day)
    });
  },

  // Retry loading
  onRetry() {
    this.loadSuggestions();
  },

  // Go back to form
  onBack() {
    my.navigateBack();
  },

  // Share itinerary
  onShare() {
    const destination = this.data.destination;
    const departure_date = this.data.departure_date;
    const return_date = this.data.return_date;
    
    my.showShareMenu({
      title: 'My ' + destination + ' Travel Plan',
      desc: departure_date + ' - ' + return_date,
      path: 'pages/suggestions/suggestions'
    });
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

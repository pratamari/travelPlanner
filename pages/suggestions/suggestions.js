import { getTravelSuggestions, saveTravelSuggestions, getSavedTravelSuggestions, getTravelData } from '../../utils/api.js';

Page({
  data: {
    itinerary: [],
    loading: true,
    error: '',
    destination: '',
    departure_date: '',
    return_date: ''
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

      // First try to get from local storage
      const savedSuggestions = getSavedTravelSuggestions();
      if (savedSuggestions && savedSuggestions.itinerary) {
        this.setData({
          itinerary: savedSuggestions.itinerary,
          loading: false
        });
        return;
      }

      // If no saved data, get from API
      const travelData = getTravelData();
      if (!travelData) {
        throw new Error('No travel data found');
      }

      const response = await getTravelSuggestions(travelData);
      
      if (response.success && response.data && response.data.itinerary) {
        // Save suggestions locally
        saveTravelSuggestions(response.data);
        
        this.setData({
          itinerary: response.data.itinerary,
          loading: false
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

  // Handle activity tap
  onActivityTap(e) {
    const { activity, day } = e.currentTarget.dataset;
    
    if (!activity) return;

    // Navigate to detail page with activity data
    my.navigateTo({
      url: `/pages/detail/detail?activity=${encodeURIComponent(activity)}&day=${encodeURIComponent(day)}`
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
    const { destination, departure_date, return_date } = this.data;
    
    my.showShareMenu({
      title: `My ${destination} Travel Plan`,
      desc: `${departure_date} - ${return_date}`,
      path: 'pages/suggestions/suggestions'
    });
  },

  onShareAppMessage() {
    const { destination, departure_date, return_date } = this.data;
    
    return {
      title: `Check out my ${destination} travel plan!`,
      desc: `${departure_date} - ${return_date}`,
      path: 'pages/suggestions/suggestions',
    };
  },
});

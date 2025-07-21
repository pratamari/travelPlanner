import { getTravelSuggestions, saveTravelData, getTravelData, clearAllTravelData } from '../../utils/api.js';

Page({
  data: {
    formData: {
      destination: '',
      departure_date: '',
      return_date: '',
      adult: 1,
      children: 0,
      activity_reference: ''
    },
    loading: false
  },

  onLoad(query) {
    console.info(`Travel Planner loaded with query: ${JSON.stringify(query)}`);
  },

  onReady() {
    // Page loading is complete
  },

  onShow() {
    // Page display - clear data and reset form every time page is shown
    console.log('Index page shown - clearing all previous travel data for fresh start...');
    clearAllTravelData();
    
    // Reset form data to defaults
    this.setData({
      formData: {
        destination: '',
        departure_date: '',
        return_date: '',
        adult: 1,
        children: 0,
        activity_reference: ''
      }
    });
  },

  onHide() {
    // Page hidden
  },

  onUnload() {
    // Page is closed
  },

  // Form input handlers
  onDestinationInput(e) {
    this.setData({
      'formData.destination': e.detail.value
    });
  },

  onDepartureDateChange(e) {
    this.setData({
      'formData.departure_date': e.detail.value
    });
  },

  onReturnDateChange(e) {
    this.setData({
      'formData.return_date': e.detail.value
    });
  },

  onActivityInput(e) {
    this.setData({
      'formData.activity_reference': e.detail.value
    });
  },

  // Counter handlers
  increaseAdult() {
    this.setData({
      'formData.adult': this.data.formData.adult + 1
    });
  },

  decreaseAdult() {
    if (this.data.formData.adult > 1) {
      this.setData({
        'formData.adult': this.data.formData.adult - 1
      });
    }
  },

  increaseChildren() {
    this.setData({
      'formData.children': this.data.formData.children + 1
    });
  },

  decreaseChildren() {
    if (this.data.formData.children > 0) {
      this.setData({
        'formData.children': this.data.formData.children - 1
      });
    }
  },

  // Form validation
  validateForm() {
    const { destination, departure_date, return_date } = this.data.formData;
    
    if (!destination.trim()) {
      my.showToast({
        content: 'Please enter destination',
        type: 'fail'
      });
      return false;
    }

    if (!departure_date) {
      my.showToast({
        content: 'Please select departure date',
        type: 'fail'
      });
      return false;
    }

    if (!return_date) {
      my.showToast({
        content: 'Please select return date',
        type: 'fail'
      });
      return false;
    }

    if (new Date(departure_date) >= new Date(return_date)) {
      my.showToast({
        content: 'Return date must be after departure date',
        type: 'fail'
      });
      return false;
    }

    return true;
  },

  // Submit form
  async onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    this.setData({ loading: true });

    try {
      // Debug: Log form data before sending
      console.log('=== FORM SUBMISSION DEBUG ===');
      console.log('Form data being sent:', JSON.stringify(this.data.formData, null, 2));
      
      // Save form data locally
      saveTravelData(this.data.formData);

      // Call Hermes API
      const response = await getTravelSuggestions(this.data.formData);

      if (response.success) {
        // Navigate to suggestions page
        my.navigateTo({
          url: '/pages/suggestions/suggestions'
        });
      } else {
        my.showToast({
          content: response.error || 'Failed to get travel suggestions',
          type: 'fail'
        });
      }
    } catch (error) {
      console.error('Submit error:', error);
      my.showToast({
        content: 'Something went wrong. Please try again.',
        type: 'fail'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  onShareAppMessage() {
    return {
      title: 'Travel Planner - Plan your perfect trip',
      desc: 'Get personalized travel suggestions and packing lists',
      path: 'pages/index/index',
    };
  },
});

Page({
  data: {
    activity: '',
    day: '',
    location: '',
    duration: '',
    cost: '',
    bestFor: '',
    description: '',
    tips: []
  },

  onLoad(query) {
    console.info(`Detail page loaded with query: ${JSON.stringify(query)}`);
    
    if (query.activity) {
      this.setData({
        activity: decodeURIComponent(query.activity)
      });
    }
    
    if (query.day) {
      this.setData({
        day: decodeURIComponent(query.day)
      });
    }

    // Generate mock details based on activity
    this.generateActivityDetails();
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

  // Generate mock activity details
  generateActivityDetails() {
    const activity = this.data.activity.toLowerCase();
    let details = {
      location: 'Location details will be provided',
      duration: '2-3 hours (estimated)',
      cost: 'Cost varies',
      bestFor: 'All travelers',
      description: 'This activity offers a wonderful experience that aligns with your travel preferences. More detailed information will be available when you book or visit the location.',
      tips: [
        'Book in advance for better prices',
        'Check weather conditions before visiting',
        'Bring comfortable walking shoes'
      ]
    };

    // Customize based on activity type
    if (activity.includes('beach') || activity.includes('swimming')) {
      details = {
        ...details,
        duration: '3-4 hours',
        bestFor: 'Beach lovers, families',
        description: 'Enjoy pristine beaches with crystal clear waters. Perfect for swimming, sunbathing, and water sports.',
        tips: [
          'Bring sunscreen and water',
          'Best time is early morning or late afternoon',
          'Check tide schedules for swimming'
        ]
      };
    } else if (activity.includes('temple') || activity.includes('cultural') || activity.includes('museum')) {
      details = {
        ...details,
        duration: '1-2 hours',
        bestFor: 'Culture enthusiasts, history lovers',
        description: 'Immerse yourself in local culture and history. Learn about traditions and architectural marvels.',
        tips: [
          'Dress modestly and respectfully',
          'Photography may be restricted',
          'Consider hiring a local guide'
        ]
      };
    } else if (activity.includes('food') || activity.includes('restaurant') || activity.includes('dining')) {
      details = {
        ...details,
        duration: '1-2 hours',
        bestFor: 'Food lovers, culinary adventurers',
        description: 'Experience authentic local cuisine and flavors. Discover traditional dishes and cooking methods.',
        tips: [
          'Try local specialties',
          'Ask about spice levels',
          'Make reservations for popular spots'
        ]
      };
    } else if (activity.includes('shopping') || activity.includes('market')) {
      details = {
        ...details,
        duration: '2-4 hours',
        bestFor: 'Shoppers, souvenir hunters',
        description: 'Explore local markets and shops. Find unique souvenirs and experience local commerce.',
        tips: [
          'Bargaining is often expected',
          'Bring cash for small vendors',
          'Check customs regulations for purchases'
        ]
      };
    } else if (activity.includes('nature') || activity.includes('hiking') || activity.includes('outdoor')) {
      details = {
        ...details,
        duration: '3-5 hours',
        bestFor: 'Nature lovers, adventure seekers',
        description: 'Connect with nature and enjoy outdoor activities. Experience beautiful landscapes and fresh air.',
        tips: [
          'Wear appropriate hiking gear',
          'Bring plenty of water',
          'Check weather conditions'
        ]
      };
    }

    this.setData(details);
  },

  // Go back to previous page
  onBack() {
    my.navigateBack();
  },

  // Add to favorites
  onAddToFavorites() {
    try {
      // Get existing favorites
      const favoritesResult = my.getStorageSync({
        key: 'favorite_activities'
      });
      
      let favorites = [];
      if (favoritesResult.data) {
        favorites = JSON.parse(favoritesResult.data);
      }

      // Check if already in favorites
      const isAlreadyFavorite = favorites.some(fav => 
        fav.activity === this.data.activity && fav.day === this.data.day
      );

      if (isAlreadyFavorite) {
        my.showToast({
          content: 'Already in favorites!',
          type: 'success'
        });
        return;
      }

      // Add to favorites
      favorites.push({
        activity: this.data.activity,
        day: this.data.day,
        timestamp: Date.now()
      });

      // Save to storage
      my.setStorageSync({
        key: 'favorite_activities',
        data: JSON.stringify(favorites)
      });

      my.showToast({
        content: 'Added to favorites!',
        type: 'success'
      });
    } catch (error) {
      console.error('Add to favorites error:', error);
      my.showToast({
        content: 'Failed to add to favorites',
        type: 'fail'
      });
    }
  },

  // Get directions
  onGetDirections() {
    my.showToast({
      content: 'Opening map directions...',
      type: 'success'
    });

    // In a real app, this would open maps with the location
    // For now, we'll show a placeholder message
    setTimeout(() => {
      my.showModal({
        title: 'Directions',
        content: 'Map integration would open here with directions to the activity location.',
        showCancel: false,
        confirmText: 'OK'
      });
    }, 1000);
  },

  onShareAppMessage() {
    return {
      title: `Check out this activity: ${this.data.activity}`,
      desc: `${this.data.day} activity recommendation`,
      path: `pages/detail/detail?activity=${encodeURIComponent(this.data.activity)}&day=${encodeURIComponent(this.data.day)}`,
    };
  },
});

# Travel Planner - Alipay Mini Program

A comprehensive travel planning mini program built for Alipay platform that helps users create personalized travel itineraries with activity suggestions and packing recommendations.

## Features

### 🎯 Core Functionality
- **Smart Travel Planning**: Input destination, dates, travelers, and preferences
- **AI-Powered Suggestions**: Get personalized daily itineraries via Hermes API
- **Activity Details**: Tap any activity for detailed information and tips
- **Packing Lists**: Receive customized packing recommendations for each day
- **Local Storage**: Save preferences and access offline

### 📱 User Experience
- **Mobile-First Design**: Optimized for Alipay Mini Program environment
- **Alipay Design System**: Consistent with platform UI/UX standards
- **Smooth Navigation**: Seamless flow between form, suggestions, and details
- **Loading States**: Beautiful loading animations and error handling
- **Responsive Layout**: Works perfectly on all mobile screen sizes

## Project Structure

```
/
├── app.js                 # Main app configuration
├── app.json              # App routing and window settings
├── app.acss              # Global styles
├── constants/
│   └── index.js          # API constants (Hermes configuration)
├── utils/
│   └── api.js            # API utilities and local storage helpers
├── pages/
│   ├── index/            # Travel planning form page
│   │   ├── index.axml    # Form UI template
│   │   ├── index.js      # Form logic and validation
│   │   ├── index.acss    # Form styles
│   │   └── index.json    # Page configuration
│   ├── suggestions/      # Travel suggestions page
│   │   ├── suggestions.axml  # Itinerary display template
│   │   ├── suggestions.js    # Suggestions logic
│   │   ├── suggestions.acss  # Suggestions styles
│   │   └── suggestions.json  # Page configuration
│   └── detail/           # Activity detail page
│       ├── detail.axml   # Detail view template
│       ├── detail.js     # Detail page logic
│       ├── detail.acss   # Detail page styles
│       └── detail.json   # Page configuration
└── README.md            # This file
```

## API Integration

### Hermes API Configuration
The app integrates with Hermes API for travel suggestions:

```javascript
// Request Format
{
  "destination": "Bali, Indonesia",
  "departure_date": "2024-07-20",
  "return_date": "2024-07-25",
  "adults": 2,
  "children": 0,
  "activity_reference": "beach activities, cultural tours"
}

// Response Format
{
  "itinerary": [
    {
      "id": "1",
      "day": "Day 1",
      "time": [
        {
          "morning": "Visit Uluwatu Temple",
          "afternoon": "Kuta Beach relaxation",
          "evening": "Traditional Balinese dinner"
        }
      ],
      "packingItem": [
        "Sunscreen",
        "Beach towel",
        "Comfortable sandals",
        "Light jacket"
      ]
    }
  ]
}
```

### Local Storage
- **travel_data**: User form inputs
- **travel_suggestions**: API responses
- **favorite_activities**: User's favorite activities

## Key Components

### 1. Travel Planning Form (`pages/index/`)
- Destination input with validation
- Native Alipay date pickers for travel dates
- Counter controls for travelers (adults/children)
- Activity preference textarea
- Form validation and error handling
- Loading states during API calls

### 2. Suggestions Page (`pages/suggestions/`)
- Daily itinerary display
- Time-based activity organization (Morning/Afternoon/Evening)
- Packing item recommendations
- Tap-to-detail navigation
- Share functionality
- Error handling and retry options

### 3. Activity Detail Page (`pages/detail/`)
- Comprehensive activity information
- Smart content generation based on activity type
- Tips and recommendations
- Add to favorites functionality
- Directions integration placeholder
- Social sharing capabilities

## Development Setup

### Prerequisites
- Alipay Mini Program IDE
- Access to Hermes API (configured in `constants/index.js`)

### Installation
1. Clone the repository
2. Open in Alipay Mini Program IDE
3. Configure API credentials in `constants/index.js`
4. Build and run in simulator or device

### API Configuration
Update the following constants in `constants/index.js`:
```javascript
export const HERMES_KEY = 'your-api-key'
export const HERMES_URL = 'your-api-endpoint'
export const HERMES_USER = 'your-username'
```

## Design System

### Colors
- **Primary**: `#1677ff` (Alipay Blue)
- **Secondary**: `#0958d9` (Dark Blue)
- **Background**: `#f7f7f7` (Light Gray)
- **Success**: `#52c41a` (Green)
- **Error**: `#ff4d4f` (Red)

### Typography
- **Titles**: 48rpx, bold
- **Headings**: 36rpx, semi-bold
- **Body**: 30rpx, regular
- **Captions**: 28rpx, regular

### Spacing
- **Large**: 48rpx
- **Medium**: 32rpx
- **Small**: 24rpx
- **XSmall**: 16rpx

## Features in Detail

### Smart Form Validation
- Real-time input validation
- Date logic validation (return after departure)
- Required field checking
- User-friendly error messages

### Responsive Design
- Mobile-first approach
- Flexible layouts for different screen sizes
- Touch-friendly interactive elements
- Optimized for one-handed use

### Performance Optimization
- Local storage for offline access
- Efficient API caching
- Minimal re-renders
- Optimized image and asset loading

### Accessibility
- Clear visual hierarchy
- High contrast ratios
- Touch target sizing
- Screen reader friendly

## Future Enhancements

### Planned Features
- [ ] Map integration for activity locations
- [ ] Weather information integration
- [ ] Budget tracking and expense management
- [ ] Photo sharing and travel journal
- [ ] Social features (share with friends)
- [ ] Offline mode improvements
- [ ] Multi-language support
- [ ] Currency conversion
- [ ] Transportation suggestions
- [ ] Hotel recommendations

### Technical Improvements
- [ ] Unit testing implementation
- [ ] Performance monitoring
- [ ] Error tracking and analytics
- [ ] A/B testing framework
- [ ] Progressive Web App features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the Alipay Mini Program documentation

---

**Built with ❤️ for travelers by travelers**

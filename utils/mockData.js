/**
 * Mock data for testing Travel Planner without API
 * This can be used during development or as fallback data
 */

export const mockTravelSuggestions = {
  itinerary: [
    {
      id: "1",
      day: "Day 1",
      time: [
        {
          morning: "Visit Uluwatu Temple - Experience traditional Balinese architecture and stunning cliff-top views",
          afternoon: "Kuta Beach relaxation - Enjoy pristine white sand beaches and crystal clear waters",
          evening: "Traditional Balinese dinner at Jimbaran Bay - Fresh seafood with sunset views"
        }
      ],
      packingItem: [
        "Sunscreen SPF 50+",
        "Beach towel",
        "Comfortable sandals",
        "Light jacket for evening",
        "Camera for temple photos",
        "Swimwear"
      ]
    },
    {
      id: "2", 
      day: "Day 2",
      time: [
        {
          morning: "Tegallalang Rice Terraces - Explore UNESCO World Heritage rice paddies",
          afternoon: "Ubud Monkey Forest Sanctuary - Wildlife encounter and nature walk",
          evening: "Traditional Kecak Fire Dance performance - Cultural entertainment"
        }
      ],
      packingItem: [
        "Hiking shoes",
        "Insect repellent",
        "Water bottle",
        "Hat for sun protection",
        "Light backpack",
        "Cash for entrance fees"
      ]
    },
    {
      id: "3",
      day: "Day 3", 
      time: [
        {
          morning: "Mount Batur sunrise trek - Adventure hiking with panoramic views",
          afternoon: "Natural hot springs relaxation - Therapeutic mineral baths",
          evening: "Ubud traditional market shopping - Local crafts and souvenirs"
        }
      ],
      packingItem: [
        "Warm jacket for early morning",
        "Headlamp or flashlight",
        "Energy snacks",
        "Extra clothes for hot springs",
        "Waterproof bag",
        "Comfortable trekking shoes"
      ]
    }
  ]
};

export const mockDestinations = [
  "Bali, Indonesia",
  "Tokyo, Japan", 
  "Paris, France",
  "New York, USA",
  "London, UK",
  "Bangkok, Thailand",
  "Singapore",
  "Seoul, South Korea"
];

export const mockActivityTypes = [
  "Beach and water activities",
  "Cultural and historical sites", 
  "Adventure and outdoor sports",
  "Food and culinary experiences",
  "Shopping and markets",
  "Nightlife and entertainment",
  "Nature and wildlife",
  "Art and museums"
];

/**
 * Generate mock suggestions based on destination
 * @param {string} destination - Travel destination
 * @returns {Object} Mock itinerary data
 */
export const generateMockSuggestions = (destination) => {
  const destinationLower = destination.toLowerCase();
  
  if (destinationLower.includes('bali')) {
    return mockTravelSuggestions;
  }
  
  if (destinationLower.includes('tokyo') || destinationLower.includes('japan')) {
    return {
      itinerary: [
        {
          id: "1",
          day: "Day 1",
          time: [
            {
              morning: "Senso-ji Temple in Asakusa - Ancient Buddhist temple experience",
              afternoon: "Tokyo Skytree observation deck - Panoramic city views",
              evening: "Shibuya Crossing and dinner in Harajuku - Urban culture immersion"
            }
          ],
          packingItem: [
            "Comfortable walking shoes",
            "Portable WiFi device", 
            "Cash (Japan is cash-heavy)",
            "Light jacket",
            "Camera",
            "JR Pass"
          ]
        }
      ]
    };
  }
  
  if (destinationLower.includes('paris') || destinationLower.includes('france')) {
    return {
      itinerary: [
        {
          id: "1", 
          day: "Day 1",
          time: [
            {
              morning: "Eiffel Tower visit and Trocadéro gardens - Iconic landmark experience",
              afternoon: "Louvre Museum tour - World-class art collection",
              evening: "Seine River cruise with dinner - Romantic city views"
            }
          ],
          packingItem: [
            "Comfortable walking shoes",
            "Light scarf",
            "Museum pass",
            "Umbrella",
            "Elegant dinner outfit",
            "Portable charger"
          ]
        }
      ]
    };
  }
  
  // Default generic suggestions
  return {
    itinerary: [
      {
        id: "1",
        day: "Day 1", 
        time: [
          {
            morning: "Explore main city attractions - Discover local landmarks",
            afternoon: "Visit cultural sites and museums - Learn about local history",
            evening: "Try local cuisine at recommended restaurants - Authentic dining experience"
          }
        ],
        packingItem: [
          "Comfortable walking shoes",
          "Camera or smartphone",
          "Local currency",
          "Weather-appropriate clothing",
          "Travel guidebook or app",
          "Portable charger"
        ]
      }
    ]
  };
};

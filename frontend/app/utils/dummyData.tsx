export const dummyFormData = {
    "tool_name": "form",
    "form_data": {
      "title": "Apartment Search Form",
      "fields": [
        {"type": "slider", "name": "budget", "label": "Monthly Budget", "min": 500, "max": 5000, "step": 100},
        {"type": "checkbox", "name": "amenities", "label": "Amenities", "options": ["Gym", "BBQ Zone", "Swimming Pool", "Covered Parking", "In-unit Laundry", "Pet-friendly", "Balcony/Patio"]},
        {"type": "number", "name": "family_size", "label": "Family Size"},
        {"type": "date", "name": "move_in_date", "label": "Move-in Date"}
      ]
    }
  }


export const dummyAddressReviewData = {
    "tool_name": "address_review",
    "places": [
      {
        "address": "123 Market St, San Francisco, CA 94105",
        "reviews": [
          {"rating": 4.5, "text": "Great location, close to public transport"},
          {"rating": 4.0, "text": "Nice neighborhood, but a bit noisy"}
        ],
        "description": "Modern apartment complex in the heart of downtown San Francisco"
      },
      {
        "address": "456 Valencia St, San Francisco, CA 94103",
        "reviews": [
          {"rating": 4.8, "text": "Amazing restaurants and cafes nearby"},
          {"rating": 4.2, "text": "Vibrant area with lots of street art"}
        ],
        "description": "Charming Victorian-style building in the trendy Mission District"
      },
      {
        "address": "789 Lombard St, San Francisco, CA 94133",
        "reviews": [
          {"rating": 4.7, "text": "Stunning views of the bay and Golden Gate Bridge"},
          {"rating": 4.5, "text": "Quiet neighborhood with easy access to tourist attractions"}
        ],
        "description": "Luxurious apartments on the famous crooked street with panoramic city views"
      }
    ]
  }
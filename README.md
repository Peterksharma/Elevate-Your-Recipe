# Elevate Your Recipe - High Altitude Baking Calculator

Elevate Your Recipe is a web-based high altitude baking calculator designed to enhance your cooking experience. It works by adjusting recipes based on your elevation to ensure perfect results when baking at high altitudes. This tool is perfect for those who love to experiment with baking and want to personalize recipes they find online to the elevation they are baking at.

## 🌟 Features

- **Manual Recipe Input**: Enter your recipe ingredients and instructions manually
- **Elevation Adjustment**: Adjust recipes for elevations from 0 to 15,000 feet
- **Smart Calculations**: Automatically adjusts flour, sugar, leavening agents, liquids, and temperatures
- **Real-time Processing**: See adjustments happen instantly as you change elevation
- **Print & Save**: Print adjusted recipes or save them as JSON files
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Beautiful UI**: Modern, clean interface with smooth animations

## 🚀 Quick Start

### Option 1: Local Development
1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start adjusting recipes!

### Option 2: Web Hosting
1. Upload all files to your web server
2. Ensure the `images/` folder is included
3. Access via your domain

## 📖 How to Use

### 1. Enter Your Recipe
- **Recipe Title**: Give your recipe a name
- **Recipe URL** (optional): Paste a recipe URL for reference
- **Ingredients**: Enter ingredients one per line (e.g., "2 cups all-purpose flour")
- **Instructions**: Enter cooking instructions step by step

### 2. Set Your Elevation
- Use the slider to set your elevation (0-15,000 feet)
- The calculator will automatically adjust for high altitude conditions

### 3. Get Adjusted Recipe
- Click "Adjust Recipe for Elevation" to see the changes
- Compare original vs. adjusted measurements side by side
- Print or save your adjusted recipe

## 🔧 How It Works

The calculator applies proven high altitude baking adjustments:

### Flour Adjustments
- **Below 3,000 ft**: No changes needed
- **3,000-5,000 ft**: Increase by 1 tbsp per cup
- **Above 5,000 ft**: Additional increases for every 1,500 ft

### Leavening Agents (Baking Powder/Soda)
- **3,000 ft**: Reduce by 1/8
- **5,000 ft**: Reduce by 1/4
- **7,000+ ft**: Reduce by 1/3

### Sugar Adjustments
- **3,000-5,000 ft**: Reduce by 1 tbsp per cup
- **Above 5,000 ft**: Reduce by 2 tbsp per cup

### Liquid Adjustments
- **3,000-5,000 ft**: Increase by 1-2 tbsp per cup
- **Above 5,000 ft**: Additional increases for every 1,500 ft

### Temperature Adjustments
- **3,000+ ft**: Increase by 25°F (15°C)

## 🛠️ Technical Details

### Supported Measurements
- **Volume**: cups, tablespoons (tbsp), teaspoons (tsp)
- **Fractions**: 1/2, 1/3, 1/4, 2/3, 3/4
- **Mixed Numbers**: 1 1/2, 2 1/4, etc.

### Supported Ingredients
- **Flour**: All-purpose, bread, cake, pastry, whole wheat, self-rising
- **Sugar**: Granulated, brown, powdered, confectioners', etc.
- **Leavening**: Baking powder, baking soda, yeast
- **Liquids**: Water, milk, buttermilk

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📁 File Structure

```
Elevate-Your-Recipe/
├── index.html              # Main HTML file
├── app.js                  # Main application logic
├── recipeAdjuster.js       # Elevation adjustment calculations
├── styles.css              # Responsive styling
├── images/                 # Logo and icons
│   ├── logo.png
│   ├── icon-16x16.png
│   ├── icon-48x48.png
│   └── icon-128x128.png
└── README.md               # This file
```

## 🎨 Customization

### Colors
Edit the CSS variables in `styles.css`:
```css
:root {
    --primary: #4a90e2;      /* Main blue color */
    --button-color: #4CAF50; /* Green button color */
    --text-color: #333;      /* Text color */
}
```

### Elevation Ranges
Modify adjustment ranges in `recipeAdjuster.js`:
```javascript
// Example: Change the base elevation threshold
if (this.altitude < 2500) return amount; // Instead of 3000
```

## 🤝 Contributing

We welcome contributions to Elevate Your Recipe! If you're interested in helping, you can:

- Report bugs and issues
- Suggest new features or improvements
- Contribute to the codebase
- Improve documentation

## 📞 Contact

For any queries or suggestions, feel free to reach out to Peter Sharma at peterksharma@gmail.com.

## 📄 License

This project is licensed under the ISC License.

---

**Thank you for using Elevate Your Recipe!** 🍰

*Perfect your high altitude baking with science-based adjustments.*

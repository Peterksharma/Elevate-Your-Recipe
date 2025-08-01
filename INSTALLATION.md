# Installation Guide

## Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

## Installation Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **For development (with auto-restart):**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   Open your browser and go to `http://localhost:3000`

## How It Works

### Recipe Extraction Process

1. **User enters a recipe URL** in the web interface
2. **Server fetches the webpage** using axios and cheerio
3. **Recipe data is extracted** using comprehensive regex patterns
4. **Data is cleaned and formatted** for display
5. **Original and adjusted recipes** are shown side by side

### Supported Recipe Websites

- AllRecipes.com
- FoodNetwork.com
- Epicurious.com
- BonAppétit.com
- KingArthurBaking.com
- SmittenKitchen.com
- Sally's Baking Addiction
- And many more (using general patterns)

### API Endpoint

- **POST** `/api/extract-recipe`
- **Body:** `{ "url": "https://example.com/recipe" }`
- **Response:** `{ "success": true, "recipe": { ... } }`

## Troubleshooting

### Common Issues

1. **"Failed to extract recipe"**
   - Check if the URL is accessible
   - Try a different recipe website
   - Some sites may block automated requests

2. **"Port already in use"**
   - Change the port in `server.js`: `const PORT = process.env.PORT || 3001;`
   - Or kill the process using port 3000

3. **Missing dependencies**
   - Run `npm install` again
   - Check if all packages are listed in `package.json`

### Development Tips

- Use `npm run dev` for development (auto-restart on file changes)
- Check server logs for extraction debugging
- Test with different recipe websites to improve patterns

## Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Environment Variables
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

## File Structure

```
Elevate-Your-Recipe/
├── server.js              # Express server with recipe extraction
├── index.html             # Main web interface
├── app.js                 # Frontend application logic
├── recipeAdjuster.js      # Elevation adjustment calculations
├── recipeExtractor.js     # Client-side extraction patterns
├── styles.css             # Responsive styling
├── package.json           # Dependencies and scripts
├── INSTALLATION.md        # This file
└── images/                # Logo and icons
```

## Dependencies

- **express**: Web server framework
- **cors**: Cross-origin resource sharing
- **axios**: HTTP client for fetching web pages
- **cheerio**: Server-side HTML parsing (like jQuery)
- **nodemon**: Development auto-restart (dev dependency) 
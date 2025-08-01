# Troubleshooting Guide

## Common Issues and Solutions

### 1. "405 Method Not Allowed" Error

**Problem:** You're getting a 405 error when trying to extract recipes.

**Solution:** Make sure the Express server is running:

```bash
# In your project directory
npm install
npm start
```

Then access the app at: `http://localhost:3000`

### 2. "Failed to execute 'json' on 'Response'" Error

**Problem:** JSON parsing error when calling the API.

**Solution:** This usually means the Express server isn't running or isn't accessible.

**Steps to fix:**
1. Check if the server is running: `http://localhost:3000` should show the app
2. If not running, start it: `npm start`
3. Check the browser console for the exact error

### 3. CORS Errors

**Problem:** Cross-origin request blocked by browser.

**Solution:** The server includes CORS headers, but if you're still having issues:

1. Make sure you're using the Express server (not just Live Server)
2. Access the app at `http://localhost:3000`
3. Don't mix Live Server with Express server

### 4. Port Already in Use

**Problem:** "EADDRINUSE" error when starting the server.

**Solution:**
```bash
# Option 1: Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Option 2: Use a different port
# Edit server.js and change:
const PORT = process.env.PORT || 3001;
```

### 5. Missing Dependencies

**Problem:** "Cannot find module" errors.

**Solution:**
```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### 6. Recipe Extraction Not Working

**Problem:** Recipes aren't being extracted from URLs.

**Possible causes:**
1. **Website blocking requests** - Some sites block automated requests
2. **Invalid URL** - Make sure the URL is a valid recipe page
3. **Unsupported website** - Try a different recipe site

**Test with these URLs:**
- AllRecipes: `https://www.allrecipes.com/recipe/...`
- Food Network: `https://www.foodnetwork.com/recipes/...`
- King Arthur: `https://www.kingarthurbaking.com/recipes/...`

### 7. Development Setup Issues

**Problem:** Changes not reflecting or server not restarting.

**Solution:**
```bash
# Use development mode with auto-restart
npm run dev
```

### 8. Browser Console Errors

**Common errors and fixes:**

**"fetch is not defined"**
- Use a modern browser (Chrome, Firefox, Safari, Edge)
- The app requires ES6+ features

**"Cannot read property of null"**
- Make sure all HTML elements exist
- Check if the DOM is fully loaded

**"Network Error"**
- Check if the Express server is running
- Verify the API URL is correct

## Quick Setup Checklist

- [ ] Node.js installed (version 14+)
- [ ] Dependencies installed (`npm install`)
- [ ] Express server running (`npm start`)
- [ ] Accessing app at `http://localhost:3000`
- [ ] No other servers running on port 3000
- [ ] Modern browser being used

## Testing the Setup

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Open browser to:** `http://localhost:3000`

3. **Test with a recipe URL:**
   - Try: `https://www.allrecipes.com/recipe/10813/best-chocolate-chip-cookies/`
   - Or any other recipe URL

4. **Check browser console** for any errors

## Getting Help

If you're still having issues:

1. **Check the server logs** in your terminal
2. **Check browser console** for JavaScript errors
3. **Verify the URL** you're trying to extract from
4. **Try a different recipe website**

## Development Tips

- Use `npm run dev` for development (auto-restart)
- Check server logs for debugging information
- Test with multiple recipe websites
- Use browser developer tools to inspect network requests 
console.log('Content script loaded');

// Listen for the message from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in content script:', request);
  if (request.action === 'findRecipe') {
    console.log('Received findRecipe action');
    
    const recipeData = {
      title: null,
      ingredients: [],
      instructions: [],
      parsedIngredients: {
        flour: [],
        leavener: [],
        liquid: [],
        sugar: []
      }
    };

    // Find and highlight title
    const recipeTitle = document.querySelector('h1');
    console.log('Found recipe title:', recipeTitle);
    if (recipeTitle) {
      recipeTitle.style.color = 'orange';
      recipeData.title = recipeTitle.textContent.trim();
    }
    
    // Find and highlight ingredients
    const ingredientSelectors = RECIPE_PATTERNS.recipeSelectors.ingredients.join(', ');
    console.log('Looking for ingredients with selectors:', ingredientSelectors);
    const ingredientElements = document.querySelectorAll(ingredientSelectors);
    console.log('Found ingredients:', ingredientElements.length);

    // Process ingredients, removing duplicates and cleaning up the text
    const processedIngredients = new Set();
    const allIngredients = [];
    const processedParsedIngredients = new Set(); // Add this for parsed ingredients deduplication

    // First, collect all individual ingredients
    ingredientElements.forEach(element => {
      element.style.color = 'red';
      const text = element.textContent.trim();
      
      // Split the text by the bullet point character and process each ingredient
      const ingredients = text.split('▢').filter(i => i.trim());
      ingredients.forEach(ingredient => {
        const cleanIngredient = ingredient.trim()
          .replace(/\s+/g, ' ') // normalize whitespace
          .replace(/^ingredients\s*:?\s*/i, '') // remove "ingredients" header
          .replace(/^\d+x\s*/, '') // remove "1x2x3x" type text
          .replace(/dough\s+shaping/i, ''); // remove "Dough shaping" text
        
        if (cleanIngredient && !cleanIngredient.toLowerCase().includes('ingredients')) {
          allIngredients.push(cleanIngredient);
        }
      });
    });

    // Then deduplicate and process them
    allIngredients.forEach(ingredient => {
      // Create a normalized version for deduplication
      const normalizedIngredient = ingredient.toLowerCase().replace(/\s+/g, ' ').trim();
      
      if (!processedIngredients.has(normalizedIngredient)) {
        processedIngredients.add(normalizedIngredient);
        recipeData.ingredients.push(ingredient);

        // Create a normalized version for measurement comparison
        const normalizedForMeasurement = ingredient.toLowerCase()
          .replace(/\s*\([^)]*\)/g, '') // remove parenthetical notes
          .replace(/\s*note\s*\d+/gi, '') // remove "Note X" references
          .replace(/dough\s+shaping/i, '') // remove "Dough shaping" text
          .trim();

        // Check for measurements first
        const hasMeasurement = RECIPE_PATTERNS.measurements.test(normalizedForMeasurement);
        RECIPE_PATTERNS.measurements.lastIndex = 0; // Reset the regex index

        // Categorize the ingredient if it has measurements
        if (hasMeasurement) {
          if (RECIPE_PATTERNS.ingredients.flour.test(normalizedForMeasurement)) {
            if (!processedParsedIngredients.has(normalizedForMeasurement)) {
              processedParsedIngredients.add(normalizedForMeasurement);
              recipeData.parsedIngredients.flour.push(ingredient);
            }
          }
          if (RECIPE_PATTERNS.ingredients.leavener.test(normalizedForMeasurement)) {
            if (!processedParsedIngredients.has(normalizedForMeasurement)) {
              processedParsedIngredients.add(normalizedForMeasurement);
              recipeData.parsedIngredients.leavener.push(ingredient);
            }
          }
          if (RECIPE_PATTERNS.ingredients.liquid.test(normalizedForMeasurement)) {
            if (!processedParsedIngredients.has(normalizedForMeasurement)) {
              processedParsedIngredients.add(normalizedForMeasurement);
              recipeData.parsedIngredients.liquid.push(ingredient);
            }
          }
          if (RECIPE_PATTERNS.ingredients.sugar.test(normalizedForMeasurement)) {
            if (!processedParsedIngredients.has(normalizedForMeasurement)) {
              processedParsedIngredients.add(normalizedForMeasurement);
              recipeData.parsedIngredients.sugar.push(ingredient);
            }
          }
        }
      }
    });

    // Find and highlight instructions
    const instructionSelectors = RECIPE_PATTERNS.recipeSelectors.instructions.join(', ');
    const instructionElements = document.querySelectorAll(instructionSelectors);
    
    // Process instructions, removing duplicates and cleaning up the text
    const processedInstructions = new Set();
    instructionElements.forEach(element => {
      element.style.color = 'green';
      
      // Get all instruction list items
      const instructionItems = element.querySelectorAll('li');
      if (instructionItems.length > 0) {
        instructionItems.forEach(item => {
          // Get the text content of the instruction
          const instructionText = item.textContent.trim();
          if (instructionText && !instructionText.toLowerCase().includes('instructions')) {
            // Store both the HTML and text content
            recipeData.instructions.push({
              text: instructionText,
              html: item.innerHTML
            });
          }
        });
      } else {
        // Fallback for non-list instructions
        const text = element.textContent.trim();
        if (text && !processedInstructions.has(text) && !text.toLowerCase().includes('instructions')) {
          processedInstructions.add(text);
          recipeData.instructions.push({
            text: text,
            html: element.innerHTML
          });
        }
      }
    });

    console.log('Processed recipe data:', recipeData);
    // Send the recipe data back to the popup
    sendResponse({ recipe: recipeData });
    return true; // Required for async response
  }
});

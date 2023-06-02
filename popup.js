document.getElementById('find-recipe').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, { action: 'findRecipe' });
    chrome.scripting.executeScript(
      {
        target: { tabId: activeTab.id },
        function: extractRecipe,
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        }
      }
    );
  });
});

// const searchCredentials = /(\d+\s*(?:-\s*\d+)?\s*(?:\d+\/\d+)?)\s*(cup|cups|oz|ounce|ounces|gram|grams|g|teaspoon|tsp|tablespoon|tbsp|lb|lbs|kg|ml|l|pinch|dash|quart|qt|pint|pt|gallon|gal|mg|)/g;
// //searches for  AP, All Purpose Flour, Bread Flour, Flour, Cake Flour, Pastry Flour, Whole Wheat Flour, and Self Rising Flouw
// const searchFlour = /(AP|All\s*Purpose|All-Purpose|Bread|Bread\s*Flour|Flour|Cake|Cake\s*Flour|Pastry|Pastry\s*Flour|Whole\s*Wheat|Whole\s*Wheat\s*Flour|Self-Rising|Self-Rising\s*Flour|\w*\s*Flour)/gi;
// //searches for sugar, granulated sugar, white sugar, brown sugar, light brown sugar, dark brown sugar, powdered sugar, confectioners sugar, cane sugar, raw sugar, turbinado sugar, demerara sugar, muscavado sugar, super fine sugar, coconut sugar, palm sugar, date sugar, maple sugar, baker sugar and with each sugar with a s after the name (baker + bakers sugar)
// const searchSugar = /(Sugar|Granulated\s*Sugar|White\s*Sugar|Brown\s*Sugar|Light\s*Brown\s*Sugar|Dark\s*Brown\s*Sugar|Powdered\s*Sugar|Confectioners'\s*Sugar|Cane\s*Sugar|Raw\s*Sugar|Turbinado\s*Sugar|Demerara\s*Sugar|Muscovado\s*Sugar|Superfine\s*Sugar|Coconut\s*Sugar|Palm\s*Sugar|Date\s*Sugar|Maple\s*Sugar|Baker\s*Sugar|\w*\s*Sugar)/gi;

function extractRecipe() {
  const recipeTitle = document.querySelector('h1');
  const IngredientAmounts = document.querySelectorAll('ul li');
  const instructionsList = document.querySelectorAll('ol li');

  // Regular expressions for search criteria
  const searchFlour = /(AP|All\s*Purpose|All-Purpose|Bread|Bread\s*Flour|Flour|Cake|Cake\s*Flour|Pastry|Pastry\s*Flour|Whole\s*Wheat|Whole\s*Wheat\s*Flour|Self-Rising|Self-Rising\s*Flour|\w*\s*Flour)/gi;
  const  measurementRegex = /(\d+\s*(?:\d+\/\d+)?)\s*(cup|cups|oz|ounce|gram|grams|g|teaspoon|tsp|tablespoon|Tablespoon|tbsp)/g;
  const searchRiser = /(baking\s*powder|baking\s*soda|yeast)/i;
  const searchLiquid = /(?:warm|cold\s+)?(?:water|water|milk|scalded\s+milk)/i;
  const searchSugar = /(Sugar|Granulated\s*Sugar|White\s*Sugar|Brown\s*Sugar|Light\s*Brown\s*Sugar|Dark\s*Brown\s*Sugar|Powdered\s*Sugar|Confectioners'\s*Sugar|Cane\s*Sugar|Raw\s*Sugar|Turbinado\s*Sugar|Demerara\s*Sugar|Muscovado\s*Sugar|Superfine\s*Sugar|Coconut\s*Sugar|Palm\s*Sugar|Date\s*Sugar|Maple\s*Sugar|Baker\s*Sugar|\w*\s*Sugar)/gi;


  if (recipeTitle) {
    console.log('Recipe Title:', recipeTitle.textContent.trim());
  } else {
    console.error('Recipe title not found.');
  }

  if (IngredientAmounts.length > 0) {
    console.log('Flour Amounts:');
    IngredientAmounts.forEach((ingredient, index) => {
      var ingredientText = ingredient.textContent.trim();
      if (searchFlour.test(ingredientText) && measurementRegex.test(ingredientText)) {
        console.log(`${index + 1}. ${ingredientText}`);
      }
    });
  } else {
    console.error('Ingredients not found.');
  }

  if (IngredientAmounts.length > 0) {
    console.log('Leavener Amounts:');
    IngredientAmounts.forEach((ingredient, index) => {
      var ingredientText = ingredient.textContent.trim();
      if (searchRiser.test(ingredientText) && measurementRegex.test(ingredientText)) {
        console.log(`${index + 1}. ${ingredientText}`);
      }
    });
  } else {
    console.error('Ingredients not found.');
  }

  if (IngredientAmounts.length > 0) {
    console.log('Liquid Amounts:');
    IngredientAmounts.forEach((ingredient, index) => {
      var ingredientText = ingredient.textContent.trim();
      if (searchLiquid.test(ingredientText) && measurementRegex.test(ingredientText)) {
        console.log(`${index + 1}. ${ingredientText}`);
      }
    });
  } else {
    console.error('Ingredients not found.');
  }

  if (IngredientAmounts.length > 0) {
    console.log('Sugar Amounts:');
    IngredientAmounts.forEach((ingredient, index) => {
      var ingredientText = ingredient.textContent.trim();
      if (searchSugar.test(ingredientText) && measurementRegex.test(ingredientText)) {
        console.log(`${index + 1}. ${ingredientText}`);
      }
    });
  } else {
    console.error('Ingredients not found.');
  }
  

  if (instructionsList.length > 0) {
    console.log('Instructions:');
    instructionsList.forEach((instruction, index) => {
      if (instruction.tagName.toLowerCase() !== 'img') {
        var instructionText = instruction.textContent.trim();
        var cleanedText = instructionText.replace(/<img[^>]+>/g, '');
        // if (cleanedText !== 'Kelly Hamilton') {
        console.log(`${index + 1}. ${cleanedText}`);
        // }
      }
    });
  } else {
    console.error('Instructions not found.');
  }
  
  
  
}
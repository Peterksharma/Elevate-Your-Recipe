var slider = document.getElementById("elevation");
var output = document.getElementById("rangeValue");

// Insert CSS styles
const css = '.modifiedText { color: red; }';
const head = document.head || document.getElementsByTagName('head')[0];
const style = document.createElement('style');

style.appendChild(document.createTextNode(css));
head.appendChild(style);

//Display Slider Value
output.innerHTML = slider.value;
slider.oninput = function () {
  output.innerHTML = this.value;
}

//
if (!window.findRecipeListenerAdded) {
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
  window.findRecipeListenerAdded = true;
}


function extractRecipe() {
  //First Part of the Recipe Ingredients Variables (Section the searches the amount numeber)
  const quantityRegex = /(\d+(?:\.\d+)?(?:\s\d+\/\d+)?|\d+\/\d+)/g;
  //Second Part of the recipe is the unit for the amount number. 
  const unitRegex = /(cup|cups|oz|ounce|gram|grams|g|teaspoon|tsp|tablespoon|Tablespoon|tbsp)/g;
  //Third part Searches through the ingredients to identify the name.
  const searchFlour = /(AP|All\s*Purpose|All-Purpose|Bread|Bread\s*Flour|Flour|Cake|Cake\s*Flour|Pastry|Pastry\s*Flour|Whole\s*Wheat|Whole\s*Wheat\s*Flour|Self-Rising|Self-Rising\s*Flour|\w*\s*Flour)/gi;
  const searchRiser = /(baking\s*powder|baking\s*soda|yeast)/i;
  const searchLiquid = /(?:warm|cold\s+)?(?:water|water|milk|scalded\s+milk)/i;
  const searchSugar = /(Sugar|Granulated\s*Sugar|White\s*Sugar|Brown\s*Sugar|Light\s*Brown\s*Sugar|Dark\s*Brown\s*Sugar|Powdered\s*Sugar|Confectioners'\s*Sugar|Cane\s*Sugar|Raw\s*Sugar|Turbinado\s*Sugar|Demerara\s*Sugar|Muscovado\s*Sugar|Superfine\s*Sugar|Coconut\s*Sugar|Palm\s*Sugar|Date\s*Sugar|Maple\s*Sugar|Baker\s*Sugar|\w*\s*Sugar)/gi;

  //Find the Recipe Title
  const recipeTitle = document.querySelector('h1');
  if (recipeTitle) {
    console.log('Recipe Title:', recipeTitle.textContent.trim());
  } else {
    console.error('Recipe title not found.');
  }
  
  //Look for the Ingredients
  const IngredientAmounts = document.querySelectorAll('ul li');
  if (IngredientAmounts.length > 0) {
    IngredientAmounts.forEach((ingredient, index) => {
      var ingredientText = ingredient.textContent.trim();
      var quantityMatch = ingredientText.match(quantityRegex);
      var unitMatch = ingredientText.match(unitRegex);

      if (quantityMatch && unitMatch && ingredientText.length < 150) {
        var quantity = quantityMatch[0];  // First group is the quantity
        var unit = unitMatch[0];  // First group is the unit

        searchFlour.lastIndex = 0;
        if (searchFlour.test(ingredientText)) {
          const newAmount = "The Flour amount has been changed. This is the new value...";
          // Create a new span to contain the modified text
          const span = document.createElement('span');
          span.className = 'modifiedText';
          span.textContent = newAmount;  // Set the span text to the newAmount

          // Combine quantityRegex and unitRegex for the replacement
          const combinedRegex = new RegExp(`${quantity}\\s*${unit}`, 'g');

          // Replace the old text with the new, styled span
          ingredient.innerHTML = ingredientText.replace(combinedRegex, span.outerHTML);
        }
        searchRiser.lastIndex = 0;
        if (searchRiser.test(ingredientText)) {
          console.log('Leavener Amount:', ingredientText);
        }
        searchLiquid.lastIndex = 0;
        if (searchLiquid.test(ingredientText)) {
          console.log('Liquid Amount:', ingredientText);
        }
        searchSugar.lastIndex = 0;
        if (searchSugar.test(ingredientText)) {
          console.log('Sugar Amount:', ingredientText);
        }
      }
    });
  } else {
    console.error('Ingredients not found.');
  }

  //Find the Instructions
  const instructionsList = document.querySelectorAll('ol li');
  if (instructionsList.length > 0) {
    console.log('Instructions:');
    instructionsList.forEach((instruction, index) => {
      if (instruction.tagName.toLowerCase() !== 'img') {
        var instructionText = instruction.textContent.trim();
        var cleanedText = instructionText.replace(/<img[^>]+>/g, '');
        console.log(`${index + 1}. ${cleanedText}`);
      }
    });
  } else {
    console.error('Instructions not found.');
  }
}

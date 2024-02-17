var slider = document.getElementById("elevation");
var output = document.getElementById("rangeValue");

//Display Slider Value
output.innerHTML = slider.value;
slider.oninput = function() {
  output.innerHTML = this.value;
}

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

function extractRecipe() {
  const recipeTitle = document.querySelector('h1');
  if (recipeTitle) {
    recipeTitle.style.color = 'orange';
  }
  
  const IngredientAmounts = document.querySelectorAll('ul li');
  IngredientAmounts.forEach(ingredient => {
    ingredient.style.color = 'red';
  });

  const instructionsList = document.querySelectorAll('ol li');
  instructionsList.forEach(instruction => {
    instruction.style.color = 'green';
  });

  // Regular expressions for search criteria
  const searchFlour = /(AP|All\s*Purpose|All-Purpose|Bread|Bread\s*Flour|Flour|Cake|Cake\s*Flour|Pastry|Pastry\s*Flour|Whole\s*Wheat|Whole\s*Wheat\s*Flour|Self-Rising|Self-Rising\s*Flour|\w*\s*Flour)/gi;
  const  measurementRegex = /(\d+(?:\.\d+)?(?:\s\d+\/\d+)?|\d+\/\d+)\s*(cup|cups|oz|ounce|gram|grams|g|teaspoon|tsp|tablespoon|Tablespoon|tbsp)/g;
  const searchRiser = /(baking\s*powder|baking\s*soda|yeast)/i;
  const searchLiquid = /(?:warm|cold\s+)?(?:water|water|milk|scalded\s+milk)/i;
  const searchSugar = /(Sugar|Granulated\s*Sugar|White\s*Sugar|Brown\s*Sugar|Light\s*Brown\s*Sugar|Dark\s*Brown\s*Sugar|Powdered\s*Sugar|Confectioners'\s*Sugar|Cane\s*Sugar|Raw\s*Sugar|Turbinado\s*Sugar|Demerara\s*Sugar|Muscovado\s*Sugar|Superfine\s*Sugar|Coconut\s*Sugar|Palm\s*Sugar|Date\s*Sugar|Maple\s*Sugar|Baker\s*Sugar|\w*\s*Sugar)/gi;

  if (recipeTitle) {
    console.log('Recipe Title:', recipeTitle.textContent.trim());
  } else {
    console.error('Recipe title not found.');
  }

  //Search for the flour
  // if (IngredientAmounts.length > 0) {
  //   console.log('Flour Amounts:');
  //   IngredientAmounts.forEach((ingredient, index) => {
  //     var ingredientText = ingredient.textContent.trim();
  //     searchFlour.lastIndex = 0;
  //     measurementRegex.lastIndex = 0;
  //     if (searchFlour.test(ingredientText) && measurementRegex.test(ingredientText) && ingredientText.length < 150) {
  //       console.log(`${index + 1}. ${ingredientText}`);
  //     }
  //   });
  // } else {
  //   console.error('Ingredients not found.');
  // }

  if (IngredientAmounts.length > 0) {
    console.log('Flour Amounts:');
    for (let i = 0; i < IngredientAmounts.length; i++) {
      var ingredientText = IngredientAmounts[i].textContent.trim();
      searchFlour.lastIndex = 0;
      measurementRegex.lastIndex = 0;
      if (searchFlour.test(ingredientText) && measurementRegex.test(ingredientText) && ingredientText.length < 150) {
        console.log(`${i + 1}. ${ingredientText}`);
        break;
      }
    }
  } else {
    console.error('Ingredients not found.');
  }
  
  //Search for the Leavner
  if (IngredientAmounts.length > 0) {
    console.log('Leavner Amounts:');
    IngredientAmounts.forEach((ingredient, index) => {
      var ingredientText = ingredient.textContent.trim();
      if (searchRiser.test(ingredientText) && measurementRegex.test(ingredientText) && ingredientText.length < 150) {
        console.log(`${index + 1}. ${ingredientText}`);
      }
    });
  } else {
    console.error('Ingredients not found.');
  }
  //Search for the Liquids
  if (IngredientAmounts.length > 0) {
    console.log('Liquid Amounts:');
    IngredientAmounts.forEach((ingredient, index) => {
      var ingredientText = ingredient.textContent.trim();
      if (searchLiquid.test(ingredientText) && measurementRegex.test(ingredientText)&& ingredientText.length < 150) {
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
      if (searchSugar.test(ingredientText) && measurementRegex.test(ingredientText)&& ingredientText.length < 150) {
        console.log(`${index + 1}. ${ingredientText}`);
      }
    });
  } else {
    console.error('Ingredients not found.');
  }

  //WORKING ON GETTING THE INSTRUCTIONS
  //The idea is loop through the headers looking for the instructions
  let instructionHeader = null;
  for (let i = 1; i <= 6; i++) {
    const headers = document.querySelectorAll(`h${i}`);
    headers.forEach(header => {
      if (header.textContent.toLowerCase().includes('instruction')) {
        instructionHeader = header;
      }
    });
    if (instructionHeader) break;
  }

  if (instructionHeader) {
    let element = instructionHeader.nextElementSibling;
    console.log('Instructions:');

    while (element) {
      if (element.tagName.toLowerCase() === 'h1' || element.tagName.toLowerCase() === 'h2' || element.tagName.toLowerCase() === 'h3') {
        break; // Stop if the next header of the same or higher level is found
      }

      if (element.textContent.trim()) {
        console.log(element.textContent.trim());
      }

      element = element.nextElementSibling;
    }
  } else {
    console.error('Instructions header not found.');
  }
}

  // if (instructionsList.length > 0) {
  //   console.log('Instructions:');
  //   instructionsList.forEach((instruction, index) => {
  //     if (instruction.tagName.toLowerCase() !== 'img') {
  //       var instructionText = instruction.textContent.trim();
  //       var cleanedText = instructionText.replace(/<img[^>]+>/g, '');
  //       // if (cleanedText !== 'Kelly Hamilton') {
  //       console.log(`${index + 1}. ${cleanedText}`);
  //       // }
  //     }
  //   });
  // } else {
  //   console.error('Instructions not found.');
  // }
// }


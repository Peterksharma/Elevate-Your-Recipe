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
    console.log('Recipe Title:', recipeTitle.textContent.trim());
  } else {
    console.error('Recipe title not found.');
  }
  
  const ingredientAmounts = document.querySelectorAll('ul li');
  ingredientAmounts.forEach(ingredient => {
    ingredient.style.color = 'red';
  });

  const instructionsList = document.querySelectorAll('ol li');
  instructionsList.forEach(instruction => {
    instruction.style.color = 'green';
  });

  //Bread?
  //This is the filter for finding things.
  const searchFlour = /(AP|All(-|\s*)Purpose|Bread|Cake|Pastry|Whole(-|\s*)Wheat|Self(-|\s*)Rising)?\s*Flour|Flour/gi;
  const measurementRegex = /(\d+(?:\.\d+)?(?:\s\d+\/\d+)?|\d+\/\d+)\s*(cup|cups|oz|ounce|gram|grams|g|teaspoon|tsp|tablespoon|Tablespoon|tbsp)/gi;
  const searchRiser = /baking\s*(powder|soda)|yeast/i;
  const searchLiquid = /(?:warm|cold\s+)?(water|milk|scalded\s+milk)/i;
  const searchSugar = /(?:Granulated|White|Brown|Light\s*Brown|Dark\s*Brown|Powdered|Confectioners'|Cane|Raw|Turbinado|Demerara|Muscovado|Superfine|Coconut|Palm|Date|Maple|Baker)?\s*Sugar|Sugar/gi;

  function searchIngredients(searchTerm, ingredientType) {
    if (ingredientAmounts.length > 0) {
      console.log(`${ingredientType} Amounts:`);
      ingredientAmounts.forEach((ingredient, index) => {
        const ingredientText = ingredient.textContent.trim();
        searchTerm.lastIndex = 0; 
        measurementRegex.lastIndex = 0;
  
        if (searchTerm.test(ingredientText) && measurementRegex.test(ingredientText) && ingredientText.length < 150 && !ingredientText.match(/says:/)) {
          console.log(`${index + 1}. ${ingredientText}`);
        }
      });
    } else {
      console.error('Ingredients not found.');
    }
  }
  
  

  searchIngredients(searchFlour, 'Flour');
  searchIngredients(searchRiser, 'Leavener');
  searchIngredients(searchLiquid, 'Liquid');
  searchIngredients(searchSugar, 'Sugar');


  //WORKING ON GETTING THE INSTRUCTIONS
  function findInstructionsHeader(ingredientsHeader) {
  let currentElement = ingredientsHeader.nextElementSibling;
  while (currentElement) {
    if (currentElement.tagName.toLowerCase() === ingredientsHeader.tagName.toLowerCase() &&
        currentElement.textContent.toLowerCase().includes('instruction')) {
      return currentElement;
    }
    currentElement = currentElement.nextElementSibling;
  }
  return null;
}

// function extractInstructions() {
//   // Try to find the instructions container by class name first
//   const instructionsContainer = document.querySelector('.tasty-recipes-instructions');
//   let instructionsList = null;

//   if (instructionsContainer) {
//     instructionsList = instructionsContainer.querySelector('ol, ul');
//   } else {
//     // Fallback to the original method
//     const headers = document.querySelectorAll('h1, h2, h3, h4');
//     let instructionsHeader = null;

//     headers.forEach(header => {
//       if (header.textContent.trim().toLowerCase() === 'instructions') {
//         instructionsHeader = header;
//       }
//     });

//     if (instructionsHeader) {
//       let currentElement = instructionsHeader.nextElementSibling;
//       while (currentElement) {
//         if (currentElement.tagName.toLowerCase() === 'ol' || currentElement.tagName.toLowerCase() === 'ul') {
//           instructionsList = currentElement;
//           break;
//         }
//         currentElement = currentElement.nextElementSibling;
//       }
//     }
//   }

//   if (instructionsList) {
//     const instructionSteps = instructionsList.querySelectorAll('li');
//     console.log('Instructions:');

//     instructionSteps.forEach((step, index) => {
//       const stepText = step.textContent.trim().replace(/\s+/g, ' ');
//       console.log(`${index + 1}. ${stepText}`);
//     });
//   } else {
//     console.error('Instructions list not found.');
//   }
// }

// extractInstructions();

function extractInstructions() {
  const possibleHeaders = document.querySelectorAll('h1, h2, h3, h4, h5, h6, div');
  let instructionsList = null;

  possibleHeaders.forEach(header => {
    const headerText = header.textContent.trim().toLowerCase();
    console.log('Checking header:', headerText); // Diagnostic log

    if (headerText.includes('instruction') || headerText.includes('step')) {
      let currentElement = header;
      let depth = 0;
      const maxDepth = 10; // Increased max depth

      while (depth < maxDepth && currentElement) {
        if (currentElement.tagName.toLowerCase() === 'ol' || currentElement.tagName.toLowerCase() === 'ul') {
          instructionsList = currentElement;
          break;
        }
        currentElement = currentElement.nextElementSibling || currentElement.parentElement;
        depth++;
      }
    }
  });

  if (instructionsList) {
    const instructionSteps = instructionsList.querySelectorAll('li');
    console.log('Instructions:');

    instructionSteps.forEach((step, index) => {
      const stepText = step.textContent.trim().replace(/\s+/g, ' ');
      console.log(`${index + 1}. ${stepText}`);
    });
  } else {
    console.error('Instructions list not found.');
  }
}

extractInstructions();

}
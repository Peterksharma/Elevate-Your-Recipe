// document.getElementById('find-recipe').addEventListener('click', () => {
//     chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
//       const activeTab = tabs[0];
//       chrome.tabs.sendMessage(activeTab.id, { action: 'findRecipe' });
//       // chrome.scripting.executeScript(
//         {
//           target: { tabId: activeTab.id },
//           function: extractRecipe,
//         },
//         () => {
//           if (chrome.runtime.lastError) {
//             console.error(chrome.runtime.lastError);
//           }
//         }
//       );
//     });
//   });

document.getElementById('find-recipe').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, { action: 'findRecipe' });
  });
});

  function extractRecipe() {
    const recipeTitle = document.querySelector('.field.field--name-title.field--type-string.field--label-hidden');
    const ingredientsList = document.querySelectorAll('.field--item.even .ingredient');
    const instructionsList = document.querySelectorAll('.instructions li');
    const lists = document.querySelectorAll('li');
  
    if (recipeTitle) {
      console.log('Recipe Title:', recipeTitle.textContent.trim());
    } else {
      console.error('Recipe title not found.');
    }
  
    if (ingredientsList.length > 0) {
      console.log('Ingredients:');
      ingredientsList.forEach((ingredient, index) => {
        console.log(`${index + 1}. ${ingredient.textContent.trim()}`);
      });
    } else {
      console.error('Ingredients not found.');
    }
  
    if (instructionsList.length > 0) {
      console.log('Instructions:');
      instructionsList.forEach((instruction, index) => {
        console.log(`${index + 1}. ${instruction.textContent.trim()}`);
      });
    } else {
      console.error('Instructions not found.');
    }
  }

  
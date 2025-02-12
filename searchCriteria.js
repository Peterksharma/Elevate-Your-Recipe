// var searchCredentials = /(\d+\s*(?:-\s*\d+)?\s*(?:\d+\/\d+)?)\s*(cup|cups|oz|ounce|ounces|gram|grams|g|teaspoon|tsp|tablespoon|tbsp|lb|lbs|kg|ml|l|pinch|dash|quart|qt|pint|pt|gallon|gal|mg|)/g;

//Looking for the flour
var searchCredentials = /(\d+\s*(?:-\s*\d+)?\s*(?:\d+\/\d+)?)\s*(cup|cups|oz|ounce|ounces|gram|grams|g|teaspoon|tsp|tablespoon|tbsp|lb|lbs|kg|ml|l|pinch|dash|quart|qt|pint|pt|gallon|gal|mg|)/g;

//searches for  AP, All Purpose Flour, Bread Flour, Flour, Cake Flour, Pastry Flour, Whole Wheat Flour, and Self Rising Flouw
var searchFlour = /(AP|All\s*Purpose|All-Purpose|Bread|Bread\s*Flour|Flour|Cake|Cake\s*Flour|Pastry|Pastry\s*Flour|Whole\s*Wheat|Whole\s*Wheat\s*Flour|Self-Rising|Self-Rising\s*Flour|\w*\s*Flour)/gi;

//searches for sugar, granulated sugar, white sugar, brown sugar, light brown sugar, dark brown sugar, powdered sugar, confectioners sugar, cane sugar, raw sugar, turbinado sugar, demerara sugar, muscavado sugar, super fine sugar, coconut sugar, palm sugar, date sugar, maple sugar, baker sugar and with each sugar with a s after the name (baker + bakers sugar)
var searchSugar = /(Sugar|Granulated\s*Sugar|White\s*Sugar|Brown\s*Sugar|Light\s*Brown\s*Sugar|Dark\s*Brown\s*Sugar|Powdered\s*Sugar|Confectioners'\s*Sugar|Cane\s*Sugar|Raw\s*Sugar|Turbinado\s*Sugar|Demerara\s*Sugar|Muscovado\s*Sugar|Superfine\s*Sugar|Coconut\s*Sugar|Palm\s*Sugar|Date\s*Sugar|Maple\s*Sugar|Baker\s*Sugar|\w*\s*Sugar)/gi;

// Recipe Search Patterns
const RECIPE_PATTERNS = {
  // Common recipe website classes and IDs
  recipeSelectors: {
    ingredients: [
      '[class*="recipe-ingredients"]',
      '[class*="ingredients-section"]',
      '[class*="wprm-recipe-ingredients"]',
      '[id*="recipe-ingredients"]',
      '[class*="recipe_ingredients"]',
      '[class*="ingredients-list"]'
    ],
    ingredientsHeader: [
      '[class*="ingredients-header"]',
      '[class*="wprm-recipe-ingredients-header"]',
      'h2:contains("Ingredients")',
      'h3:contains("Ingredients")',
      'h4:contains("Ingredients")'
    ],
    instructions: [
      '[class*="recipe-instructions"]',
      '[class*="wprm-recipe-instructions"]',
      '[class*="recipe-directions"]',
      '[id*="recipe-instructions"]',
      '[class*="recipe_instructions"]'
    ]
  },

  // Measurement pattern for quantities and units
  measurements: /(\d+(?:\.\d+)?(?:\s*-\s*\d+(?:\.\d+)?)?(?:\s+\d+\/\d+)?)\s*(cup|cups|oz|ounce|ounces|gram|grams|g|teaspoon|tsp|tablespoon|tbsp|Tablespoons|Tablespoon|lb|lbs|kg|ml|l|pinch|dash|quart|qt|pint|pt|gallon|gal|mg)/gi,
  
  // Ingredient patterns
  ingredients: {
    flour: /(AP|All(-|\s*)Purpose|Bread|Cake|Pastry|Whole(-|\s*)Wheat|Self(-|\s*)Rising)?\s*[Ff]lour/i,
    sugar: /(Granulated|White|Brown|Light\s*Brown|Dark\s*Brown|Powdered|Confectioners'|Cane|Raw|Turbinado|Demerara|Muscovado|Superfine|Coconut|Palm|Date|Maple|Baker)?\s*[Ss]ugar/i,
    leavener: /([Bb]aking\s*(?:powder|soda)|[Yy]east)/i,
    liquid: /(?:warm|cold\s+)?(?:water|milk|scalded\s+milk)/i
  },

  // Common recipe markers
  markers: {
    bulletPoints: /[▢•\-]/,
    numbers: /^\d+[\.\)]\s*/
  }
};

// Conversion factors for common ingredients (in grams)
const CONVERSION_FACTORS = {
  flour: {
    cup: 120,
    tablespoon: 7.5,
    teaspoon: 2.5
  },
  sugar: {
    cup: 200,
    tablespoon: 12.5,
    teaspoon: 4
  },
  liquid: {
    cup: 240,
    tablespoon: 15,
    teaspoon: 5
  }
};

// Altitude adjustment ranges (in feet)
const ALTITUDE_RANGES = {
  low: { min: 3500, max: 6500 },
  medium: { min: 6501, max: 8500 },
  high: { min: 8501, max: 10000 }
};

// Make variables globally available
window.RECIPE_PATTERNS = RECIPE_PATTERNS;
window.ALTITUDE_RANGES = ALTITUDE_RANGES;
window.CONVERSION_FACTORS = CONVERSION_FACTORS;


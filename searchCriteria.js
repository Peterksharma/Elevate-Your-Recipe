// var searchCredentials = /(\d+\s*(?:-\s*\d+)?\s*(?:\d+\/\d+)?)\s*(cup|cups|oz|ounce|ounces|gram|grams|g|teaspoon|tsp|tablespoon|tbsp|lb|lbs|kg|ml|l|pinch|dash|quart|qt|pint|pt|gallon|gal|mg|)/g;

//Looking for the flour
var searchCredentials = /(\d+\s*(?:-\s*\d+)?\s*(?:\d+\/\d+)?)\s*(cup|cups|oz|ounce|ounces|gram|grams|g|teaspoon|tsp|tablespoon|tbsp|lb|lbs|kg|ml|l|pinch|dash|quart|qt|pint|pt|gallon|gal|mg|)/g;

//searches for  AP, All Purpose Flour, Bread Flour, Flour, Cake Flour, Pastry Flour, Whole Wheat Flour, and Self Rising Flouw
var searchFlour = /(AP|All\s*Purpose|All-Purpose|Bread|Bread\s*Flour|Flour|Cake|Cake\s*Flour|Pastry|Pastry\s*Flour|Whole\s*Wheat|Whole\s*Wheat\s*Flour|Self-Rising|Self-Rising\s*Flour|\w*\s*Flour)/gi;

//searches for sugar, granulated sugar, white sugar, brown sugar, light brown sugar, dark brown sugar, powdered sugar, confectioners sugar, cane sugar, raw sugar, turbinado sugar, demerara sugar, muscavado sugar, super fine sugar, coconut sugar, palm sugar, date sugar, maple sugar, baker sugar and with each sugar with a s after the name (baker + bakers sugar)
var searchSugar = /(Sugar|Granulated\s*Sugar|White\s*Sugar|Brown\s*Sugar|Light\s*Brown\s*Sugar|Dark\s*Brown\s*Sugar|Powdered\s*Sugar|Confectioners'\s*Sugar|Cane\s*Sugar|Raw\s*Sugar|Turbinado\s*Sugar|Demerara\s*Sugar|Muscovado\s*Sugar|Superfine\s*Sugar|Coconut\s*Sugar|Palm\s*Sugar|Date\s*Sugar|Maple\s*Sugar|Baker\s*Sugar|\w*\s*Sugar)/gi;


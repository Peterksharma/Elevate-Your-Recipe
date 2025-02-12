// Remove the import since ALTITUDE_RANGES is now global

/**
 * Adjusts recipe ingredients for high altitude baking
 * @param {Object} recipe - Object containing ingredient amounts in grams/ml
 * @param {number} altitude - Altitude in feet
 * @returns {Object} Adjusted recipe measurements
 */
function adjustRecipeAmounts(recipe, altitude) {
    // Return original recipe if below 3000ft
    if (altitude < 3000) {
        return recipe;
    }

    const adjustedRecipe = { ...recipe };

    // Flour adjustments (increase to strengthen structure)
    // Add 1 tbsp (15g) per cup (120g) of flour above 3000ft
    // Additional tbsp per cup for each 1500ft above 5000ft
    if (adjustedRecipe.flour) {
        const cupsOfFlour = adjustedRecipe.flour / 120;
        let flourIncrease = 15 * cupsOfFlour; // Base increase (1 tbsp/cup)
        
        if (altitude > 5000) {
            const additionalTbsp = Math.floor((altitude - 5000) / 1500);
            flourIncrease += (15 * cupsOfFlour * additionalTbsp);
        }
        
        adjustedRecipe.flour += flourIncrease;
    }

    // Leavening agents (decrease to prevent overexpansion)
    // Baking powder/soda reduction increases with altitude
    const leaveningReductions = {
        3000: 0.125, // Reduce by 1/8 at 3000ft
        5000: 0.25,  // Reduce by 1/4 at 5000ft
        7000: 0.33   // Reduce by 1/3 at 7000ft+
    };

    for (const agent of ['bakingPowder', 'bakingSoda']) {
        if (adjustedRecipe[agent]) {
            let reduction = 0.125; // Default reduction
            
            for (const [height, red] of Object.entries(leaveningReductions)) {
                if (altitude >= parseInt(height)) {
                    reduction = red;
                }
            }
            
            adjustedRecipe[agent] *= (1 - reduction);
        }
    }

    // Sugar reduction (decreases with altitude to maintain structure)
    // Reduce by 1-2 tbsp per cup above 3000ft
    if (adjustedRecipe.sugar) {
        const cupsOfSugar = adjustedRecipe.sugar / 200; // 200g sugar = 1 cup
        let reduction = 15 * cupsOfSugar; // 1 tbsp (15g) per cup base reduction
        
        if (altitude > 5000) {
            reduction *= 2; // 2 tbsp per cup above 5000ft
        }
        
        adjustedRecipe.sugar = Math.max(0, adjustedRecipe.sugar - reduction);
    }

    // Liquid adjustments (increase to counter faster evaporation)
    // Add 1-2 tbsp per cup of liquid above 3000ft
    // Additional 1-2 tbsp per 1500ft above 5000ft
    for (const liquid of ['water', 'milk', 'buttermilk']) {
        if (adjustedRecipe[liquid]) {
            const cupsOfLiquid = adjustedRecipe[liquid] / 240; // 240ml = 1 cup
            let increase = 15 * cupsOfLiquid; // 1 tbsp (15ml) per cup base increase
            
            if (altitude > 5000) {
                const additionalTbsp = Math.floor((altitude - 5000) / 1500);
                increase += (15 * cupsOfLiquid * additionalTbsp);
            }
            
            adjustedRecipe[liquid] += increase;
        }
    }

    // Temperature adjustment (increase by 25°F/15°C at 3000ft+)
    if (adjustedRecipe.temperature) {
        if (adjustedRecipe.temperatureUnit === 'F') {
            adjustedRecipe.temperature += 25;
        } else if (adjustedRecipe.temperatureUnit === 'C') {
            adjustedRecipe.temperature += 15;
        }
    }

    return adjustedRecipe;
}

class RecipeAdjuster {
  constructor(altitude) {
    this.validateAltitude(altitude);
    this.altitude = altitude;
  }

  validateAltitude(altitude) {
    if (altitude < 0 || altitude > 15000) {
      throw new Error('Altitude must be between 0 and 15000 feet');
    }
  }

  adjustRecipe(recipe) {
    return adjustRecipeAmounts(recipe, this.altitude);
  }

  adjustFlour(amount) {
    if (this.altitude < 3000) return amount;
    
    // Base increase is 1 tbsp (1/16 cup) per cup of flour
    const baseIncrease = 1/16;
    
    // Additional increase for every 1500ft above 5000ft
    const additionalIncrease = this.altitude > 5000 
      ? Math.floor((this.altitude - 5000) / 1500) * (1/16)
      : 0;
    
    const totalIncrease = baseIncrease + additionalIncrease;
    return amount * (1 + totalIncrease);
  }

  adjustLeavening(amount) {
    if (this.altitude < 3000) return amount;
    
    // Progressive reduction based on altitude
    let reduction;
    if (this.altitude >= 7000) {
      reduction = 0.33; // Reduce by 1/3
    } else if (this.altitude >= 5000) {
      reduction = 0.25; // Reduce by 1/4
    } else {
      reduction = 0.125; // Reduce by 1/8
    }
    
    return amount * (1 - reduction);
  }

  adjustSugar(amount) {
    if (this.altitude < 3000) return amount;
    
    // Base reduction is 1 tbsp per cup (1/16 reduction)
    let reduction = 1/16;
    
    // Double the reduction above 5000ft
    if (this.altitude > 5000) {
      reduction *= 2;
    }
    
    return amount * (1 - reduction);
  }

  adjustLiquid(amount) {
    if (this.altitude < 3000) return amount;
    
    // Base increase is 2 tbsp per cup (2/16 = 1/8 cup increase)
    let increase = 1/8;
    
    // Additional increase for every 1500ft above 5000ft
    if (this.altitude > 5000) {
      const additionalTbsp = Math.floor((this.altitude - 5000) / 1500);
      increase += (additionalTbsp * 1/8);
    }
    
    return amount * (1 + increase);
  }

  static formatMeasurement(value, unit) {
    const roundedValue = Math.round(value * 100) / 100;
    return `${roundedValue} ${unit}`;
  }
}

// Make RecipeAdjuster globally available
window.RecipeAdjuster = RecipeAdjuster;

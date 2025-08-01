/**
 * Recipe Adjuster Class for High Altitude Baking
 * Adjusts recipe ingredients and instructions based on elevation
 * Based on established high altitude baking science and guidelines
 */
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

    /**
     * Get the altitude category for adjustment calculations
     * @returns {string} Altitude category
     */
    getAltitudeCategory() {
        if (this.altitude < 3000) return 'sea-level';
        if (this.altitude <= 5000) return 'low-altitude';
        if (this.altitude <= 6500) return 'medium-altitude';
        if (this.altitude <= 8000) return 'high-altitude';
        return 'very-high-altitude';
    }

    /**
     * Adjust flour amount based on altitude
     * @param {number} amount - Original amount
     * @returns {number} Adjusted amount
     */
    adjustFlour(amount) {
        if (this.altitude < 3500) return amount;
        
        // At 3,500 feet, add 1 more tablespoon per recipe
        // For each additional 1,500 feet, add one more tablespoon
        const baseIncrease = 1/16; // 1 tablespoon = 1/16 cup
        const additionalIncreases = Math.floor((this.altitude - 3500) / 1500);
        const totalIncrease = baseIncrease + (additionalIncreases * baseIncrease);
        
        return amount * (1 + totalIncrease);
    }

    /**
     * Adjust leavening agents (baking powder/soda) based on altitude
     * @param {number} amount - Original amount in teaspoons
     * @returns {number} Adjusted amount in teaspoons
     */
    adjustLeavening(amount) {
        if (this.altitude < 3000) return amount;
        
        let reduction;
        if (this.altitude <= 5000) {
            // 3,000-5,000 ft: reduce by 1/8 (0.125)
            reduction = 0.125;
        } else if (this.altitude <= 6500) {
            // 5,000-6,500 ft: reduce by 1/2 (0.5)
            reduction = 0.5;
        } else if (this.altitude <= 8000) {
            // 6,500-8,000 ft: reduce by 3/4 (0.75)
            reduction = 0.75;
        } else {
            // Above 8,000 ft: reduce by 3/4 (0.75)
            reduction = 0.75;
        }
        
        return amount * (1 - reduction);
    }

    /**
     * Adjust sugar amount based on altitude
     * @param {number} amount - Original amount
     * @returns {number} Adjusted amount
     */
    adjustSugar(amount) {
        if (this.altitude < 3000) return amount;
        
        // Decrease by 1 tablespoon per cup
        const reduction = 1/16; // 1 tablespoon = 1/16 cup
        return amount * (1 - reduction);
    }

    /**
     * Adjust liquid amount based on altitude
     * @param {number} amount - Original amount
     * @returns {number} Adjusted amount
     */
    adjustLiquid(amount) {
        if (this.altitude < 3000) return amount;
        
        // Increase by 1 to 2 tablespoons at 3,000 feet
        // Increase by 1 1/2 teaspoons for each additional 1,000 feet
        let increase = 1.5/16; // 1.5 tablespoons = 1.5/16 cup base increase
        
        if (this.altitude > 3000) {
            const additionalIncreases = Math.floor((this.altitude - 3000) / 1000);
            increase += (additionalIncreases * 0.5/16); // 0.5 teaspoons = 0.5/16 cup
        }
        
        return amount * (1 + increase);
    }

    /**
     * Adjust temperature based on altitude
     * @param {number} temp - Original temperature
     * @param {string} unit - Temperature unit ('F' or 'C')
     * @returns {number} Adjusted temperature
     */
    adjustTemperature(temp, unit = 'F') {
        if (this.altitude < 3000) return temp;
        
        let increase;
        if (unit.toUpperCase() === 'F') {
            // Increase 15°F to 25°F; use the lower increase for chocolate or delicate cakes
            increase = 20; // Use middle value, can be adjusted based on recipe type
        } else if (unit.toUpperCase() === 'C') {
            // Increase 8°C to 14°C
            increase = 11; // Use middle value
        } else {
            return temp;
        }
        
        return temp + increase;
    }

    /**
     * Adjust baking time based on altitude
     * @param {number} time - Original baking time in minutes
     * @returns {number} Adjusted baking time in minutes
     */
    adjustBakingTime(time) {
        if (this.altitude < 3000) return time;
        
        // Decrease by 5 to 8 minutes per 30 minutes of baking time
        const decreasePer30Min = 6.5; // Use middle value
        const decrease = Math.floor((time / 30) * decreasePer30Min);
        
        return Math.max(time - decrease, time * 0.8); // Don't reduce by more than 20%
    }

    /**
     * Parse and adjust a single ingredient
     * @param {string} ingredient - Ingredient string with measurement
     * @returns {string} Adjusted ingredient string
     */
    adjustIngredient(ingredient) {
        if (this.altitude < 3000) return ingredient;

        // Parse fractions and mixed numbers
        function parseAmount(amount) {
            amount = amount.replace(/\s+/g, '');
            
            // Check if it's a mixed number (e.g., "1 1/2")
            const mixedMatch = amount.match(/^(\d+)\s*(\d+\/\d+)$/);
            if (mixedMatch) {
                const whole = parseInt(mixedMatch[1]);
                const [num, denom] = mixedMatch[2].split('/').map(Number);
                return whole + (num / denom);
            }
            
            // Check if it's a simple fraction (e.g., "1/2")
            const fractionMatch = amount.match(/^(\d+)\/(\d+)$/);
            if (fractionMatch) {
                const [_, num, denom] = fractionMatch;
                return Number(num) / Number(denom);
            }
            
            return Number(amount);
        }

        // Match volume measurements
        const volumeMatch = ingredient.match(/(\d+(?:\s*\d*\/\d+)?)\s*(cups?|tbsp|tsp|tablespoons?|teaspoons?)/i);
        if (volumeMatch) {
            const [, amount, unit] = volumeMatch;
            const numericAmount = parseAmount(amount);
            let adjustedAmount = numericAmount;

            // Determine ingredient type and apply appropriate adjustment
            const lowerIngredient = ingredient.toLowerCase();
            if (lowerIngredient.includes('flour')) {
                adjustedAmount = this.adjustFlour(numericAmount);
            } else if (lowerIngredient.includes('sugar')) {
                adjustedAmount = this.adjustSugar(numericAmount);
            } else if (lowerIngredient.includes('baking powder') || lowerIngredient.includes('baking soda') || lowerIngredient.includes('yeast')) {
                adjustedAmount = this.adjustLeavening(numericAmount);
            } else if (lowerIngredient.includes('water') || lowerIngredient.includes('milk') || lowerIngredient.includes('buttermilk') || lowerIngredient.includes('oil') || lowerIngredient.includes('eggs')) {
                adjustedAmount = this.adjustLiquid(numericAmount);
            }

            // Format the adjusted amount
            const formattedAmount = this.formatMeasurement(adjustedAmount, unit);
            return ingredient.replace(volumeMatch[0], formattedAmount);
        }

        return ingredient;
    }

    /**
     * Adjust cooking temperature in instructions
     * @param {string} instruction - Cooking instruction
     * @returns {string} Adjusted instruction
     */
    adjustTemperature(instruction) {
        if (this.altitude < 3000) return instruction;

        // Match temperature patterns (e.g., "350°F", "180°C", "350 F", "180 C")
        const tempMatch = instruction.match(/(\d+)\s*[°]?\s*(F|C|Fahrenheit|Celsius)/i);
        if (tempMatch) {
            const [, temp, unit] = tempMatch;
            const numericTemp = parseInt(temp);
            const adjustedTemp = this.adjustTemperature(numericTemp, unit);

            return instruction.replace(tempMatch[0], `${adjustedTemp}°${unit.toUpperCase()}`);
        }

        return instruction;
    }

    /**
     * Adjust baking time in instructions
     * @param {string} instruction - Cooking instruction
     * @returns {string} Adjusted instruction
     */
    adjustBakingTime(instruction) {
        if (this.altitude < 3000) return instruction;

        // Match time patterns (e.g., "bake for 25 minutes", "cook for 30-35 minutes")
        const timeMatch = instruction.match(/(?:bake|cook|roast)\s+(?:for\s+)?(\d+)(?:\s*-\s*(\d+))?\s*(?:minutes?|mins?)/i);
        if (timeMatch) {
            const [, time1, time2] = timeMatch;
            const originalTime1 = parseInt(time1);
            const originalTime2 = time2 ? parseInt(time2) : null;
            
            const adjustedTime1 = this.adjustBakingTime(originalTime1);
            const adjustedTime2 = originalTime2 ? this.adjustBakingTime(originalTime2) : null;
            
            let replacement;
            if (adjustedTime2) {
                replacement = `${adjustedTime1}-${adjustedTime2} minutes`;
            } else {
                replacement = `${adjustedTime1} minutes`;
            }
            
            return instruction.replace(timeMatch[0], replacement);
        }

        return instruction;
    }

    /**
     * Get adjustment recommendations for the current altitude
     * @returns {Object} Adjustment recommendations
     */
    getAdjustmentRecommendations() {
        const category = this.getAltitudeCategory();
        const recommendations = {
            'sea-level': {
                description: 'No adjustments needed',
                adjustments: []
            },
            'low-altitude': {
                description: 'Minor adjustments recommended (3,000-5,000 ft)',
                adjustments: [
                    'Increase oven temperature by 15-25°F',
                    'Decrease baking time by 5-8 minutes per 30 minutes',
                    'Decrease sugar by 1 tablespoon per cup',
                    'Increase liquid by 1-2 tablespoons',
                    'Decrease leavening by 1/8'
                ]
            },
            'medium-altitude': {
                description: 'Moderate adjustments needed (5,000-6,500 ft)',
                adjustments: [
                    'Increase oven temperature by 15-25°F',
                    'Decrease baking time by 5-8 minutes per 30 minutes',
                    'Decrease sugar by 1 tablespoon per cup',
                    'Increase liquid by 1-2 tablespoons + 1.5 tsp per 1000 ft above 3000',
                    'Decrease leavening by 1/2',
                    'Add 1 tablespoon flour per recipe at 3500 ft + 1 tbsp per 1500 ft above'
                ]
            },
            'high-altitude': {
                description: 'Significant adjustments needed (6,500-8,000 ft)',
                adjustments: [
                    'Increase oven temperature by 15-25°F',
                    'Decrease baking time by 5-8 minutes per 30 minutes',
                    'Decrease sugar by 1 tablespoon per cup',
                    'Increase liquid by 1-2 tablespoons + 1.5 tsp per 1000 ft above 3000',
                    'Decrease leavening by 3/4',
                    'Add 1 tablespoon flour per recipe at 3500 ft + 1 tbsp per 1500 ft above',
                    'Consider chilling cookie dough for 30 minutes to 2 hours'
                ]
            },
            'very-high-altitude': {
                description: 'Major adjustments needed (above 8,000 ft)',
                adjustments: [
                    'Increase oven temperature by 15-25°F',
                    'Decrease baking time by 5-8 minutes per 30 minutes',
                    'Decrease sugar by 1 tablespoon per cup',
                    'Increase liquid by 1-2 tablespoons + 1.5 tsp per 1000 ft above 3000',
                    'Decrease leavening by 3/4',
                    'Add 1 tablespoon flour per recipe at 3500 ft + 1 tbsp per 1500 ft above',
                    'Consider using high-protein bread flour',
                    'For yeast breads: decrease yeast by 25% and use colder water'
                ]
            }
        };

        return recommendations[category];
    }

    static formatMeasurement(value, unit) {
        const roundedValue = Math.round(value * 100) / 100;
        
        // Convert decimal to fraction for common values
        if (roundedValue <= 0.25) return `${roundedValue} ${unit}`;
        
        const fractions = {
            0.25: '1/4',
            0.33: '1/3',
            0.5: '1/2',
            0.67: '2/3',
            0.75: '3/4'
        };

        const wholePart = Math.floor(roundedValue);
        const decimalPart = roundedValue - wholePart;
        
        if (decimalPart === 0) {
            return `${wholePart} ${unit}`;
        }

        const fraction = fractions[Math.round(decimalPart * 100) / 100];
        if (fraction) {
            return wholePart > 0 ? `${wholePart} ${fraction} ${unit}` : `${fraction} ${unit}`;
        }

        return `${roundedValue} ${unit}`;
    }
}

// Make RecipeAdjuster globally available
window.RecipeAdjuster = RecipeAdjuster; 
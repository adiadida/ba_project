/** utils for heatmaps*/
// function to get min and max
export function getMinAndMax(values: number[]): { min: number, max: number } {
    const min = Math.min(...values);
    const max = Math.max(...values);

    return {min, max}
}

// Function to convert hex to RGB
export function hexToRgb(hex: string) {

    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return {r, g, b};
}

// function for bivariate color scale brown=high value, white=neutral, green=low value
// interpolates color from green to white to brown
export const getEntropyColor = (value: number, minValue: number, maxValue: number): string => {
    // Handle edge cases where minValue == maxValue
    const ratio = minValue === maxValue ? 0 : (value - minValue) / (maxValue - minValue);

    // Hex values for divergent color scale
    const negativeHex = '#d8b365'; // brown color for high values
    const neutralHex = '#f5f5f5'; // Neutral color
    const positiveHex = '#5ab4ac'; // green color for low values

    // Convert hex colors to RGB
    const positiveColor = hexToRgb(positiveHex);
    const neutralColor = hexToRgb(neutralHex);
    const negativeColor = hexToRgb(negativeHex);

    let r: number, g: number, b: number;

    if (ratio <= 0.5) {
        // Interpolate between positive and neutralColor -> green to white
        const ratioInSegment = ratio / 0.5; // Normalize ratio to [0, 1]
        // end - start
        r = Math.round(positiveColor.r + (neutralColor.r - positiveColor.r) * ratioInSegment);
        g = Math.round(positiveColor.g + (neutralColor.g - positiveColor.g) * ratioInSegment);
        b = Math.round(positiveColor.b + (neutralColor.b - positiveColor.b) * ratioInSegment);
    } else {
        // Interpolate between neutralColor and negativeColor -> white to brown
        const ratioInSegment = (ratio - 0.5) / 0.5; // Normalize ratio to [0, 1]
        // end - start
        r = Math.round(neutralColor.r + (negativeColor.r - neutralColor.r) * ratioInSegment);
        g = Math.round(neutralColor.g + (negativeColor.g - neutralColor.g) * ratioInSegment);
        b = Math.round(neutralColor.b + (negativeColor.b - neutralColor.b) * ratioInSegment);
    }

    return `rgb(${r}, ${g}, ${b})`;
};

// function for bivariate color scale brown=low value, white=neutral, green=high value
// interpolates color from brown to white to green
export const getAcceptabilityColor = (value: number, minValue: number, maxValue: number): string => {
    // Handle edge cases where minValue == maxValue
    const ratio = minValue === maxValue ? 0 : (value - minValue) / (maxValue - minValue);

    // Hex values for divergent color scale
    // const negativeHex = '#8c510a';
    const negativeHex = '#d8b365'; // brown color for low values
    const neutralHex = '#f5f5f5'; // Neutral color
    const positiveHex = '#5ab4ac'; // green color for high values
    // const positiveHex = '#01665e'

    // Convert hex colors to RGB
    const positiveColor = hexToRgb(positiveHex);
    const neutralColor = hexToRgb(neutralHex);
    const negativeColor = hexToRgb(negativeHex);

    let r: number, g: number, b: number;

    if (ratio <= 0.5) {
        // Interpolate between negative and neutralColor -> brown to white
        const ratioInSegment = ratio / 0.5; // Normalize ratio to [0, 1]
        // end - start
        r = Math.round(negativeColor.r + (neutralColor.r - negativeColor.r) * ratioInSegment);
        g = Math.round(negativeColor.g + (neutralColor.g - negativeColor.g) * ratioInSegment);
        b = Math.round(negativeColor.b + (neutralColor.b - negativeColor.b) * ratioInSegment);
    } else {
        // Interpolate between neutral and negativeColor -> white to green
        const ratioInSegment = (ratio - 0.5) / 0.5; // Normalize ratio to [0, 1]
        // end - start
        r = Math.round(neutralColor.r + (positiveColor.r - neutralColor.r) * ratioInSegment);
        g = Math.round(neutralColor.g + (positiveColor.g - neutralColor.g) * ratioInSegment);
        b = Math.round(neutralColor.b + (positiveColor.b - neutralColor.b) * ratioInSegment);
    }

    return `rgb(${r}, ${g}, ${b})`;
};

// heatmap adjacent visualization --> recommendations are colored according to their rank
export function getRecommendationColor(value: number, minValue: number, maxValue: number): string {
    // Handle edge cases where minValue == maxValue
    const ratio = minValue === maxValue ? 0 : (value - minValue) / (maxValue - minValue);

    const neutralHex = '#f5f5f5'; // Neutral color
    const positiveHex = '#5ab4ac'; // green color for high values
    // const positiveHex = '#01665e'

    // Convert hex colors to RGB
    const positiveColor = hexToRgb(positiveHex);
    const neutralColor = hexToRgb(neutralHex);

    // Interpolate between neutral and positive colors
    const r = Math.round(neutralColor.r + (positiveColor.r - neutralColor.r) * ratio);
    const g = Math.round(neutralColor.g + (positiveColor.g - neutralColor.g) * ratio);
    const b = Math.round(neutralColor.b + (positiveColor.b - neutralColor.b) * ratio);

    return `rgb(${r}, ${g}, ${b})`;
}
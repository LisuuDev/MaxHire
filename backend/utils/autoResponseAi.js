async function generateContentWithRetry(
  model,
  prompt,
  maxRetries = 3,
  baseDelayMs = 1000,
) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result;
    } catch (error) {
      if (attempt === maxRetries - 1) {
        console.error(
          `Gemini API zawiodło po ${maxRetries} próbach. Ostatni błąd:`,
          error.message,
        );
        throw error;
      }

      if (error.message.includes("503") || error.message.includes("429")) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        console.warn(
          ` Błąd API Gemini (${error.message}). Ponawiam za ${delay}ms... (Próba ${attempt + 1}/${maxRetries})`,
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

module.exports = generateContentWithRetry;

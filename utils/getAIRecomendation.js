function extractJson(text) {
  const cleanedText = String(text || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const start = cleanedText.indexOf("[");
  const end = cleanedText.lastIndexOf("]");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI response did not contain a JSON array");
  }

  return cleanedText.slice(start, end + 1);
}

function buildFallbackRecommendations(products) {
  return products.slice(0, 5).map((product) => ({
    id: product.id,
    name: product.name,
    reason: "Matched with your search keywords.",
  }));
}

export async function getAIRecommendation(userPrompt, products) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return buildFallbackRecommendations(products);
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const geminiPrompt = `
You are an AI product recommendation system.

User query:
"${userPrompt}"

Available products:
${JSON.stringify(products, null, 2)}

Recommend top 5 best matching products.

Return ONLY JSON like:
[
  {
    "id": "",
    "name": "",
    "reason": ""
  }
]
`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: geminiPrompt }
          ]
        }
      ]
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Gemini API error:", JSON.stringify(data, null, 2));
    return buildFallbackRecommendations(products);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  try {
    const parsed = JSON.parse(extractJson(text));

    if (!Array.isArray(parsed)) {
      return buildFallbackRecommendations(products);
    }

    const productIds = new Set(products.map((product) => String(product.id)));

    return parsed
      .filter((item) => item && productIds.has(String(item.id)))
      .slice(0, 5)
      .map((item) => ({
        id: item.id,
        name: item.name || products.find((product) => String(product.id) === String(item.id))?.name,
        reason: item.reason || "Matched with your search keywords.",
      }));
  } catch (error) {
    console.error("AI response parsing failed:", error.message);
    return buildFallbackRecommendations(products);
  }
}

export const getAIRecomendation = getAIRecommendation;

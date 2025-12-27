
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiAnalysis } from "../types";

// =============================================================================
// YOUTUBE METADATA FETCHING
// =============================================================================
const fetchYoutubeMetadata = async (url: string): Promise<{ title: string; author: string } | null> => {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await fetch(oembedUrl);
    if (!response.ok) return null;
    const data = await response.json();
    return {
      title: data.title,
      author: data.author_name
    };
  } catch (error) {
    console.warn("Failed to fetch YouTube metadata:", error);
    return null;
  }
};

// =============================================================================
// SOCIAL MEDIA DETECTION
// =============================================================================
type SocialMediaPlatform = 'youtube' | 'twitter' | 'instagram' | 'tiktok' | 'linkedin' | 'reddit' | 'github' | 'other';

const detectPlatform = (url: string): SocialMediaPlatform => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return 'youtube';
  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return 'twitter';
  if (lowerUrl.includes('instagram.com') || lowerUrl.includes('tiktok.com')) return 'tiktok';
  if (lowerUrl.includes('linkedin.com')) return 'linkedin';
  if (lowerUrl.includes('reddit.com')) return 'reddit';
  if (lowerUrl.includes('github.com')) return 'github';
  return 'other';
};

const getPlatformPromptContext = (platform: SocialMediaPlatform): string => {
  switch (platform) {
    case 'youtube':
      return `C'est une vidéo YouTube. IMPORTANT: Utilise les métadonnées fournies (Titre/Auteur) pour comprendre le sujet. Le titre original est souvent la meilleure source. Résume le contenu éducatif ou informatif.`;
    case 'twitter':
      return `C'est un post Twitter/X. Analyse le contenu du tweet.`;
    case 'instagram':
      return `C'est un post Instagram. Analyse la description.`;
    case 'tiktok':
      return `C'est une vidéo TikTok. Analyse le sujet.`;
    case 'linkedin':
      return `C'est un post LinkedIn. Contexte professionnel.`;
    case 'reddit':
      return `C'est un post Reddit.`;
    case 'github':
      return `C'est un projet GitHub.`;
    default:
      return `Analyse le contenu principal de cette page web.`;
  }
};

// =============================================================================
// MAIN ANALYSIS FUNCTION
// =============================================================================
export const analyzeLink = async (url: string, existingCategories: string[] = []): Promise<GeminiAnalysis> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("API Key is missing. Returning default data.");
    return {
      title: "Lien (Clé API manquante)",
      summary: "Veuillez configurer votre clé API Gemini dans .env.local",
      category: "Non classé",
      tags: ["setup-required"]
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  const platform = detectPlatform(url);

  // Fetch extra context for crucial platforms
  let context = getPlatformPromptContext(platform);
  if (platform === 'youtube') {
    const output = await fetchYoutubeMetadata(url);
    if (output) {
      context += `\n\nMETADONNÉES YOUTUBE OFFICIELLES :\nTitre complet : "${output.title}"\nChaîne : "${output.author}"\nUtilise ce titre complet pour l'analyse.`;
    }
  }

  // Categories logic
  const uniqueExisting = Array.from(new Set(existingCategories.filter(c => c && c !== 'Non classé')));
  const categoriesContext = uniqueExisting.length > 0
    ? `Voici les catégories déjà utilisées par l'utilisateur : ${uniqueExisting.join(', ')}.
    
    TA MISSION POUR LA CATÉGORIE :
    1. Regarde si le contenu correspond VRAIMENT à une catégorie existante. Si oui, choisis-la.
    2. Si aucune catégorie existante ne correspond bien, propose une NOUVELLE catégorie pertinente et courte (ex: "Astrophysique", "Cuisine", "Marketing").
    3. N'utilise "Non classé" qu'en dernier recours.
    `
    : "Aucune catégorie existante. Propose la catégorie la plus pertinente.";

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout Gemini API")), 20000)
    );

    const prompt = `Tu es un assistant de productivité expert. Analyse ce lien.

${context}

${categoriesContext}

INSTRUCTIONS DE SORTIE :
1. Titre : Le titre réel et complet du contenu (max 80 caractères).
2. Résumé : Une phrase claire et informative (pas de clickbait).
3. Catégorie : La catégorie choisie (existante ou nouvelle).
4. Tags : 3 tags précis en minuscules.

URL: ${url}`;

    const apiCallPromise = ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            category: { type: Type.STRING },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "summary", "category", "tags"]
        }
      }
    });

    const response = await Promise.race([apiCallPromise, timeoutPromise]) as any;

    const text = response.text;
    if (!text) throw new Error("Réponse vide de l'IA");

    const parsed = JSON.parse(text) as GeminiAnalysis;

    // Formatting: Capitalize category
    parsed.category = parsed.category.charAt(0).toUpperCase() + parsed.category.slice(1);

    // Normalize tags
    parsed.tags = parsed.tags.map(tag => tag.toLowerCase().trim().replace(/\s+/g, '-'));

    return parsed;
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      title: "Nouveau Lien",
      summary: "L'analyse automatique n'a pas pu être complétée.",
      category: "Non classé",
      tags: ["link"]
    };
  }
};

import { GoogleGenAI, Type } from "@google/genai";
import { Category, Movie } from "../types";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Fallback data with requested Italian categories including "Altri video"
const FALLBACK_CATEGORIES: Category[] = [
  {
    title: "Conferenze",
    movies: [
      { id: "c1", title: "Il Futuro dell'Archeologia", description: "Un dibattito sulle nuove tecnologie applicate agli scavi.", matchScore: 98, year: 2024, duration: "1h 15m", genre: "Conferenza" },
      { id: "c2", title: "Storia Romana: Nuove Scoperte", description: "Esperti discutono i recenti ritrovamenti a Pompei.", matchScore: 95, year: 2023, duration: "1h 45m", genre: "Conferenza" },
      { id: "c3", title: "L'Egitto Segreto", description: "Conferenza internazionale sugli enigmi della Valle dei Re.", matchScore: 88, year: 2022, duration: "2h 05m", genre: "Conferenza" },
      { id: "c4", title: "Medioevo Digitale", description: "Come l'AI sta ricostruendo i manoscritti perduti.", matchScore: 92, year: 2024, duration: "55m", genre: "Conferenza" },
    ]
  },
  {
    title: "Pillole di storia",
    movies: [
      { id: "p1", title: "L'invenzione della ruota", description: "5 minuti per capire come è cambiato il mondo.", matchScore: 89, year: 2023, duration: "5m", genre: "Documentario Breve" },
      { id: "p2", title: "Napoleone in breve", description: "Ascesa e caduta dell'imperatore in 10 minuti.", matchScore: 85, year: 2021, duration: "10m", genre: "Documentario Breve" },
      { id: "p3", title: "La Rivoluzione Industriale", description: "Come il vapore ha trasformato la società.", matchScore: 94, year: 2022, duration: "8m", genre: "Educational" },
      { id: "p4", title: "Chi era Giulio Cesare?", description: "Ritratto rapido del condottiero romano.", matchScore: 91, year: 2023, duration: "12m", genre: "Biografico" },
    ]
  },
  {
    title: "Scavi archeologici",
    movies: [
      { id: "s1", title: "Pompei: Gli Ultimi Giorni", description: "Documentario immersivo sugli scavi della Regio V.", matchScore: 99, year: 2023, duration: "1h 30m", genre: "Documentario" },
      { id: "s2", title: "La Tomba Perduta", description: "Una spedizione nel deserto alla ricerca di una regina dimenticata.", matchScore: 87, year: 2020, duration: "1h 10m", genre: "Avventura Reale" },
      { id: "s3", title: "Sotto Roma", description: "Esplorazione dei sotterranei della città eterna.", matchScore: 93, year: 2022, duration: "50m", genre: "Documentario" },
      { id: "s4", title: "I Vichinghi in America", description: "Le prove archeologiche dello sbarco prima di Colombo.", matchScore: 88, year: 2021, duration: "1h 20m", genre: "Storico" },
      { id: "s5", title: "Gobekli Tepe", description: "Il tempio più antico del mondo svelato.", matchScore: 96, year: 2024, duration: "1h 40m", genre: "Documentario" },
    ]
  },
  {
    title: "Altri video",
    movies: []
  }
];

export const fetchMoviesWithGemini = async (): Promise<Category[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Generate a list of 4 movie categories strictly titled: 'Conferenze', 'Pillole di storia', 'Scavi archeologici', 'Altri video'. The 'Altri video' category should be empty. For other categories, generate 4-5 realistic fictional items fitting the theme. Return JSON.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              movies: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    matchScore: { type: Type.INTEGER },
                    year: { type: Type.INTEGER },
                    duration: { type: Type.STRING },
                    genre: { type: Type.STRING },
                  },
                  required: ["id", "title", "description", "matchScore", "year", "duration", "genre"]
                }
              }
            },
            required: ["title", "movies"]
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text) as Category[];
      // Validate categories match requested titles roughly, if not, fallback or merge
      const requiredTitles = ["Conferenze", "Pillole di storia", "Scavi archeologici", "Altri video"];
      const hasAllTitles = requiredTitles.every(t => data.some(c => c.title.toLowerCase().includes(t.toLowerCase())));
      
      if (hasAllTitles) {
          return data;
      }
    }
    return FALLBACK_CATEGORIES;
  } catch (error) {
    console.error("Gemini API Error, using fallback data:", error);
    return FALLBACK_CATEGORIES;
  }
};

export const searchMoviesWithGemini = async (query: string): Promise<Movie[]> => {
  try {
     const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate 6 fictional movie suggestions based on the search query: "${query}". Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              matchScore: { type: Type.INTEGER },
              year: { type: Type.INTEGER },
              duration: { type: Type.STRING },
              genre: { type: Type.STRING },
            },
            required: ["id", "title", "description", "matchScore", "year", "duration", "genre"]
          }
        }
      }
    });
     if (response.text) {
      return JSON.parse(response.text) as Movie[];
    }
    return [];
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}
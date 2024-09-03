import { writeFileSync } from "fs";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const predefinedPrompts = [
  "Can you suggest some movies?",
  "Recommend a movie for me.",
  "What should I watch?",
  "I'm looking for a good movie.",
  "Can you help me find a movie?",
  "I want to watch a movie.",
  "I'm in the mood for an action movie.",
  "Show me some thrillers.",
  "What action movies do you recommend?",
  "Suggest a movie in the comedy genre.",
  "I'm interested in sci-fi films.",
  "Can you give me a recommendation for a romantic movie?",
  "What are some great dramas to watch?",
  "Find me a good horror movie.",
  "I feel like watching a documentary.",
  "Can you suggest a classic film?",
  "I'm looking for an adventure movie.",
  "Give me some recommendations for animated movies.",
  "What are the latest movie releases?",
  "Show me top-rated movies in the fantasy genre.",
  "I want to see a movie with a strong female lead.",
  "Can you recommend a movie based on a true story?",
  "What are some popular movies this year?",
  "I’m looking for critically acclaimed films.",
  "Suggest a movie with a great soundtrack.",
  "What are some family-friendly movies?",
  "Show me some movies with a twist ending.",
  "I want to watch a movie that won an award.",
  "Can you find me a movie with a plot set in space?",
  "What are some must-watch indie films?",
  "I’m in the mood for a feel-good movie.",
  "Recommend a movie with a great plot.",
  "I’m interested in movies directed by Spielberg.",
  "Can you find a movie with a strong social message?",
  "What are some highly recommended foreign films?",
  "Suggest a movie with a unique storyline.",
  "I want to watch a film that’s critically acclaimed.",
  "Can you recommend a movie that’s a great watch for the weekend?",
  "Show me some movies that are perfect for a movie night.",
  "I’m interested in movies with complex characters.",
  "What’s a good movie to watch with friends?",
  "Can you find a movie with a memorable villain?",
  "I’m looking for a movie with a historical setting.",
  "Show me some movies that have won Oscars.",
  "Can you recommend a movie with a great twist?",
  "I want to watch a movie that’s visually stunning.",
  "What are some recent hits in the action genre?",
  "Find me a movie with excellent cinematography.",
  "Suggest a film with a compelling love story.",
  "What are some must-see movies in the last decade?",
  "I’m interested in movies with a focus on adventure.",
  "What are some underrated movies worth watching?",
  "Can you find a movie with a strong ensemble cast?",
  "i want to watch an interesting movie",
  "i need a romantic movie",
  "Can you recommend an action movie?",
  "What are some good action films?",
  "I'm looking for action-packed movies.",
  "Can you suggest some movies?",
  "Recommend a movie for me.",
  "What should I watch?",
  "I'm looking for a good movie.",
  "Can you help me find a movie?",
  "I want to watch a movie.",

  // Action
  "I'm in the mood for an action movie.",
  "What action movies do you recommend?",
  "Can you recommend an action movie?",
  "What are some good action films?",
  "I'm looking for action-packed movies.",
  "Show me some recent hits in the action genre.",

  // Thriller
  "Show me some thrillers.",
  "What are some suspenseful movies?",
  "I want to watch a thriller.",

  // Comedy
  "Suggest a movie in the comedy genre.",
  "Can you recommend a funny movie?",
  "I’m looking for a good comedy.",

  // Sci-Fi
  "I'm interested in sci-fi films.",
  "Can you find me a sci-fi movie?",
  "What are some great science fiction films?",

  // Romance
  "Can you give me a recommendation for a romantic movie?",
  "I need a romantic film.",
  "Suggest a movie with a love story.",

  // Drama
  "What are some great dramas to watch?",
  "Can you find me a dramatic film?",
  "I want to watch a drama movie.",

  // Horror
  "Find me a good horror movie.",
  "I’m in the mood for a horror film.",
  "What are some scary movies to watch?",

  // Documentary
  "I feel like watching a documentary.",
  "Can you suggest a good documentary?",

  // Classic
  "Can you suggest a classic film?",
  "What are some must-see classic movies?",

  // Adventure
  "I'm looking for an adventure movie.",
  "What are some exciting adventure films?",
  "Can you recommend a movie with a lot of adventure?",

  // Animated
  "Give me some recommendations for animated movies.",
  "What are some great animated films?",

  // Latest Releases
  "What are the latest movie releases?",
  "Show me new movies out this year.",

  // Fantasy
  "Show me top-rated movies in the fantasy genre.",
  "Can you recommend a fantasy film?",

  // Strong Female Lead
  "I want to see a movie with a strong female lead.",
  "Can you suggest a film with a powerful female protagonist?",

  // Based on True Story
  "Can you recommend a movie based on a true story?",
  "What are some films inspired by real events?",

  // Popular
  "What are some popular movies this year?",
  "Can you find me a trending movie?",

  // Critically Acclaimed
  "I’m looking for critically acclaimed films.",
  "Show me movies with high ratings from critics.",

  // Great Soundtrack
  "Suggest a movie with a great soundtrack.",
  "What are some films known for their music?",

  // Family-Friendly
  "What are some family-friendly movies?",
  "Can you recommend a movie for all ages?",

  // Twist Ending
  "Show me some movies with a twist ending.",
  "Can you find a film with an unexpected ending?",

  // Award-Winning
  "I want to watch a movie that won an award.",
  "What are some Oscar-winning films?",

  // Space Setting
  "Can you find me a movie with a plot set in space?",
  "What are some sci-fi movies set in outer space?",

  // Indie Films
  "What are some must-watch indie films?",
  "Can you recommend an independent film?",

  // Feel-Good
  "I’m in the mood for a feel-good movie.",
  "Show me some uplifting films.",

  // Great Plot
  "Recommend a movie with a great plot.",
  "What are some movies with a compelling story?",

  // Directed by Spielberg
  "I’m interested in movies directed by Spielberg.",
  "Can you suggest a film by Steven Spielberg?",

  // Social Message
  "Can you find a movie with a strong social message?",
  "What are some films with important societal themes?",

  // Foreign Films
  "What are some highly recommended foreign films?",
  "Can you recommend a great international movie?",

  // Unique Storyline
  "Suggest a movie with a unique storyline.",
  "What are some films with an original plot?",

  // Critically Acclaimed (Another Variation)
  "I want to watch a film that’s critically acclaimed.",
  "What are some top-rated movies?",

  // Great for Weekend
  "Can you recommend a movie that’s a great watch for the weekend?",
  "What are some good weekend movie picks?",

  // Movie Night
  "Show me some movies that are perfect for a movie night.",
  "What films are ideal for a movie night with friends?",

  // Complex Characters
  "I’m interested in movies with complex characters.",
  "Can you find a film with deep, well-developed characters?",

  // With Friends
  "What’s a good movie to watch with friends?",
  "Suggest a film for a group of friends.",

  // Memorable Villain
  "Can you find a movie with a memorable villain?",
  "What are some films with iconic antagonists?",

  // Historical Setting
  "I’m looking for a movie with a historical setting.",
  "What are some films set in the past?",

  // Oscar-Winning
  "Show me some movies that have won Oscars.",
  "Can you recommend an award-winning film?",

  // Great Twist
  "Can you recommend a movie with a great twist?",
  "What films have surprising plot twists?",

  // Visually Stunning
  "I want to watch a movie that’s visually stunning.",
  "What are some movies known for their beautiful visuals?",

  // Excellent Cinematography
  "Find me a movie with excellent cinematography.",
  "What films have impressive camera work?",

  // Compelling Love Story
  "Suggest a film with a compelling love story.",
  "What are some movies with a great romance?",

  // Last Decade
  "What are some must-see movies in the last decade?",
  "Can you recommend films from the past ten years?",

  // Focus on Adventure
  "I’m interested in movies with a focus on adventure.",
  "What are some great adventure films?",

  // Underrated Movies
  "What are some underrated movies worth watching?",
  "Can you suggest some hidden gem films?",

  // Strong Ensemble Cast
  "Can you find a movie with a strong ensemble cast?",
  "What films feature a great cast of actors?",

  // Interesting Movie
  "I want to watch an interesting movie.",
  "Find me a movie that’s engaging and captivating.",

  // Romantic Movie
  "I need a romantic movie.",
  "Can you suggest a film with romance?",
];

async function generateEmbeddings() {
  try {
    const response = await openai.embeddings.create({
      input: predefinedPrompts,
      model: "text-embedding-3-small",
    });

    const embeddings = response.data.map((embedding, index) => ({
      prompt: predefinedPrompts[index],
      embedding: embedding.embedding,
    }));

    writeFileSync(
      "./app/_data/predefinedEmbeddings.json",
      JSON.stringify(embeddings, null, 2)
    );
    console.log("Embeddings saved to predefinedEmbeddings.json");
  } catch (error) {
    console.error("Error generating embeddings:", error);
  }
}

generateEmbeddings();

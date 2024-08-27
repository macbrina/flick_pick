import axios from "axios";

const HUGGING_FACE_API_URL =
  "https://api-inference.huggingface.co/models/bert-base-uncased";
const HUGGING_FACE_API_KEY = process.env.HUGGINGFACE_API_TOKEN;

const headers = {
  Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
};

async function getEntities(text) {
  const response = await axios.post(
    `${HUGGING_FACE_API_URL}`,
    { inputs: text },
    { headers }
  );
  return response.data;
}

async function getIntents(text) {
  const response = await axios.post(
    `${HUGGING_FACE_API_URL}`,
    { inputs: text },
    { headers }
  );
  return response.data;
}

export async function processQuery(query) {
  const entities = await getEntities(query);
  const intents = await getIntents(query);
  return { entities, intents };
}

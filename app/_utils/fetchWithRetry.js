import { MAX_RETRIES, MAX_RETRY_DELAY } from "@/app/_utils/constants";

export async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Attempt ${i + 1} failed:`, errorText);
        throw new Error(errorText || "Failed to fetch data");
      }

      return response;
    } catch (error) {
      if (i === retries - 1) {
        throw error;
      }

      console.log(`Retrying request... (${i + 1}/${retries})`);
      await new Promise((resolve) => setTimeout(resolve, MAX_RETRY_DELAY));
    }
  }
}

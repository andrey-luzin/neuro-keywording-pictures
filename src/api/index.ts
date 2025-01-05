import { ChatGPTGenerateKeywordsResponse } from "@/types/chatGPT";

export const generateKeywords = async (file: File): Promise<ChatGPTGenerateKeywordsResponse> => {
  try {
    const formData = new FormData();
    formData.append("file", file, file.name);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('/api/chatgpt/generate-keywords', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${errorText}`);
    }
    
    const json = await response.json();
    return json;
  } catch (error: any) {
    throw new Error(`${error.message}`);
  }
};

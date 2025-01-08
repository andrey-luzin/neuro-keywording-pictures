import { ChatGPTGenerateKeywordsResponse, GenerateKeywordsResultType } from "@/types/chatGPT";

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

export const checkResults = async (results: GenerateKeywordsResultType) => {
  try {
    const formData = new FormData();
    formData.append('fileName', results.fileName);
    if (results.keywords) {
      formData.append('keywords', results.keywords);
    }
    if (results.description) {
      formData.append('description', results.description);
    }
    formData.append('file', results.file);

    const response = await fetch('/api/chatgpt/check-results', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${errorText}`);
    }
    
    const json = await response.json();
    return json;
    
  } catch (error: any) {
    throw new Error(`${error.message}`);
  }
}

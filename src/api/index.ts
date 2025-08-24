import { ChatGPTGenerateKeywordsResponse, ChatGptModels, GenerateKeywordsResultType } from "@/types/chatGPT";

export const generateKeywords = async (file: File, model?: ChatGptModels): Promise<ChatGPTGenerateKeywordsResponse> => {
  try {
    console.log('Start generate keywords');
    const formData = new FormData();
    formData.append("file", file, file.name);
    formData.append("model", model || ChatGptModels.GPT5);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

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
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`${error.message}`);
    } else {
      throw new Error('An unknown error occurred');
    }
  }
};

export const checkResults = async (fileData: GenerateKeywordsResultType, model?: ChatGptModels) => {
  try {
    const preparedData = {
      fileName: fileData.fileName,
      keywords: fileData.keywords,
      description: fileData.description,
      model: model || ChatGptModels.GPT5,
    }

    const response = await fetch('/api/chatgpt/check-results', {
      method: 'POST',
      body: JSON.stringify(preparedData),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${errorText}`);
    }
    
    const json = await response.json();
    return json;
    
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`${error.message}`);
    } else {
      throw new Error('An unknown error occurred');
    }
  }
};

export const generateCSV = async (data: ChatGPTGenerateKeywordsResponse[]) => {
  try {
    const response = await fetch('/api/generate-csv', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${errorText}`);
    }
    
    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`${error.message}`);
    } else {
      throw new Error('An unknown error occurred');
    }
  }
}

export const updateExif = async (data: GenerateKeywordsResultType[]) => {
  try {
    const formData = new FormData();

    for (const result of data) {
      formData.append('files', result.file);
      formData.append('fileNames', result.fileName);
      formData.append('keywords', result.keywords || '');
      formData.append('descriptions', result.description || '');
    }

    const response = await fetch("/api/update-and-archive", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${errorText}`);
    }
    
    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`${error.message}`);
    } else {
      throw new Error('An unknown error occurred');
    }
  }
}
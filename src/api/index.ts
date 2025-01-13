import { ChatGPTGenerateKeywordsResponse, GenerateKeywordsResultType } from "@/types/chatGPT";

export const generateKeywords = async (file: File): Promise<ChatGPTGenerateKeywordsResponse> => {
  try {
    console.log('generateKeywords');
    const formData = new FormData();
    formData.append("file", file, file.name);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

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

export const checkResults = async (fileData: GenerateKeywordsResultType) => {
  try {
    const preparedData = {
      fileName: fileData.fileName,
      keywords: fileData.keywords,
      description: fileData.description
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
    const preparedFiles = await Promise.all(
      data.map((result) =>
          new Promise<ChatGPTGenerateKeywordsResponse & { file: string }>(
            (resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                resolve({
                  fileName: result.fileName,
                  keywords: result.keywords,
                  description: result.description,
                  file: (reader.result as string).split(",")[1],
                });
              };
              reader.onerror = (err) => reject(err);
              reader.readAsDataURL(result.file);
            }
          )
      )
    );
  
    const response = await fetch("/api/update-and-archive", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ files: preparedFiles }),
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
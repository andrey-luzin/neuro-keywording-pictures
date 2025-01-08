export type ChatGPTGenerateKeywordsResponse = {
  fileName: string;
  keywords?: string;
  description?: string;
  error?: string;
};

export type GenerateKeywordsResultType = {
  file: File;
} & ChatGPTGenerateKeywordsResponse;

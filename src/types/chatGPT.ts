export type ChatGPTGenerateKeywordsResponse = {
  fileName: string;
  keywords?: string;
  description?: string;
  error?: string;
};

export type GenerateKeywordsResultType = {
  file: File;
} & ChatGPTGenerateKeywordsResponse;

export enum ChatGptModels {
  GPT4o = 'gpt-4o',
  GPT4oLatest = 'chatgpt-4o-latest',
  GPT4oMini = 'gpt-4o-mini'
}
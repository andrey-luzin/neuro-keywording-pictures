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
  GPT5 = 'gpt-5',
  GPT4_1 = 'gpt-4.1'
  // GPT4o = 'gpt-4o',
  // GPT4oLatest = 'chatgpt-4o-latest',
  // GPT4oMini = 'gpt-4o-mini'
}
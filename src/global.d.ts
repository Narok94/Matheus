// --- Type Declarations for Build ---

// Fixes "Cannot find module '@google/genai'" build error.
// The module is loaded via an import map in index.html for the browser.
declare module '@google/genai' {
    export interface GenerateContentResponse {
        readonly text: string;
    }

    export interface Chat {
        sendMessage(args: { message: string }): Promise<GenerateContentResponse>;
    }

    export class GoogleGenAI {
        constructor(config: { apiKey: string });
        public chats: {
            create(args: {
                model: string;
                history: any[];
                config?: {
                    systemInstruction: string;
                };
            }): Chat;
        };
        public models: any;
    }

    // Stub other exports to prevent future errors.
    export type Type = any;
    export type FunctionDeclaration = any;
    export type LiveServerMessage = any;
    export type Modality = any;
    export type Blob = any;
}

// Fixes "Cannot find name 'process'" build error.
// process.env.API_KEY is injected by the execution environment.
// FIX: Augment the existing NodeJS namespace to add the API_KEY to process.env.
// This avoids redeclaring 'process' which causes conflicts with types from @types/node.
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
  }
}

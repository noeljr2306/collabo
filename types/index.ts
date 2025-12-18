import { type editor } from "monaco-editor";
export interface Theme {
  id: string;
  label: string;
  color: string;
}

export interface Language {
  id: string;
  label: string;
  logoPath: string;
  monacoLanguage: string;
  defaultCode: string;
  pistonRuntime: LanguageRuntime;
}

export interface LanguageRuntime {
  language: string;
  version: string;
}

export interface ExecuteCodeResponse {
  compile?: {
    output: string;
  };
  run?: {
    output: string;
    stderr: string;
  };
}

export interface ExecutionResult {
  code: string;
  output: string;
  error: string | null;
}

export interface CodeEditorState {
  language: string;
  theme: string;
  fontSize: number;
  output: string;
  isRunning: boolean;
  error: string | null;
  editor: editor.IStandaloneCodeEditor | null; // This must match!
  executionResult: any;

  getCode: () => string;
  setEditor: (editor: editor.IStandaloneCodeEditor) => void; // This must match!
  setTheme: (theme: string) => void;
  setFontSize: (fontSize: number) => void;
  setLanguage: (language: string) => void;
  runCode: () => Promise<void>;
}
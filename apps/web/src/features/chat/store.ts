import { useReducer } from "react";

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

interface ToolCallInfo {
  toolName: string;
  input: unknown;
  output?: unknown;
  status: "running" | "completed";
}

interface ChatState {
  sessionId: string | null;
  messages: Message[];
  streamingToken: string;
  isStreaming: boolean;
  currentTools: ToolCallInfo[];
}

type ChatAction =
  | { type: "SET_SESSION"; sessionId: string }
  | { type: "ADD_MESSAGE"; message: Message }
  | { type: "TOKEN_DELTA"; delta: string }
  | { type: "TOOL_STARTED"; toolName: string; input: unknown }
  | { type: "TOOL_COMPLETED"; toolName: string; output: unknown }
  | { type: "STREAM_END" }
  | { type: "RESET" };

const initialState: ChatState = {
  sessionId: null,
  messages: [],
  streamingToken: "",
  isStreaming: false,
  currentTools: [],
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "SET_SESSION":
      return { ...state, sessionId: action.sessionId };
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.message] };
    case "TOKEN_DELTA":
      return {
        ...state,
        streamingToken: state.streamingToken + action.delta,
        isStreaming: true,
      };
    case "TOOL_STARTED":
      return {
        ...state,
        currentTools: [
          ...state.currentTools,
          { toolName: action.toolName, input: action.input, status: "running" },
        ],
      };
    case "TOOL_COMPLETED":
      return {
        ...state,
        currentTools: state.currentTools.map((t) =>
          t.toolName === action.toolName
            ? { ...t, output: action.output, status: "completed" }
            : t,
        ),
      };
    case "STREAM_END": {
      const assistantMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: state.streamingToken,
      };
      return {
        ...state,
        messages:
          state.streamingToken.length > 0
            ? [...state.messages, assistantMsg]
            : state.messages,
        streamingToken: "",
        isStreaming: false,
        currentTools: [],
      };
    }
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export function useChatStore() {
  return useReducer(chatReducer, initialState);
}

export type { ChatState, ChatAction, Message, ToolCallInfo };

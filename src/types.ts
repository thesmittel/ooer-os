type UserDesktopElementConfig = {
  style: string;
  width: string;
  height: string;
};

type UserDesktopElement = {
  type: "widget";
  pos: [number, number];
  anchor: ["top" | "center" | "bottom", "left" | "center" | "right"];
  configuration: UserDesktopElementConfig;
};

type UserDesktopSymbol = {
  appid: string;
  text: string;
  label: string | null | undefined;
  icon: string | null | undefined;
  position: [number, number];
  locked: boolean;
};

export type User = {
  id: string;
  username: string;
  nickname?: string | null | undefined;
  email?: string | null | undefined;
  banner?: string | null | undefined;
  avatar?: string | null | undefined;
  status: "offline" | "online" | "do not disturb" | "busy";
  about: string | null | undefined;
  registered_apps?: string[];
  locked_apps?: string[];
  desktop_setup?: UserDesktopElement[];
  desktop_symbols?: UserDesktopSymbol[];
};

export type UserSession = {
  "user-id": string;
  token: string;
  cache: Map<string, object>;
  socket: WebSocket;
  expires: number;
};

export type SessionList = {
  assigned: Set<UserSession>;
  unassigned: Set<WebSocket>;
};

export type Token = {
  id: string;
  token: string;
  expires: number;
};

export type SocketRequest = {
  module: string;
  action: string;
  data: any;
};

export type SocketResponse = {
  module?: string;
  action?: string;
  data?: any;
};
export type CallbackList = {
  [key: string]: Function | null;
};

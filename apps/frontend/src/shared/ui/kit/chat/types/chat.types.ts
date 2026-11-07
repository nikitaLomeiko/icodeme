export interface IChatMessage {
  id: string;
  sender: "user" | "me";
  text: string;
}

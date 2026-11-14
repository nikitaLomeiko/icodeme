export interface IDatabaseConnector<T> {
  client: T;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

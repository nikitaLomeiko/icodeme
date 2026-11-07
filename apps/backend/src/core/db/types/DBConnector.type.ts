export interface IDBConnector<T> {
    client: T;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}
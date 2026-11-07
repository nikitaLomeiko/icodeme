import { LineFavorite } from "../../model/types";

export interface ICreateDocumentFavoriteParams {
  documentId: string;
  favorite: LineFavorite;
}

export interface IDeleteFavoriteParams {
  documentId: string;
  favoriteId: string;
}

export interface IGetDocumentFavoriteParams {
  documentId: string;
}

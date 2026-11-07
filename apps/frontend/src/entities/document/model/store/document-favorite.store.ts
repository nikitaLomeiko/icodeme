import { makeAutoObservable } from "mobx";
import { LineFavorite } from "../types";

class DocumentFavoriteStore {
  lineFavorites: LineFavorite[] = [];
  isShowFavorites: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  setLineFavorites = (favorites: LineFavorite[]) => {
    this.lineFavorites = favorites;
  };

  toggleShowFavorites = () => {
    this.isShowFavorites = !this.isShowFavorites;
  };

  removeLineFavoriteById = (id: string) => {
    const favorite = this.lineFavorites.find((f) => f.id === id);
    if (favorite) {
      const element = document.getElementById(favorite.elementId);
      if (element) {
        const indicator = element.querySelector("span");
        if (indicator) indicator.remove();
      }
    }

    this.setLineFavorites(this.lineFavorites.filter((f) => f.id !== id));
  };
}

export const documentFavoriteStore = new DocumentFavoriteStore();

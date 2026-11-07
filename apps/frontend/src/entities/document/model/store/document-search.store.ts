import { makeAutoObservable } from "mobx";
import { createRef } from "react";

class DocumentSearchStore {
  searchResultsRef: React.RefObject<HTMLElement[] | null> = createRef<[]>();
  searchQuery: string = "";
  totalResults: number = 0;
  currentResultIndex: number = -1;

  isShowSearch: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  setCurrentResultIndex = (index: number) => {
    this.currentResultIndex = index;
  };

  setSearchResultsRef = (ref: React.RefObject<HTMLElement[] | null>) => {
    this.searchResultsRef = ref;
  };

  setTotalResults = (total: number) => {
    this.totalResults = total;
  };

  setSearchQuery = (input: string) => {
    this.searchQuery = input;
  };

  toggleShowSearch = () => {
    this.isShowSearch = !this.isShowSearch;
  };
}

export const documentSearchStore = new DocumentSearchStore();

import { fontSize } from "@/shared/ui/kit";
import { makeAutoObservable } from "mobx";
import { createRef } from "react";

class DocumentOptionStore {
  documentId: string = "";
  content: string = "";
  title: string = "";

  contentRef: React.RefObject<HTMLDivElement | null> =
    createRef<HTMLDivElement | null>();

  searchResultsRef: React.RefObject<HTMLElement[] | null> = createRef<[]>();

  isScrollingProgrammaticallyRef: React.RefObject<boolean | null> =
    createRef<false>();

  fontSize: fontSize = "md";

  isZenMode: boolean = false;
  isOpenOptionMenu: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  setContent = (content: string) => {
    this.content = content;
  };

  setContentRef = (ref: React.RefObject<HTMLDivElement | null>) => {
    this.contentRef = ref;
  };

  setSearchResultsRef = (ref: React.RefObject<HTMLElement[] | null>) => {
    this.searchResultsRef = ref;
  };

  setFontSize = (size: fontSize) => {
    this.fontSize = size;
  };

  toggleZenMode = () => {
    this.isZenMode = !this.isZenMode;
  };

  toggleOptionMenu = () => {
    this.isOpenOptionMenu = !this.isOpenOptionMenu;
  };

  setDocumentId = (id: string) => {
    this.documentId = id;
  };
}

export const documentOptionStore = new DocumentOptionStore();

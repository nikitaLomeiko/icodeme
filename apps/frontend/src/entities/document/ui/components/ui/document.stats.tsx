import { FiClock, FiCode, FiFileText, FiImage } from "react-icons/fi";
import { DocumentStats } from "../../../model/types/document.types";

interface IProps {
  documentStats: DocumentStats;
}

export const DocumentStatistics: React.FC<IProps> = ({ documentStats }) => {
  return (
    <div className="flex items-center gap-3 text-xs text-gray-400 opacity-60 mr-5">
      <span className="sm:flex items-center gap-1 hidden">
        <FiFileText className="w-3 h-3" />
        {documentStats.wordCount.toLocaleString()}
      </span>
      <span className="sm:flex items-center gap-1 hidden">
        <FiImage className="w-3 h-3" />
        {documentStats.imageCount}
      </span>
      <span className="sm:flex items-center gap-1 hidden">
        <FiCode className="w-3 h-3" />
        {documentStats.codeBlockCount}
      </span>
      <span className="flex items-center gap-1">
        <FiClock className="w-3 h-3" />
        {documentStats.readingTime} мин
      </span>
    </div>
  );
};

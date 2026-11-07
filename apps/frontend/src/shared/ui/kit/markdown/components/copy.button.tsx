import { useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";

interface IProps {
  code: string;
}

export const CopyButton: React.FC<IProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
      aria-label="Copy code"
    >
      {copied ? (
        <FiCheck className="w-4 h-4 text-green-400" />
      ) : (
        <FiCopy className="w-4 h-4 text-gray-300 hover:text-white" />
      )}
    </button>
  );
};

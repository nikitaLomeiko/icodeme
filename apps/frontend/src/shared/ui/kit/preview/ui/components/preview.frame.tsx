interface IProps {
  document: string;
}

export const PreviewFrame: React.FC<IProps> = ({ document }) => {
  return (
    <iframe
      title="preview"
      srcDoc={document}
      sandbox="allow-scripts allow-forms allow-modals allow-popups"
      className="w-full h-full border-0 bg-white"
    />
  );
};

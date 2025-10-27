import Preview from "./Preview";
const PreviewList = () => {
  const list = [
    { id: 1, level: "easy" },
    { id: 2, level: "hard" },
    { id: 3, level: "medium" },
  ];
  return (
    <div>
      {list.map((preview) => (
        <Preview key={preview.id} preview={preview}></Preview>
      ))}
    </div>
  );
};

export default PreviewList;

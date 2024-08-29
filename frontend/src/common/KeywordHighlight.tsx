import React from 'react';

interface Props {
  text: string;
  keyword: string;
}

const KeywordHighlight: React.FC<Props> = (props) => {
  const { text, keyword } = props;
  const pos = keyword.length > 0 ? text.toLowerCase().indexOf(keyword.toLocaleLowerCase()) : -1;
  if (pos < 0) {
    return <span>{text}</span>;
  }
  const text1 = text.slice(0, pos);
  const text2 = text.slice(pos, pos + keyword.length);
  const text3 = text.slice(pos + keyword.length);
  return (
    <span>
      {text1}
      <span className="highlight">{text2}</span>
      {text3}
    </span>
  );
};

export default KeywordHighlight;

import React from 'react';

interface Props {
  keyword: string;
  children: React.ReactNode;
}

const KeywordHighlight: React.FC<Props> = (props) => {
  const { keyword, children } = props;
  if (typeof children !== 'string') {
    return children;
  } else {
    const text2highlight = (text: string): React.ReactNode => {
      const pos = keyword.length > 0 ? text.toLowerCase().indexOf(keyword.toLocaleLowerCase()) : -1;
      if (pos < 0) {
        return text;
      }
      const text1 = text.slice(0, pos);
      const text2 = text.slice(pos, pos + keyword.length);
      const text3 = text.slice(pos + keyword.length);
      return (
        <>
          {text1}
          <span className="highlight">{text2}</span>
          {text3.length > 0 ? text2highlight(text3) : text3}
        </>
      );
    };
    return <span>{text2highlight(children)}</span>;
  }
};

export default KeywordHighlight;

import {useEffect, useState} from "react";

interface TitleContainerProps {
  size?: number,
  initTitle?: string
}

function TitleContainer({size, initTitle}: Readonly<TitleContainerProps>) {
  const [title, setTitle] = useState(initTitle);
  useEffect(() => {
    setTitle(initTitle);
  }, [initTitle]);
  return (
      <div>
        <div style={{width: '100vw', fontSize: `${size}em`, textWrap: 'nowrap'}}>{title || <>&nbsp;</>}</div>
      </div>
  );
}

export default TitleContainer;
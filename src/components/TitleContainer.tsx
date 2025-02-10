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
        <input style={{
          fontSize: `${size}em`,
          width: '100%',
          textAlign: 'center',
          color: 'white',
          backgroundColor: 'black',
          border: 'none'
        }} type='text' value={title}
               onInput={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}/>
      </div>
  );
}

export default TitleContainer;
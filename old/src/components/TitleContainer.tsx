import {useContext} from "react";
import {generalContext} from "../GeneralContext.tsx";

function TitleContainer() {
  const {title, setTitle, titleSize} = useContext(generalContext)
  return (
    <div>
      <input className="title-input" style={{
        fontSize: `${titleSize}em`
      }} type='text' value={title}
             onInput={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}/>
    </div>
  );
}

export default TitleContainer;
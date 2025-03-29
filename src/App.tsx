import './App.css'
import CountdownContainer from "./components/CountdownContainer.tsx";
import TitleContainer from "./components/TitleContainer.tsx";
import GeneralContextProvider from "./GeneralContext.tsx";
import ControllerContainer from "./components/ControllerContainer.tsx";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";


function App() {
  return (
      <GeneralContextProvider>
        <DndProvider backend={HTML5Backend}>
          <CountdownContainer/>
          <TitleContainer/>
          <ControllerContainer/>
        </DndProvider>
      </GeneralContextProvider>
  )
}

export default App

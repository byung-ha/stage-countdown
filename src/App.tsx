import './App.css'
import CountdownContainer from "./components/CountdownContainer.tsx";
import TitleContainer from "./components/TitleContainer.tsx";
import GeneralContextProvider from "./GeneralContext.tsx";
import ControllerContainer from "./components/ControllerContainer.tsx";


function App() {
  return (
      <GeneralContextProvider>
        <CountdownContainer/>
        <TitleContainer/>
        <ControllerContainer/>
      </GeneralContextProvider>
  )
}

export default App

import "./App.css";
import Sidebar from "./components/Sidebar";
import { CameraProvider } from "./contexts/CameraContext";
import useSavedConfig from "./hooks/useSavedConfig";

function App(): JSX.Element {
  useSavedConfig();

  return (
    <CameraProvider>
      <div className="app-container">
        <Sidebar />
      </div>
    </CameraProvider>
  );
}

export default App;

import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "simplebar-react/dist/simplebar.min.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { BrowserRouter } from "react-router-dom";
import { LoaderProvider } from "./components/common/LoaderContext.tsx";
//* css for map display
import 'leaflet/dist/leaflet.css';
import { ToastContainer } from "react-toastify";


createRoot(document.getElementById("root")!).render(
  <>
    <ThemeProvider>
      <BrowserRouter>
        <LoaderProvider>
          <AppWrapper>
            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
            <App />
          </AppWrapper>
        </LoaderProvider>
      </BrowserRouter>
    </ThemeProvider>
  </>
);

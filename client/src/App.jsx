import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import About from "./pages/About";
import EDAAnalysis from "./components/EDAAnalysis";
import AuthApp from "./pages/Login";
import Profile from "./pages/Profile";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
  },
});

const AppContent = () => {
  const location = useLocation();
  const hideNavbarPaths = ['/login', '/signup'];
  const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname.toLowerCase());

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/EDA" element={<EDAAnalysis />} />
        <Route path="/login" element={<AuthApp />} />
        <Route path="/signup" element={<AuthApp />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
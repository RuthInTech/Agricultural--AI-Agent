import {Routes, Route, Outlet} from "react-router-dom";
import IntroPage from "./assets/Intro-page/IntroPage.jsx";
import Register from "./assets/Login-Registration/Register.jsx";
import Login from "./assets/Login-Registration/Login.jsx";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import HomePage from "./assets/Home-page/HomePage.jsx";
import MyFarm from "./assets/My-Farm/MyFarm.jsx";
import Recommendations from "./assets/Recommendations/Recommendations.jsx";
import Weather from "./assets/Weather/Weather.jsx";
import MarketPlace from "./assets/Market-Place/MarketPlace.jsx";
import Profile from "./assets/Profile/Profile.jsx";

function MainLayout(){
  return(
    <>
    <Header/>
    <Outlet/>
    </>
  );
}

function App() {
  return (
    <>
      <div className="agrivox-page-wrapper">
        <main className="app-main-content">
          <Routes>
            <Route path="/" element={<IntroPage/>}/>
            <Route path="/Register" element={<Register/>}/>
            <Route path="/Login" element={<Login/>}/>

            <Route element={<MainLayout/>}>
              <Route path="/Home" element={<HomePage/>}/>
              <Route path="/MyFarm" element={<MyFarm/>}/>
              <Route path="/Recommendations" element={<Recommendations/>}/>
              <Route path="/Weather" element={<Weather/>}/>
              <Route path="/MarketPlace" element={<MarketPlace/>}/>
              <Route path="/Profile" element={<Profile/>}/>
            </Route>
          </Routes>
        </main>
        <Footer/>
      </div>
    </>
  );
}

export default App

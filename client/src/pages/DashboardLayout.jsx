import { Outlet ,redirect, useLoaderData, useNavigate, useNavigation} from "react-router-dom";
import Wrapper from "../assets/wrappers/Dashboard";
import { BigSidebar, SmallSidebar, Navbar,Loading } from "../components";
import { createContext, useContext, useState } from "react";
import customFetch from "../utils/customFetch";
import {toast} from 'react-toastify';

export const loader = async () => {
  try{
    const {data} = await customFetch.get('/users/current-user')
    return data;
  }catch(error){
    return redirect('/');
  }
}

const DashboardContext = createContext();

// eslint-disable-next-line react/prop-types
const DashboardLayout = ({isDarkThemeEnabled}) => {
  const {user} = useLoaderData();
  const navigate = useNavigate();

  const navigation = useNavigation();
  const isPageLoading = navigation.state === 'loading';

  // console.log(user);
  //temp
  // const user = { name: "john" };

  const [showSidebar, setShowSidebar] = useState(false);

  const [isDarkTheme, setIsDarkTheme] = useState(isDarkThemeEnabled);

  const toggleDarkTheme = () => {
    const newDarkTheme = !isDarkTheme;
    setIsDarkTheme(newDarkTheme);
    document.body.classList.toggle('dark-theme',newDarkTheme);

    localStorage.setItem('darkTheme',newDarkTheme);
    // console.log("toggle dark theme");
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const logoutUser = async () => {
    console.log("logout user");
    navigate('/')
    await customFetch.get('/auth/logout');
    toast.success('Logging out...');
  };

  return (
    <DashboardContext.Provider value={{ user, showSidebar, isDarkTheme, toggleDarkTheme, toggleSidebar, logoutUser }}>
      <Wrapper>
        <main className="dashboard">
          <SmallSidebar />
          <BigSidebar />
          <div>
            <Navbar />
            <div className="dashboard-page">
              {isPageLoading ? <Loading /> : <Outlet context={{user}}/>}              
            </div>
          </div>
        </main>
      </Wrapper>
    </DashboardContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useDashboardContext = () => useContext(DashboardContext);

export default DashboardLayout;

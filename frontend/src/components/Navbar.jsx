import { useNavigate } from "react-router-dom";
import axios from "axios";

import { navbarStyles } from "../assets/dummyStyles";
import img1 from "../assets/logo.png";
import { useEffect, useRef, useState } from "react";

import { ChevronDown, LogOut, User } from "lucide-react";

const BASE_URL = "http://localhost:4000/api";

const Navbar = ({ user: propUser, onLogout }) => {
  const menuRef = useRef();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState([]);
  const navigate = useNavigate();

  // const user = propUser || {
  //   name: "",
  //   email: "",
  // };

  // Fetch the user data from server
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = axios.get(`${BASE_URL}/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = (await response).data.user || response.data;
        setUser(userData);
      } catch (error) {
        console.error("Failed to load the user profile", error);
      }
    };

    if (!propUser) {
      fetchUserData();
    }
  }, [propUser]);

  const handleLogout = () => {
    setMenuOpen(false);
    localStorage.removeItem("token");
    onLogout?.();
    navigate("/login");
  };

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  // Close the toggle menu when outside the menu box is clicked
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className={navbarStyles.header}>
      <div className={navbarStyles.container}>
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className={navbarStyles.logoContainer}
        >
          <div className={`${navbarStyles.logoImage} `}>
            <img src={img1} alt='Amkam Expense Tracker' />{" "}
          </div>
          <span className={navbarStyles.logoText}>Amkam ExpTracker</span>
        </div>

        {/* User */}
        {user && (
          <div className={navbarStyles.userContainer} ref={menuRef}>
            <button onClick={toggleMenu} className={navbarStyles.userButton}>
              <div className=' relative'>
                <div className={navbarStyles.userAvatar}>
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className={navbarStyles.statusIndicator}></div>
              </div>
              <div className={navbarStyles.userTextContainer}>
                <p className={navbarStyles.userName}>{user?.name || "User"}</p>
                <p className={navbarStyles.userEmail}>
                  {user?.email || "user@amkamexptracker.com"}
                </p>
              </div>

              <ChevronDown className={navbarStyles.chevronIcon(menuOpen)} />
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div className={navbarStyles.dropdownMenu}>
                <div className={navbarStyles.dropdownHeader}>
                  <div className=' flex items-center gap-3'>
                    <div className={`${navbarStyles.dropdownAvatar}`}>
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>

                    <div>
                      <div className={navbarStyles.dropdownName}>
                        {user?.name || "User"}
                      </div>
                      <div className={navbarStyles.dropdownEmail}>
                        {user?.email || "user@amkamexptracker.com"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={navbarStyles.menuItemContainer}>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/profile");
                    }}
                    className={navbarStyles.menuItem}
                  >
                    <User className='w-4 h-4' />
                    <span>My Profile</span>
                  </button>
                </div>

                <div className={navbarStyles.menuItemBorder}>
                  <button
                    onClick={handleLogout}
                    className={navbarStyles.logoutButton}
                  >
                    <LogOut className='w-4 h-4' />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

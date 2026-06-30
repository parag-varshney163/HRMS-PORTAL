import React, { useEffect, useState, useCallback, useRef, useMemo, } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";

import axiosInstance from "../../api/axiosInstance";
import MENU_ITEMS from "../../constants/menu";
import { useAuth } from "../../hooks/useAuth";
import colors from "../../constants/colors";
import ProfileModal from "./ProfileModal";
import logo from "../../assets/logo.webp";


// ─── HELPER: Recursive Role Filter ───
const filterMenuByRole = (items, role) => {
  return items.reduce((acc, item) => {
    if (item.isLogout) {
      acc.push(item);
      return acc;
    }

    const hasPermission = item.allowedRoles
      ? item.allowedRoles.includes(role)
      : true;

    if (hasPermission) {
      if (item.children) {
        const filteredChildren = filterMenuByRole(item.children, role);
        acc.push({ ...item, children: filteredChildren });
      } else {
        acc.push(item);
      }
    }
    return acc;
  }, []);
};

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selected, setSelected] = useState("");
  const [expandedMenus, setExpandedMenus] = useState({});
  const sidebarRef = useRef(null);
  // const [profileOpen, setProfileOpen] = useState(false);
  // const [profileData, setProfileData] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const fetchProfile = async () => {
    try {
      // Open instantly
      setProfileOpen(true);
      setProfileLoading(true);

      const { data } = await axiosInstance.get(
        "/api/v1/user/my-profile"
      );

      if (data.success) {
        setProfileData(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setProfileLoading(false);
    }
  };

  // ─── COMPUTE VISIBLE MENUS ───
  const visibleMenuItems = useMemo(() => {
    const currentRole = (user?.role || "employee").toLowerCase();
    return filterMenuByRole(MENU_ITEMS, currentRole);
  }, [user?.role]);

  // ─── CLICK OUTSIDE (MOBILE) ───
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        toggleSidebar();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, toggleSidebar]);

  // ─── AUTO-SELECT ACTIVE ITEM ───
  useEffect(() => {
    const path = location.pathname;
    const topMatch = MENU_ITEMS.find((item) => item.path === path);

    if (topMatch) {
      setSelected(topMatch.name);
      return;
    }

    for (const item of MENU_ITEMS) {
      if (item.children) {
        const childMatch = item.children.find((child) => child.path === path);
        if (childMatch) {
          setSelected(childMatch.name);
          setExpandedMenus((prev) => ({ ...prev, [item.name]: true }));
          return;
        }
      }
    }
  }, [location.pathname]);

  const toggleExpand = useCallback((name) => {
    setExpandedMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  }, []);

  const handleClick = useCallback(
    (item) => {
      if (item.isLogout) {
        logout();
        return;
      }

      if (item.children && item.children.length > 0) {
        toggleExpand(item.name);
        setSelected(item.name);
        if (item.path) navigate(item.path);
        return;
      }

      setSelected(item.name);
      navigate(item.path);

      if (window.innerWidth < 768 && isOpen) {
        toggleSidebar();
      }
    },
    [navigate, toggleExpand, isOpen, toggleSidebar, logout],
  );

  // ─── RENDER MENU ITEM ───
  // const renderMenuItem = (item, isChild = false) => {
  //   const Icon = item.icon;
  //   const active = selected === item.name;
  //   const hasChildren = item.children && item.children.length > 0;
  //   const isExpanded = expandedMenus[item.name];

  //   return (
  //     <div key={item.name}>
  //       <div
  //         onClick={() => handleClick(item)}
  //         className={`flex items-center gap-3 cursor-pointer rounded-xl py-3 px-3.5 mb-1 ${isChild ? "ml-8 mr-3 mt-1" : "mx-3"
  //           } select-none transition-all duration-200 ${active
  //             ? "bg-btn/10 text-btn font-semibold" // Active state styling
  //             : "hover:bg-hover text-text-secondary hover:text-text-primary"
  //           } ${item.isLogout ? "text-red-400 hover:text-red-400 hover:bg-red-400/10" : ""}`}
  //       >
  //         {Icon && (
  //           <Icon
  //             size={isChild ? 16 : 18}
  //             className={active ? "text-btn" : ""}
  //           />
  //         )}

  //         {isOpen && (
  //           <>
  //             <span
  //               className={`text-[13.5px] flex-1 tracking-wide ${isChild ? "text-[12.5px]" : ""}`}
  //             >
  //               {item.name}
  //             </span>
  //             {hasChildren && (
  //               <ChevronDown
  //                 size={14}
  //                 className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
  //               />
  //             )}
  //           </>
  //         )}
  //       </div>

  //       {hasChildren && isOpen && isExpanded && (
  //         <div className="overflow-hidden animate-in slide-in-from-top-2 duration-200">
  //           {item.children.map((child) => renderMenuItem(child, true))}
  //         </div>
  //       )}
  //     </div>
  //   );
  // };

  const renderMenuItem = (item, isChild = false) => {
    const Icon = item.icon;
    const active = selected === item.name;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus[item.name];

    const itemStyle = {
      background: active
        ? colors.activeMenuBg
        : "transparent",

      color: item.isLogout
        ? colors.danger
        : active
          ? colors.activeMenuText
          : colors.textSecondary,
    };

    return (
      <div key={item.name}>
        <div
          onClick={() => handleClick(item)}
          className={`flex items-center gap-3 cursor-pointer rounded-xl py-3 px-3.5 mb-1 ${isChild ? "ml-8 mr-3 mt-1" : "mx-3"
            } select-none transition-all duration-200`}
          style={itemStyle}
          onMouseEnter={(e) => {
            if (!active && !item.isLogout) {
              e.currentTarget.style.background = colors.hover;
              e.currentTarget.style.color = colors.textPrimary;
            }

            if (item.isLogout) {
              e.currentTarget.style.background = `${colors.danger}15`;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = active
              ? colors.activeMenuBg
              : "transparent";

            e.currentTarget.style.color = item.isLogout
              ? colors.danger
              : active
                ? colors.activeMenuText
                : colors.textSecondary;
          }}
        >
          {Icon && (
            <Icon
              size={isChild ? 16 : 18}
              style={{
                color: item.isLogout
                  ? colors.danger
                  : active
                    ? colors.accent
                    : colors.textSecondary,
              }}
            />
          )}

          {isOpen && (
            <>
              <span
                className={`text-[13.5px] flex-1 tracking-wide ${isChild ? "text-[12.5px]" : ""
                  }`}
              >
                {item.name}
              </span>

              {hasChildren && (
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""
                    }`}
                />
              )}
            </>
          )}
        </div>

        {hasChildren && isOpen && isExpanded && (
          <div className="overflow-hidden animate-in slide-in-from-top-2 duration-200">
            {item.children.map((child) => renderMenuItem(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity" />
      )}

      {/* Sidebar Container */}
      {/* <aside
        ref={sidebarRef}
        className={`
          fixed inset-y-0 left-0 z-50 h-screen
          md:relative md:h-screen
          bg-secondary flex flex-col shadow-[0_0_24px_rgba(0,0,0,0.45)] transition-all duration-300 overflow-hidden shrink-0
          ${isOpen ? "w-64 translate-x-0" : "-translate-x-full md:translate-x-0 md:w-20"}
        `}
      > */}
      <aside
        ref={sidebarRef}
        className={`
    fixed inset-y-0 left-0 z-50 h-screen
    md:relative md:h-screen
    flex flex-col transition-all duration-300 overflow-hidden shrink-0
    ${isOpen
            ? "w-64 translate-x-0"
            : "-translate-x-full md:translate-x-0 md:w-20"
          }
  `}
        style={{
          background: colors.sidebarBg,
          boxShadow: "0 0 24px rgba(45, 49, 66, 0.12)",
        }}
      >
        {/* ─── 1. HEADER (Fixed) ─── */}
        {/* <div className="flex items-center gap-3 p-5 border-b border-card-border/50 bg-secondary shrink-0 h-20">
          <img
            src={logo}
            onClick={toggleSidebar}
            alt="ChatSpark"
            className="w-10 h-10 object-cover cursor-pointer drop-shadow-md hover:scale-105 transition-transform"
          />
          {isOpen && (
            <div
              className="flex flex-col cursor-pointer"
              onClick={toggleSidebar}
            >
              <span className="text-[18px] font-bold text-text-primary tracking-wide">
                ChatSpark
              </span>
              <span className="text-[11px] text-text-secondary uppercase tracking-widest font-semibold mt-0.5">
                HRMS Portal
              </span>
            </div>
          )}
        </div> */}
        <div
          className="flex items-center gap-3 p-5 shrink-0 h-20"
          style={{
            borderBottom: `1px solid ${colors.cardBorder}`,
            background: colors.sidebarBg,
          }}
        >
          <img
            src={logo}
            onClick={toggleSidebar}
            alt="ChatSpark"
            className="w-10 h-10 object-cover cursor-pointer drop-shadow-md hover:scale-105 transition-transform"
          />

          {isOpen && (
            <div
              className="flex flex-col cursor-pointer"
              onClick={toggleSidebar}
            >
              <span
                className="text-[18px] font-bold tracking-wide"
                style={{ color: colors.textPrimary }}
              >
                ChatSpark
              </span>

              <span
                className="text-[11px] uppercase tracking-widest font-semibold mt-0.5"
                style={{ color: colors.textSecondary }}
              >
                HRMS Portal
              </span>
            </div>
          )}
        </div>

        {/* ─── 2. SCROLLABLE NAVIGATION ─── */}
        {/* The magic happens here: flex-1 takes remaining height, overflow-y-auto makes it scroll */}
        <nav
          className="mt-6 flex flex-col flex-1 overflow-y-auto pb-6 overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
        >
          {visibleMenuItems.map((item) => renderMenuItem(item))}
        </nav>

        {/* ─── 3. FOOTER (Fixed) ─── */}
        <div className="p-4 shrink-0 border-t border-card-border/50 bg-secondary/80 backdrop-blur-md">
          {isOpen ? (
            <div onClick={fetchProfile} className="flex items-center gap-3 py-2 px-3 rounded-xl bg-card border border-card-border hover:border-btn/50 transition-colors cursor-pointer shadow-sm">
              <div className="w-9 h-9 min-w-9 rounded-lg bg-btn/20 flex items-center justify-center text-sm font-bold text-btn uppercase border border-[#3B82F6]/20">
                {user?.firstName ? user.firstName.charAt(0) : "U"}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span
                  className="text-[13px] font-bold text-text-primary truncate"
                  title={user?.firstName || "User"}
                >
                  {user?.firstName
                    ? `${user.firstName} ${user.lastName || ""}`.trim()
                    : "User"}
                </span>
                <span
                  className="text-[11px] text-text-secondary capitalize truncate font-medium mt-0.5"
                  title={user?.role || "Employee"}
                >
                  {user?.role || "Employee"}
                </span>
              </div>
            </div>
          ) : (
            // Collapsed Footer View
            // <div className="flex justify-center">
            //   <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center text-sm font-bold text-[#3B82F6] uppercase border border-[#3B82F6]/20">
            //     {user?.firstName ? user.firstName.charAt(0) : "U"}
            //   </div>
            // </div>
            <div
              className="p-4 shrink-0 backdrop-blur-md"
              style={{
                borderTop: `1px solid ${colors.cardBorder}`,
                background: colors.sidebarBg,
              }}
            >
              {isOpen ? (
                <div
                  onClick={fetchProfile}
                  className="flex items-center gap-3 py-2 px-3 rounded-xl cursor-pointer shadow-sm transition-colors"
                  style={{
                    background: colors.cardBg,
                    border: `1px solid ${colors.cardBorder}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.accent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.cardBorder;
                  }}
                >
                  <div
                    className="w-9 h-9 min-w-9 rounded-lg flex items-center justify-center text-sm font-bold uppercase"
                    style={{
                      background: colors.activeMenuBg,
                      color: colors.accent,
                      border: `1px solid ${colors.cardBorder}`,
                    }}
                  >
                    {user?.firstName ? user.firstName.charAt(0) : "U"}
                  </div>

                  <div className="flex flex-col overflow-hidden">
                    <span
                      className="text-[13px] font-bold truncate"
                      style={{ color: colors.textPrimary }}
                    >
                      {user?.firstName
                        ? `${user.firstName} ${user.lastName || ""}`.trim()
                        : "User"}
                    </span>

                    <span
                      className="text-[11px] capitalize truncate font-medium mt-0.5"
                      style={{ color: colors.textSecondary }}
                    >
                      {user?.role || "Employee"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold uppercase"
                    style={{
                      background: colors.activeMenuBg,
                      color: colors.accent,
                      border: `1px solid ${colors.cardBorder}`,
                    }}
                  >
                    {user?.firstName ? user.firstName.charAt(0) : "U"}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
      <ProfileModal
        open={profileOpen}
        loading={profileLoading}
        onClose={() => setProfileOpen(false)}
        profileData={profileData}
      />
    </>
  );
};

export default Sidebar;

import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { RiTeamLine } from "react-icons/ri";
import { MdDirectionsBike } from "react-icons/md";
import { FaCar ,FaClipboard,FaExpeditedssl, FaClipboardList, FaUsers } from "react-icons/fa";

// Assume these icons are imported from an icon library
import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  UserCircleIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
// import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  permissionKey?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean; permissionKey?: string }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/home"
    // subItems: [{ name: "Ecommerce", path: "/", pro: false }],
  },
  {
    icon: <UserCircleIcon />,
    name: "Profile",
    path: "/profile",
    permissionKey: "user_view",
  },
  {
    name: "Team Members",
    icon: <RiTeamLine />,
    subItems: [{ name: "Add Team Member", path: "/add-team-member", pro: false, permissionKey: "add_team_member" },
    { name: "Team Member List", path: "/team-member", pro: false, permissionKey: "view_team_members" },
    { name: "View Team Member", path: "", pro: false, permissionKey: "view_team_members" },
    ],
  },
  {
    name: "Drivers",
    icon: <MdDirectionsBike />,
    subItems: [{ name: "Drivers", path: "/driver-list", pro: false, permissionKey: "user_view" },
    { name: "Driver Requests", path: "/driver-request-details", pro: false, permissionKey: "user_view" },
    { name: "Draft Drivers", path: "/draft-drivers", pro: false, permissionKey: "user_view" },
    ],
  },
  {
    name: "Vehicles",
    icon: <FaCar  />,
    subItems: [{ name: "Vehicles", path: "/vehicle-list", pro: false, permissionKey: "vehicle_view" },
    { name: "Vehicle Requests", path: "/vehicle-request", pro: false, permissionKey: "vehicle_view" },
    { name: "Draft Vehicles", path: "/draft-vehicles", pro: false, permissionKey: "vehicle_view" },
    ],
  },
  {
    name: "Roles",
    icon: <FaClipboard />,
    subItems: [{ name: "Role View", path: "", pro: false, permissionKey: "role_view" },
    { name: "Role Create/Edit", path: "", pro: false, permissionKey: "role_create_edit" },
    { name: "Role Delete", path: "", pro: false, permissionKey: "role_delete" },
    ],
  },
  {
    name: "Permissions",
    icon: <FaExpeditedssl />,
    subItems: [{ name: "Permission View", path: "", pro: false, permissionKey: "permission_view" },
    { name: "Permission Create/Edit", path: "", pro: false, permissionKey: "permission_create_edit" },
    { name: "Permission Delete", path: "", pro: false, permissionKey: "permission_delete" },
    ],
  },
  {
    name: "Language",
    icon: <FaClipboardList />,
    subItems: [{ name: "Language View", path: "", pro: false, permissionKey: "language_view" },
    { name: "Language Create/Edit", path: "", pro: false, permissionKey: "language_create_edit" },
    { name: "Language Delete", path: "", pro: false, permissionKey: "language_delete" },
    ],
  },
  {
    name: "Customers",
    icon: <FaUsers />,
    subItems: [
      { name: "Customers", path: "/customer-list", pro: false, permissionKey: "user_view" },
      { name: "404 Error", path: "/error-404", pro: false, permissionKey: "error_404" },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  // useEffect(() => {
  //   let submenuMatched = false;
  //   ["main", "others"].forEach((menuType) => {
  //     const items = menuType === "main" ? navItems : othersItems;
  //     items.forEach((nav, index) => {
  //       if (nav.subItems) {
  //         nav.subItems.forEach((subItem) => {
  //           if (isActive(subItem.path)) {
  //             setOpenSubmenu({
  //               type: menuType as "main" | "others",
  //               index,
  //             });
  //             submenuMatched = true;
  //           }
  //         });
  //       }
  //     });
  //   });

  //   if (!submenuMatched) {
  //     setOpenSubmenu(null);
  //   }
  // }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const storedPermissions = JSON.parse(localStorage.getItem("permissions") || "[]") as string[];
  const hasPermission = (key?: string) => {
    if (!key) return true; // show if no permissionKey is defined
    return storedPermissions.includes(key);
  };

  const filteredNavItems = navItems
  .map(item => {
    if (item.subItems) {
      const filteredChildren = item.subItems.filter(child => hasPermission(child.permissionKey));
      if (filteredChildren.length > 0) {
        return { ...item, subItems: filteredChildren };
      }
      return null; // exclude parent if no visible children
    } else {
      return hasPermission(item.permissionKey) ? item : null;
    }
  })
  .filter(Boolean) as NavItem[]; 



  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={`menu-item-icon-size  ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? "rotate-180 text-brand-500"
                    : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
              >
                <span
                  className={`menu-item-icon-size ${isActive(nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link to="/home">
          {isExpanded || isHovered || isMobileOpen ? (
            <h2 style={{ color: 'blue', fontSize: '25px' }}>Ride-Booking</h2>
          ) : (
            <img src="/images/logo/logo-icon.svg" alt="Logo" width={32} height={32} />
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400`}>
                {isExpanded || isHovered || isMobileOpen ? "Menu" : <HorizontaLDots className="size-6" />}
              </h2>
              {renderMenuItems(filteredNavItems, "main")}
              {/* {renderMenuItems(filteredNavItems.filter((item): item is NavItem => item !== null), "main")} */}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;

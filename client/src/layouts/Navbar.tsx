import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { NotificationBell } from "../components/notifications/NotificationBell";
import {
  BellIcon,
  ChevronDownIcon,
  LogOutIcon,
  MenuIcon,
  XIcon,
} from "../components/ui/icons";
import { useAuth } from "../hooks/useAuth";
import { useNotifications } from "../hooks/useNotifications";

interface NavLinkItem {
  to: string;
  label: string;
}

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const closeMenus = () => {
    setMobileOpen(false);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenus();
    navigate("/");
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link${isActive ? " nav-link--active" : ""}`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `mobile-nav-link${isActive ? " mobile-nav-link--active" : ""}`;

  const creatorLinks: NavLinkItem[] = [
    { to: "/events", label: "Events" },
    { to: "/my-events", label: "My Events" },
    { to: "/events/new", label: "Create Event" },
    { to: "/scanner", label: "Scanner" },
  ];

  const eventeeLinks: NavLinkItem[] = [
    { to: "/events", label: "Events" },
    { to: "/my-tickets", label: "My Tickets" },
  ];

  const links = user?.role === "EVENT_CREATOR" ? creatorLinks : eventeeLinks;

  return (
    <header className="navbar">
      <div className="container nav-container">
        <Logo />

        <nav className="nav-links">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={navLinkClass}
              end={link.to === "/events"}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          {isAuthenticated && user ? (
            <>
              <NotificationBell />
              <div className="user-menu" ref={menuRef}>
                <button
                  className="user-menu-button"
                  onClick={() => setMenuOpen((open) => !open)}
                  aria-expanded={menuOpen}
                >
                  <span className="user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span>{user.name.split(" ")[0]}</span>
                  <ChevronDownIcon size={16} />
                </button>

                {menuOpen ? (
                  <div className="user-menu-dropdown">
                    <div className="user-menu-header">
                      <div className="user-menu-name">{user.name}</div>
                      <div className="user-menu-email">{user.email}</div>
                    </div>
                    <button
                      className="user-menu-item"
                      onClick={() => {
                        closeMenus();
                        navigate("/notifications");
                      }}
                    >
                      <BellIcon size={16} /> Notifications
                    </button>
                    {links.map((link) => (
                      <button
                        key={link.to}
                        className="user-menu-item"
                        onClick={() => {
                          closeMenus();
                          navigate(link.to);
                        }}
                      >
                        {link.label}
                      </button>
                    ))}
                    <hr className="user-menu-divider" />
                    <button
                      className="user-menu-item user-menu-logout"
                      onClick={handleLogout}
                    >
                      <LogOutIcon size={16} /> Log out
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Log in
              </Link>
              <Link to="/register" className="btn btn--primary btn--sm">
                Sign up
              </Link>
            </>
          )}

          <button
            className="nav-toggle"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <nav className="mobile-nav mobile-nav--open">
          {isAuthenticated && user ? (
            <div className="mobile-nav-user">
              {user.name} &middot; {user.email}
            </div>
          ) : null}

          <div className="mobile-nav-section">Main</div>
          <NavLink to="/" className={mobileLinkClass} end onClick={closeMenus}>
            Home
          </NavLink>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={mobileLinkClass}
              end={link.to === "/events"}
              onClick={closeMenus}
            >
              {link.label}
            </NavLink>
          ))}

          {isAuthenticated ? (
            <>
              <div className="mobile-nav-section">Account</div>
              <NavLink
                to="/notifications"
                className={mobileLinkClass}
                onClick={closeMenus}
              >
                Notifications{unreadCount > 0 ? ` (${unreadCount})` : ""}
              </NavLink>
              <button className="mobile-nav-link" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <div className="mobile-nav-section">Account</div>
              <NavLink to="/login" className={mobileLinkClass} onClick={closeMenus}>
                Log in
              </NavLink>
              <NavLink
                to="/register"
                className={mobileLinkClass}
                onClick={closeMenus}
              >
                Sign up
              </NavLink>
            </>
          )}
        </nav>
      ) : null}
    </header>
  );
}

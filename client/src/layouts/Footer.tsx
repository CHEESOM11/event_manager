import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { useAuth } from "../hooks/useAuth";

export function Footer() {
  const { isAuthenticated, user } = useAuth();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-container">
          <div>
            <Logo />
            <p className="footer-tagline">
              Your passport to a world of unforgettable moments. Concerts,
              theater, sports and cultural gatherings, all in one place.
            </p>
          </div>
          <nav className="footer-links">
            <Link className="footer-link" to="/events">
              Events
            </Link>
            {isAuthenticated && user?.role === "EVENT_CREATOR" ? (
              <>
                <Link className="footer-link" to="/my-events">
                  My Events
                </Link>
                <Link className="footer-link" to="/events/new">
                  Create Event
                </Link>
              </>
            ) : null}
            {isAuthenticated && user?.role === "EVENTEE" ? (
              <Link className="footer-link" to="/my-tickets">
                My Tickets
              </Link>
            ) : null}
            {isAuthenticated ? (
              <Link className="footer-link" to="/notifications">
                Notifications
              </Link>
            ) : (
              <>
                <Link className="footer-link" to="/login">
                  Log in
                </Link>
                <Link className="footer-link" to="/register">
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} Eventful. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

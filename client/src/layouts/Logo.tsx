import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";

interface LogoProps {
  dark?: boolean;
  size?: number;
}

export function Logo({ dark = false, size = 34 }: LogoProps) {
  return (
    <Link
      to="/"
      className="nav-brand"
      style={dark ? { color: "inherit" } : undefined}
    >
      <img
        src={logo}
        alt="Eventful logo"
        width={size}
        height={size}
        style={{ borderRadius: 8 }}
      />
      Eventful
    </Link>
  );
}

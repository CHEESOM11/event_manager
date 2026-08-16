import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../utils/errors";
import { homePathForRole } from "../utils/navigation";
import type { Role } from "../types";

interface RoleOption {
  role: Role;
  title: string;
  text: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: "EVENTEE",
    title: "Eventee",
    text: "Discover events, buy tickets and attend.",
  },
  {
    role: "EVENT_CREATOR",
    title: "Event Creator",
    text: "Create events, sell tickets and track analytics.",
  },
];

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("EVENTEE");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });
      navigate(homePathForRole(response.user.role), { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card card">
        <div className="card-body">
          <div className="auth-brand">
            <img src={logo} alt="Eventful logo" width={32} height={32} />
            Eventful
          </div>
          <p className="auth-subtitle">
            Create an account and step into a world of unforgettable moments.
          </p>

          {error ? <Alert variant="error">{error}</Alert> : null}

          <form onSubmit={handleSubmit}>
            <Input
              label="Full name"
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Jane Doe"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="Create a password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <div className="field">
              <span className="label">I want to...</span>
              <div className="role-picker">
                {ROLE_OPTIONS.map((option) => (
                  <button
                    key={option.role}
                    type="button"
                    className={`role-option${
                      role === option.role ? " role-option--selected" : ""
                    }`}
                    onClick={() => setRole(option.role)}
                  >
                    <div className="role-option-title">{option.title}</div>
                    <div className="role-option-text">{option.text}</div>
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" block size="lg" loading={submitting}>
              Create account
            </Button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

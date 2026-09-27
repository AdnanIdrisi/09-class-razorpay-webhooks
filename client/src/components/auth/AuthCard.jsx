import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { getErrorMessage, saveSession } from "../../utils/auth";

function AuthCard({ mode }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post(
        `/auth/${isRegister ? "register" : "login"}`,
        form,
      );
      saveSession(data.data);
      navigate("/payment");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-layout">
      <div className="auth-intro">
        <p className="eyebrow">A better way to carry</p>
        <h1>
          Good things,
          <br />
          <em>packed well.</em>
        </h1>
        <p className="intro-copy">
          Thoughtful essentials for the everyday journeys that matter.
        </p>
      </div>
      <div className="form-panel">
        <p className="eyebrow">
          {isRegister ? "Create your account" : "Welcome back"}
        </p>
        <h2>{isRegister ? "Join Kapda Co." : "Sign in to shop"}</h2>
        <p className="form-help">
          {isRegister
            ? "Your next favorite piece starts here."
            : "Continue where you left off."}
        </p>
        <form onSubmit={submit}>
          {isRegister && (
            <label>
              Name
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                placeholder="Your full name"
              />
            </label>
          )}
          <label>
            Email
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              required
              minLength="8"
              pattern="(?=.*[A-Za-z])(?=.*\d).{8,}"
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm({ ...form, password: event.target.value })
              }
              placeholder="8+ characters, with a letter and number"
            />
          </label>
          {error && <p className="error-message">{error}</p>}
          <button
            className="button button-primary button-full"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isRegister
                ? "Create account"
                : "Sign in"}
          </button>
        </form>
        <p className="switch-prompt">
          {isRegister ? "Already have an account?" : "New to Kapda Co.?"}{" "}
          <Link to={isRegister ? "/login" : "/register"}>
            {isRegister ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </div>
    </section>
  );
}

export default AuthCard;

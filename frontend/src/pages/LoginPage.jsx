import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RiArrowRightLine } from 'react-icons/ri'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const currentUser = JSON.parse(
  localStorage.getItem("user")
);
  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    const data = await response.json();
    if (data.success) {
  console.log(data);
  localStorage.setItem(
    "user",
    JSON.stringify(data)
  );
  if (data.role === "Software Owner") {
    navigate("/owner-dashboard");

  }
  else if (data.role === "Manager") {
    navigate("/dashboard");
  }
  else {
    navigate("/tasks");
  }

} else {
  setError(data.message);
}

  } catch (err) {
    console.error(err);
    setError("Server Error");
  }
  setLoading(false);
};
  return (
    <main>
    <div className="min-h-screen bg-background flex">    
     
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 text-center">
          <Link
            to="/"
            className="inline-flex flex-col items-center mb-8"
          >
            <div className="flex items-center gap-3">
          <img src="/shnoor_international_logo.jpeg"  alt="SHNOOR Logo" className="w-15 h-14 object-contain rounded-lg"
          />
          <div>
            <h3 className="font-bold text-[#163F68] text-lg">
              SHNOOR WorkSpace
            </h3>
            <p className="text-xs text-slate-600">
              Enterprise Platform
            </p>
          </div>
        </div> 
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">
            Sign in to your account
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            New to WorkSpace?
            <Link
              to="/register-company"
              className="ml-1 text-secondary hover:underline font-semibold hover:underline"
            >
              Start free trial
            </Link>
          </p>

        </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <input id="email"
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="input" placeholder="you@org.com" required
              />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "Password reset is managed by your company administrator. Please contact your administrator for assistance."
                    )
                  }
                  className="text-xs text-[#163F68] font-medium hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input   id="password"
                  type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input pr-10" placeholder="" required
                />
                <button
                  type="button"
                  aria-label={showPw ? "Hide password" : "Show password"}
                  title={showPw ? "Hide password" : "Show password"}
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-700 p-2 rounded-md"
                >
                </button>
              </div>
            </div>
            {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-sm mt-2 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <>Sign in <RiArrowRightLine size={15} /></>
              )}
            </button>
          </form>
          <p className="mt-8 text-center text-xs text-muted">
            By signing in, you agree to our{' '}
            Terms and{' '}
           Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div></main>
  )
}
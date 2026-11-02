import { Navigate, useSearchParams } from "react-router-dom";

/** /admin/login is retired: forward to /login, keeping ?next= when present. */
const Login = () => {
  const [params] = useSearchParams();
  const next = params.get("next");
  return <Navigate to={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} replace />;
};

export default Login;

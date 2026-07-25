import { Navigate, useSearchParams } from "react-router-dom";

const Login = () => {
  const [params] = useSearchParams();
  const next = params.get("next") ?? "/admin";
  return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
};

export default Login;

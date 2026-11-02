import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NoAccess = () => (
  <main className="min-h-screen flex items-center justify-center bg-background px-4">
    <div className="max-w-md text-center space-y-4">
      <h1 className="text-2xl font-bold text-foreground">No access</h1>
      <p className="text-muted-foreground">
        Your role doesn't include this part of the admin panel. If you need it, ask a league admin to update your role.
      </p>
      <Button asChild className="min-h-11">
        <Link to="/admin">Back to admin home</Link>
      </Button>
    </div>
  </main>
);

export default NoAccess;

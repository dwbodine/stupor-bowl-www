import { Link } from "react-router-dom";

export function RegistrationClosedPage() {
  return (
    <div className="stupor-bowl-card">
      <h1>Registration Closed</h1>
      <p>
        Registration for the Stupor Bowl is now closed.
      </p>
      <p>Thanks for your interest — check back soon for the results!</p>
      <Link to="/">Back to home</Link>
    </div>
  );
}

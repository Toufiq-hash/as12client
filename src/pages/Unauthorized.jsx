import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
      <p className="mb-6 text-gray-700">
        Sorry, you do not have permission to view this page. Please login or contact admin if you think this is an error.
      </p>
      <Link to="/login" className="btn btn-primary">
        Go to Login
      </Link>
    </div>
  );
};

export default Unauthorized;


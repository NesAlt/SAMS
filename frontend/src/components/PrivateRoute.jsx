import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/UseAuth";

export default function PrivateRoute({ children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  return children;
}

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
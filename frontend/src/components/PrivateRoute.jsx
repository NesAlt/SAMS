import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/UseAuth";

export default function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
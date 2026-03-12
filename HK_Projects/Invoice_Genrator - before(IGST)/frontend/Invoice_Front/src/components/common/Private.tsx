import React, { type JSX } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store"; 

interface Props {
  children: JSX.Element;
}

const PrivateRoute: React.FC<Props> = ({ children }) => {
  const { user } = useSelector((state: RootState) => state.auth);


  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;

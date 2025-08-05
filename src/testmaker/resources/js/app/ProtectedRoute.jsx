import { Navigate, Outlet } from "react-router-dom";
const RouteProtector = ({ user }) => {
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return <Outlet />;
};
export default RouteProtector;

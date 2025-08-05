import { Navigate, Outlet, useParams } from "react-router-dom";
const UUIDValidator = () => {
    const { id } = useParams();
    if (!isUUID(id)) {
        <Navigate to="/not-found"></Navigate>;
    }
    return <Outlet />;
};
const isUUID = (id) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        id
    );
export default UUIDValidator;

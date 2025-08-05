import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserContext from "../../UserContext";
import { UserRoleEnum } from "../Enums/UserRoleEnum";
import { formatDate } from "../Helpers/UserHelpers";
const UserProfile = () => {
    const { user, setUser } = useContext(UserContext);
    const [isSubmited, setSubmitStats] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    }, [user, navigate]);

    if (!user) return null; // можно показать прелоадер или ничего
    function LogOut() {
        setSubmitStats(true);
        axios.post("/api/logout", "", { withCredentials: true }).then(() => {
            setUser(false);
            navigate("/");
        });
    }
    return (
        <div className="d-flex flex-column justify-content-center align-items-center flex-grow-1 ">
            <div className="profile-color d-flex m-1 flex-column form-wrapper  p-5">
                <img
                    className="img-fluid mx-auto"
                    style={{ maxWidth: "300px", height: "auto" }}
                    src="images/DefaultPicture.png"
                    alt="изображение пользователя"
                ></img>
                <p>Никнейм пользователя {user.name}</p>
                <p>Почта {user.email}</p>
                <p>Дата регистрации: {formatDate(user.registry_date)}</p>
                {user.role == UserRoleEnum.Admin && (
                    <Link
                        className="btn btn-secondary my-2"
                        to="/control/users"
                    >
                        Контроль пользователей
                    </Link>
                )}
                {user.role != UserRoleEnum.User && (
                    <Link
                        className="btn btn-primary my-2"
                        to="/moderated/tests"
                    >
                        Тесты для рассмотрения
                    </Link>
                )}
                <Link className="btn btn-primary my-2" to="my/tests">
                    К моим тестам
                </Link>
                <Link className="btn btn-warning my-2" to="my/favourite/tests">
                    Избранные тесты
                </Link>
                <button onClick={LogOut} className="bg-danger p-2 my-2">
                    Выйти из аккаунта
                </button>
                {isSubmited && (
                    <div className="text-success">
                        {" "}
                        Происходит выход из аккаунт. Подождите
                    </div>
                )}
            </div>
        </div>
    );
};
export default UserProfile;

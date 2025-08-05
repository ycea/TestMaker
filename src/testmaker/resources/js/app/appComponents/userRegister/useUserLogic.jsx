import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../../UserContext";
const useUserLogic = () => {
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [user]);
    function validateEmail(email) {
        let emailIsValid = String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
        return emailIsValid ? "" : "Введена некорректная почта";
    }
    function validateName(name) {
        let isNameValid = String(name).match(/^[a-zA-Z0-9]{4,}$/);
        return isNameValid ? "" : "Длиннее 3 символов, латиницей и цифрами";
    }
    function validatePassword(password) {
        let isValidPassword = String(password).match(
            /^(?=.*[A-Za-z])(?=.*\d).{8,}$/
        );
        return isValidPassword
            ? ""
            : "Пароль должен быть 8 символов в длину. Содержать 1 цифру и 1 букву";
    }
    const verifyPassword = (password, repeat_password) => {
        return password === repeat_password ? "" : "Пароли не совпадают";
    };
    return {
        validateEmail,
        validateName,
        validatePassword,
        verifyPassword,
    };
};
export default useUserLogic;

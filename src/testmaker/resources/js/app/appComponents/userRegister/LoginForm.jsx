import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserContext from "../../UserContext";
import useHandleData from "./useHandleData";
import useUserLogic from "./useUserLogic";
const LoginForm = () => {
    const { setUser } = useContext(UserContext);
    const [validationErrors, setIsValid] = useState({
        nameOrEmailError: "",
    });
    const navigate = useNavigate();
    const { validateEmail, validateName } = useUserLogic();
    const defaultForm = { nameOrEmail: "", password: "" };
    const [formData, setFormData] = useState(defaultForm);
    const postProcess = (response) => {
        setUser(response.data.user);
        if (response.data.status === "succes") {
            navigate("/");
        }
    };
    const checkIsValid = (form) => {
        let userData = form.nameOrEmail;
        const errors = {
            nameOrEmailError: userData.includes("@")
                ? validateEmail(userData)
                : validateName(userData),
        };
        const noErrors = Object.values(errors).every((value) => value == "");
        setIsValid(errors);
        return noErrors;
    };
    const { submitStatus, handleChange, handleSubmit, backendErrors } =
        useHandleData({
            endPointSubmit: "/api/login-user",
            formData: formData,
            setFormData: setFormData,
            checkIsValid: checkIsValid,
            defaultForm: defaultForm,
            postProcess: postProcess,
        });
    return (
        <div className="d-flex justify-content-center align-items-center flex-grow-1">
            <div className="d-flex m-1 flex-column form-wrapper  p-5 ">
                <h1 className="mb-5">Форма входа</h1>
                <form className="d-flex flex-column" onSubmit={handleSubmit}>
                    <label className="form-label">
                        Введите эл. почту или имя{" "}
                    </label>
                    <input
                        name="nameOrEmail"
                        type="text"
                        className="form-control my-2"
                        value={formData.nameOrEmail}
                        onChange={handleChange}
                    ></input>
                    {validationErrors.nameOrEmailError && (
                        <div className="form-text">
                            {validationErrors.nameOrEmailError}
                        </div>
                    )}
                    <label className="form-label">Введите пароль</label>
                    <input
                        name="password"
                        type="password"
                        className="form-control my-2"
                        value={formData.password}
                        onChange={handleChange}
                    ></input>
                    <button type="submit" className="btn btn-primary my-1">
                        {" "}
                        Войти
                    </button>
                    {submitStatus.isSubmitted && (
                        <div className="text-success">
                            {submitStatus.message}
                        </div>
                    )}
                    {backendErrors != "" ? (
                        <div className="text-danger">{backendErrors}</div>
                    ) : (
                        ""
                    )}
                    <p>
                        Нет аккаунта?{" "}
                        <Link
                            className="link-primary text-decoration-none"
                            to="/register"
                        >
                            Зарегистрируйтесь
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};
export default LoginForm;

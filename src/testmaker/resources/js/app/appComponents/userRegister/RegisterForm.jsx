import { useState } from "react";
import { Link } from "react-router-dom";
import useHandleData from "./useHandleData";
import useUserLogic from "./useUserLogic";
const RegisterForm = () => {
    const [passwordShown, setVisibilityPassword] = useState(false);
    const { validateEmail, validateName, validatePassword, verifyPassword } =
        useUserLogic();
    const defaultForm = {
        name: "",
        email: "",
        password: "",
        passwordVerify: "",
    };
    const [formData, setFormData] = useState(defaultForm);
    const checkIsValid = (currentForm) => {
        const errors = {
            nameError: validateName(currentForm.name),
            emailError: validateEmail(currentForm.email),
            passwordError: validatePassword(currentForm.password),
            passwordVerifyError: verifyPassword(
                currentForm.password,
                currentForm.passwordVerify
            ),
        };
        const noErrors = Object.values(errors).every((value) => value == "");

        setIsValid(errors);
        return noErrors;
    };
    const [validationErrors, setIsValid] = useState({
        nameError: "",
        emailError: "",
        passwordError: "",
        passwordVerifyError: "",
    });
    const { submitStatus, handleChange, handleSubmit, backendErrors } =
        useHandleData({
            endPointSubmit: "/api/register-user",
            formData,
            setFormData,
            checkIsValid,
            defaultForm,
            succesMessage:
                "Данные успешно отправились, проверьте почту (включая спам)",
        });

    return (
        <div className="d-flex justify-content-center align-items-center flex-grow-1">
            <div className="d-flex m-1 flex-column form-wrapper  p-5 ">
                <h1 className="mb-5">Форма регистрации</h1>
                <form className="d-flex flex-column" onSubmit={handleSubmit}>
                    <label className="form-label">
                        Придумайте имя для отображения
                    </label>

                    <input
                        name="name"
                        type="text"
                        className=" form-control my-2"
                        value={formData.name}
                        onChange={handleChange}
                    ></input>
                    {validationErrors.nameError == "" ? (
                        ""
                    ) : (
                        <div className="form-text">
                            {validationErrors.nameError}
                        </div>
                    )}
                    <label className="form-label">Введите эл. почту </label>
                    <input
                        name="email"
                        type="text"
                        className="form-control my-2"
                        value={formData.email}
                        onChange={handleChange}
                    ></input>
                    {validationErrors.emailError && (
                        <div className="form-text">
                            {validationErrors.emailError}
                        </div>
                    )}
                    <label className="form-label">Придумайте пароль</label>
                    <div className="d-flex flex-row position-relative ">
                        <input
                            name="password"
                            type={passwordShown ? "text" : "password"}
                            className="form-control"
                            value={formData.password}
                            onChange={handleChange}
                        ></input>
                        <button
                            className="btn btn-secondary border-0 bg-transparent position-absolute end-0 "
                            type="button"
                            onClick={() => {
                                setVisibilityPassword(!passwordShown);
                            }}
                        >
                            <i
                                class={
                                    !passwordShown
                                        ? "bi bi-eye text-dark"
                                        : "bi bi-eye-slash-fill text-dark"
                                }
                            ></i>
                        </button>
                    </div>
                    {validationErrors.passwordError && (
                        <div className="form-text">
                            {validationErrors.passwordError}
                        </div>
                    )}
                    <label className="form-label">Подтвердить пароль</label>
                    <input
                        name="passwordVerify"
                        type="password"
                        className="form-control my-2"
                        value={formData.passwordVerify}
                        onChange={(e) => {
                            handleChange(e);
                        }}
                    ></input>
                    {validationErrors.passwordVerifyError && (
                        <div className="form-text">
                            {validationErrors.passwordVerifyError}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary my-1">
                        {" "}
                        Зарегистрироваться
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
                        Уже есть аккаунт?{" "}
                        <Link
                            className="link-primary text-decoration-none"
                            to="/login"
                        >
                            Войдите в него
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};
export default RegisterForm;

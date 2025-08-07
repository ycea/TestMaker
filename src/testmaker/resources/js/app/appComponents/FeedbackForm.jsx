import { useContext, useState } from "react";
import UserContext from "../UserContext";
import useHandleData from "./userRegister/useHandleData";
const FeedbackForm = () => {
    const { user } = useContext(UserContext);
    const [messageForm, setFormMessage] = useState({
        name: user.name,
        email: user.email,
        message: "",
    });
    const [isValid, setIsValid] = useState(true);
    const checkIsValid = (form) => {
        return form.message.length >= 10;
    };
    const { handleSubmit, handleChange, submitStatus } = useHandleData({
        endPointSubmit: "/api/send-feedback",
        formData: messageForm,
        setFormData: setFormMessage,
        checkIsValid: checkIsValid,
        defaultForm: {
            name: user.name,
            email: user.email,
            message: "",
        },
    });

    return (
        <div className="d-flex flex-column justify-content-center align-items-center flex-grow-1">
            <form className="w-75 border border-outline bg-light px-1 py-2 text-center">
                <div className="m-1">
                    <label className="form-label  m-1">Текст сообщения</label>
                    <textarea
                        name="message"
                        className="form-control mx-auto w-75 m-1 my-3"
                        value={messageForm.message}
                        rows={10}
                        placeholder="можете написать сюда что угодно. Сообщение о баге. Идея для обновления сайта. Либо какой дизайн плохой"
                        onChange={(e) => {
                            if (!handleChange(e)) {
                                setIsValid(false);
                            } else {
                                setIsValid(true);
                            }
                        }}
                    ></textarea>
                </div>{" "}
                <button
                    className="btn btn-success "
                    onClick={(e) => {
                        handleSubmit(e);
                    }}
                >
                    Отправить
                </button>
                {submitStatus.isSucces && (
                    <div
                        className={
                            submitStatus.isSucces
                                ? "text-success"
                                : "text-danger"
                        }
                    >
                        {submitStatus.message}
                    </div>
                )}
                {!isValid && (
                    <div className="text-danger">
                        Введите хотя бы 10 символов. Не зря же пишите
                    </div>
                )}
            </form>
        </div>
    );
};
export default FeedbackForm;

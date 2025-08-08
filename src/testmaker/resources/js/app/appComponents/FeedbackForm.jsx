import { useContext, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import UserContext from "../UserContext";
import useHandleData from "./userRegister/useHandleData";
const FeedbackForm = () => {
    const recaptchaRef = useRef(null);
    const [recaptchaToken, setRecaptchaToken] = useState(null);

    const { user } = useContext(UserContext);
    const [messageForm, setFormMessage] = useState({
        name: user.name,
        email: user.email,
        message: "",
        g_recaptcha_response: "",
    });
    const [isValid, setIsValid] = useState(true);
    const checkIsValid = (form) => {
        return form.message.length >= 10 && recaptchaToken != null;
    };
    const postProcess = () => {
        recaptchaRef.current.reset();
    };
    const { handleSubmit, handleChange, submitStatus } = useHandleData({
        endPointSubmit: "/api/send-feedback",
        formData: { ...messageForm, g_recaptcha_response: recaptchaToken },
        setFormData: setFormMessage,
        checkIsValid: checkIsValid,
        defaultForm: {
            name: user.name,
            email: user.email,
            message: "",
        },
        postProcess: postProcess,
    });

    const onReCAPTCHAChange = (token) => {
        setRecaptchaToken(token);
    };

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
                <ReCAPTCHA
                    className="d-flex justify-content-center"
                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                    onChange={onReCAPTCHAChange}
                    ref={recaptchaRef}
                />
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

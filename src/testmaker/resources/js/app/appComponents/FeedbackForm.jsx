import axios from "axios";
import { useContext, useState } from "react";
import UserContext from "../UserContext";
const FeedbackForm = () => {
    const { user } = useContext(UserContext);
    const [emailStatus, setEmailStatus] = useState({
        isSuccess: false,
        message: "",
    });
    const [messageData, setMessage] = useState("");
    const sendEmail = () => {
        setEmailStatus({
            isSuccess: false,
            message: "Данные отправляются, подождите",
        });
        axios
            .post("/api/send-feedback", {
                email: user.email,
                name: user.name,
                message: messageData,
            })
            .then(() => {
                setEmailStatus({
                    isSuccess: true,
                    message: "Успех. Письмо успешно отправлено",
                });
            })
            .catch((err) => {
                setEmailStatus((prev) => ({
                    ...prev,
                    message: "Ошибка. Не удалось отправить сообщение",
                }));
                console.error(err, "FAIL TO SEND EMAIL");
            })
            .finally(() => {
                setTimeout(() => {
                    setEmailStatus({ isSuccess: false, message: "" });
                }, 3000);
            });
        setMessage("");
    };
    return (
        <div className="d-flex flex-column justify-content-center align-items-center flex-grow-1">
            <form className="w-75 border border-outline bg-light px-1 py-2 text-center">
                <div className="m-1">
                    <label className="form-label  m-1">Текст сообщения</label>
                    <textarea
                        className="form-control mx-auto w-75 m-1 my-3"
                        value={messageData}
                        rows={10}
                        placeholder="можете написать сюда что угодно. Сообщение о баге. Идея для обновления сайта. Либо какой дизайн плохой"
                        onChange={(e) => {
                            setMessage(e.target.value);
                        }}
                    ></textarea>
                </div>{" "}
                <button
                    className="btn btn-success "
                    onClick={(e) => {
                        e.preventDefault();
                        sendEmail();
                    }}
                >
                    Отправить
                </button>
                {emailStatus.message && (
                    <div
                        className={
                            emailStatus.isSuccess
                                ? "text-success"
                                : "text-danger"
                        }
                    >
                        {emailStatus.message}
                    </div>
                )}
            </form>
        </div>
    );
};
export default FeedbackForm;

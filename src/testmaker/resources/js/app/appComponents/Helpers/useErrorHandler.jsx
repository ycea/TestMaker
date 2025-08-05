import { useEffect, useState } from "react";
const useErrorHandler = () => {
    const [backendErrors, setSubmitError] = useState("");
    useEffect(() => {
        if (backendErrors != "") {
            const timer = setTimeout(() => {
                setSubmitError("");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [backendErrors]);
    function translateBackendStatus(error) {
        switch (error.response?.status) {
            case 422:
                setSubmitError(
                    "Введены неправильные данные. Либо данные не уникальны"
                );
                break;
            case 401:
                setSubmitError("Не удалось авторизоваться");
                break;
            case 403:
                setSubmitError("У вас нет права на это действие");
                break;
            case 404:
                setSubmitError("Не удалось найти элемент");
                break;
            case 500:
                setSubmitError("Проблема на сервере, попробуйте позже");
                break;
            default:
                setSubmitError("Неизвестная ошибка");
                break;
        }
    }
    return { backendErrors, setSubmitError, translateBackendStatus };
};
export default useErrorHandler;

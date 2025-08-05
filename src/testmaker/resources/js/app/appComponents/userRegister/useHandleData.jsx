import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useErrorHandler from "../Helpers/useErrorHandler";
const useHandleData = ({
    endPointSubmit,
    formData,
    setFormData,
    checkIsValid,
    defaultForm,
    succesMessage = "Данные успешно отправились",
    postProcess = null,
}) => {
    const [submitStatus, setSubmitStatus] = useState({
        isSubmitted: false,
        text: "Ваши данные отправляются",
    });
    const navigate = useNavigate();
    const { translateBackendStatus, backendErrors } = useErrorHandler();

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        const currentForm = { ...formData, [name]: value };
        setSubmitStatus({ isSubmitted: false, message: "" });
        checkIsValid(currentForm);
    }
    function handleSubmit(e) {
        e.preventDefault();

        if (checkIsValid(formData)) {
            setSubmitStatus({
                isSubmitted: true,
                message: "Данные отправляются, подождите",
            });
            axios
                .post(endPointSubmit, formData, {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    withCredentials: true,
                })
                .then((response) => {
                    setSubmitStatus((prev) => ({
                        ...prev,
                        message: succesMessage,
                    }));
                    postProcess?.(response);
                })
                .catch((err) => {
                    translateBackendStatus(err);
                    setSubmitStatus({
                        message: "Данные отправляются, подождите",
                        isSubmitted: false,
                    });
                });
            setFormData(defaultForm);
        }
    }
    return { submitStatus, handleSubmit, handleChange, backendErrors };
};
export default useHandleData;

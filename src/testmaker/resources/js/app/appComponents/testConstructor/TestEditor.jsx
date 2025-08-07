import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UserContext from "../../UserContext";
import { TestStatusEnum } from "../Enums/TestStatuses";
import useErrorHandler from "../Helpers/useErrorHandler";
import EditUI from "./EditUI";
import TestHelper from "./TestHelper";
import useImageHook from "./useImageHook";
const TestEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const [test, changeTestData] = useState(null);
    const { changeImage, uploadImage } = useImageHook();
    const { translateBackendStatus, backendErrors } = useErrorHandler();
    useEffect(() => {
        TestHelper.getTestFromServer(id, false)
            .then((data) => {
                if (data) {
                    changeTestData(data);
                }
            })
            .catch((error) => {
                console.error("ERROR TO LOAD", error);
                translateBackendStatus(error);
            });
    }, []);

    const updateTest = (e, toPublish = false) => {
        e.preventDefault();
        console.log(user);
        axios
            .put(
                `/api/tests/${id}`,
                {
                    ...test,
                    status: toPublish
                        ? TestStatusEnum.IsPending
                        : TestStatusEnum.IsEdited,
                },
                { withCredentials: true }
            )
            .then(() => {
                uploadImage(id);
            })
            .catch((e) => {
                console.error(e);
                translateBackendStatus(e);
            });
        TestHelper.resetTest(changeTestData);
    };
    const dropTest = (e) => {
        e.preventDefault();
        axios
            .delete(`/api/tests/${id}`, { withCredentials: true })
            .then(() => {
                navigate("/profile/my/tests");
            })

            .catch((error) => {
                console.error("FAILED TO DELETE test", error);
                translateBackendStatus(error);
            });
    };
    if (!test) {
        return <div>Тест загружается</div>;
    }
    return (
        <EditUI
            test={test}
            changeTestData={changeTestData}
            saveTest={updateTest}
            dropTest={dropTest}
            backendErrors={backendErrors}
            changeImageData={changeImage}
        ></EditUI>
    );
};
export default TestEditor;

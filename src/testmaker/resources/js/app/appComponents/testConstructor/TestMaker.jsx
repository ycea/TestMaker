import axios from "axios";
import { useState } from "react";
import { TestStatusEnum } from "../Enums/TestStatuses";
import useErrorHandler from "../Helpers/useErrorHandler";
import EditUI from "./EditUI";
import TestHelper from "./TestHelper";
import useImageHook from "./useImageHook";
const TestMaker = () => {
    const [test, changeTestData] = useState(
        (() => {
            const test = TestHelper.getTestFromStorage();
            if (test.questions.length === 0) {
                test.questions.push({
                    id: crypto.randomUUID(),
                    title: "",
                    order: 1,
                    content: [],
                });
            }
            return test;
        })()
    );
    const { translateBackendStatus, backendErrors } = useErrorHandler();
    const { chaneImage, uploadImage } = useImageHook();
    /* test structure  { test_data:{ name: "", image_href:"",description:""},
        questions: [{id: 1,title:"",order:1 content: [{choice_id:1, choice: "", is_correct: false } }] }*/
    function initializeTest() {}

    const saveTest = (e, toPublish = false) => {
        e.preventDefault();
        let id = crypto.randomUUID();
        axios
            .post(
                "/api/tests",
                {
                    ...test,
                    test_data: { ...test.test_data, id: id },
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

    return (
        <EditUI
            test={test}
            changeTestData={changeTestData}
            saveTest={saveTest}
            backendErrors={backendErrors}
            changeImageData={chaneImage}
        ></EditUI>
    );
};

export default TestMaker;

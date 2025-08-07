import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import UserContext from "../../UserContext";
import translateStatus from "../Enums/TestStatuses";
import useLockLogic from "../Helpers/useLockLogic";
import TestPreview from "../testPassing/TestPreview";
import TestHelper from "./TestHelper";
// UI for creating and editing test
const EditUI = ({
    test,
    changeTestData,
    saveTest,
    changeImageData,
    backendErrors = "",
    dropTest = null,
}) => {
    const [activeTab, setActiveTab] = useState("tab1");
    const { isLocked, setLock } = useLockLogic();
    const [previewOfImage, changePreviewOfImage] = useState(null);
    const { user } = useContext(UserContext);
    const [validationError, setErrors] = useState("");
    const [user_image, setUserImageContent] = useState(Date.now());
    useEffect(() => {
        localStorage.setItem(TestHelper.QUESTIONS_KEY, JSON.stringify(test));
    }, [test]);
    useEffect(() => {
        //this is to release memory
        if (previewOfImage) {
            URL.revokeObjectURL(previewOfImage);
        }
    }, [previewOfImage]);
    const resetImage = () => {
        console.log("IMAGE RESETER CALLED", previewOfImage);
        if (previewOfImage) {
            setUserImageContent(Date.now());
            URL.revokeObjectURL(previewOfImage);
            changePreviewOfImage(null);
        }
    };
    function handleTestChange(paramToChange, value) {
        changeTestData((prev) => {
            return {
                ...prev,
                test_data: { ...prev.test_data, [paramToChange]: value },
            };
        });
        validateTest();
    }
    const validateTest = () => {
        if (test?.test_data?.name?.length <= 4 || test?.questions?.length < 1) {
            setErrors("Заполните название и сделайте хотя бы 1 вопрос");
        } else {
            setErrors("");
        }
    };
    function deleteQuestion(e, id_to_delete) {
        if (!confirm("Удалить этот вопрос?")) return;
        validateTest();
        let newQuestions = test.questions.filter((x) => x.id != id_to_delete);
        changeTestData((prev) => {
            return {
                ...prev,
                questions: newQuestions,
            };
        });
    }
    function addQuestion() {
        const new_id = uuidv4();
        changeTestData((prev) => {
            const currentArray = Array.isArray(prev.questions)
                ? prev.questions
                : [];
            return {
                ...prev,
                questions: [
                    ...currentArray,
                    {
                        id: new_id,
                        order: currentArray.length + 1,
                        title: "",
                        content: [
                            { choice_id: 1, choice: "", is_correct: false },
                        ],
                    },
                ],
            };
        });
    }
    const tryToLoadImage = () => {
        if (previewOfImage) {
            return (
                <img
                    src={previewOfImage}
                    className="img-fluid"
                    style={{ maxWidth: "300px", height: "auto" }}
                />
            );
        }
        if (test?.test_data?.image_href) {
            return (
                <img
                    src={test.test_data.image_href}
                    className="img-fluid"
                    style={{ maxWidth: "300px", height: "auto" }}
                />
            );
        }
        return null;
    };
    const handleTestDelete = (e) => {
        e.preventDefault();
        TestHelper.resetTest(changeTestData);
        dropTest?.(e);
    };
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("user_image", file);
        if (file && file.type.startsWith("image/")) {
            changePreviewOfImage(URL.createObjectURL(file));
        }
        changeImageData(formData);
    };
    return (
        <div className="h-100">
            <ul className="nav navbar mb-2">
                <li className="nav-item">
                    <button
                        className={`nav-link ${
                            activeTab === "tab1" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("tab1")}
                    >
                        О тесте
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${
                            activeTab === "tab2" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("tab2")}
                    >
                        К списку вопросов
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${
                            activeTab === "tab3" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("tab3")}
                    >
                        Проверить
                    </button>
                </li>
            </ul>

            <div className="container justify-content-center form-wrapper mx-auto h-100 p-3">
                {activeTab === "tab1" && (
                    <div>
                        <h1 className="fs-2 fs-sm-1 text-center">
                            Осовная информация о тесте
                        </h1>
                        {test.status && (
                            <h4>
                                Статус теста: {translateStatus(test.status)}
                            </h4>
                        )}

                        <form>
                            <div className="container">{tryToLoadImage()}</div>

                            <label>Выберите изображение для вашего теста</label>
                            <input
                                key={user_image}
                                type="file"
                                name="imageForTest"
                                className="form-control m-1"
                                accept="image/png, image/jpeg"
                                onChange={(e) => {
                                    handleImageChange(e);
                                }}
                            />
                            <label className="form-label m-1">
                                Название теста
                            </label>
                            <input
                                id="nameOfTest"
                                className="form-control"
                                type="text"
                                value={test.test_data.name}
                                onChange={(e) => {
                                    handleTestChange("name", e.target.value);
                                }}
                            ></input>
                            <label className="form-label m-1 ">
                                Описание теста
                            </label>
                            <textarea
                                className="form-control m-1"
                                maxLength="200"
                                name="description"
                                rows="3"
                                value={test.test_data.description}
                                onChange={(e) => {
                                    handleTestChange(
                                        "description",
                                        e.target.value
                                    );
                                }}
                            ></textarea>
                            {validationError && (
                                <div className="text-muted">
                                    {validationError}
                                </div>
                            )}
                            {backendErrors && (
                                <div className="text-danger">
                                    {backendErrors}
                                </div>
                            )}
                            <div className="d-flex justify-content-between my-3">
                                <button
                                    className="btn btn-primary "
                                    onClick={(e) => {
                                        setLock(true);
                                        validateTest();
                                        if (validationError == "") {
                                            resetImage();
                                            saveTest(e);
                                        }
                                    }}
                                    disabled={isLocked}
                                >
                                    Сохранить
                                </button>
                                <button
                                    className="btn btn-success "
                                    onClick={(e) => {
                                        setLock(true);
                                        validateTest();
                                        if (validationError == "") {
                                            resetImage();
                                            saveTest(e, true);
                                        }
                                    }}
                                    disabled={isLocked}
                                >
                                    Опубликовать
                                </button>
                            </div>
                            <div className="d-flex justify-content-center my-2">
                                <button
                                    className="btn btn-danger mx-2"
                                    disabled={isLocked}
                                    onClick={(e) => {
                                        resetImage();
                                        handleTestDelete(e);
                                    }}
                                >
                                    Удалить тест
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                {activeTab === "tab2" && (
                    <div className="text-center">
                        <h1 className="fs-2 fs-sm-1 m-1">Список вопросов</h1>
                        {test.questions.map((question) => (
                            <div
                                key={question.id}
                                className="d-flex flex-column m-2 "
                            >
                                <div className="d-flex flex-row w-100 justify-content-center">
                                    <Link
                                        className="text-decoration-none m-2 w-50 question-background p-2"
                                        to={`/question/${question.id}`}
                                    >
                                        Вопрос {question.order} (
                                        {question.title})
                                    </Link>
                                    <button
                                        onClick={(e) =>
                                            deleteQuestion(e, question.id)
                                        }
                                        className="btn btn-danger p-2"
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button
                            className="btn btn-success mt-5"
                            onClick={addQuestion}
                        >
                            Добавить вопрос
                        </button>
                    </div>
                )}
                {activeTab === "tab3" && (
                    <div>
                        <TestPreview></TestPreview>
                    </div>
                )}
            </div>
        </div>
    );
};
export default EditUI;

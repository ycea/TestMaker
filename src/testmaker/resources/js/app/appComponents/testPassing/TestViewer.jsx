import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../../UserContext";
import { TestStatusEnum } from "../Enums/TestStatuses";
import { UserRoleEnum } from "../Enums/UserRoleEnum";
import useLockLogic from "../Helpers/useLockLogic";
const TestViewer = ({
    test,
    publishTest = null,
    dropTest = null,
    addToFavourite = null,
    removeFromFavourite = null,
    answers = null,
    changeAnswers = null,
    rememberAnswers = null,
    submitAnswers = null,
}) => {
    const { user } = useContext(UserContext);
    const [activeIndex, toggleIndex] = useState(0);
    const { isLocked, setLock } = useLockLogic();
    const [correctAnswers, setCorrectAnswers] = useState(null);
    const navigate = useNavigate();
    const isSelectedChoice = (question_id, choice_id) => {
        if (answers != null) {
            for (var answer of answers) {
                if (answer.question_id == question_id) {
                    return answer.chosen_ids.includes(choice_id);
                }
            }
        }

        return false;
    };
    if (activeIndex === 0) {
        return (
            <div className="text-center align-items-center">
                <h1 className="fs-2 fs-sm-1 mb-5">
                    Основная информация о тесте
                </h1>
                <img
                    src={test.test_data.image_href}
                    className="img-fluid"
                    style={{ maxWidth: "300px", height: "auto" }}
                    alst="не удалось загрузить изображение"
                />
                <p className="m-1">Название теста: {test.test_data.name}</p>
                <p className="m-1">Описание: {test.test_data.description}</p>
                <p className="m-1">
                    Пройдено раз: {test.test_data.count_passed}
                </p>
                <p className="m-1">Автор теста: {test.owner_name}</p>
                <div className="my-5">
                    {" "}
                    <button
                        className=" mx-2 p-1 btn btn-primary "
                        onClick={() => {
                            toggleIndex(activeIndex + 1);
                        }}
                    >
                        Перейти к вопросам
                    </button>
                    {test.status == TestStatusEnum.IsPublished && user && (
                        <>
                            {addToFavourite && !test.is_favourite && (
                                <button
                                    className=" mx-2 p-1 btn btn-warning"
                                    disabled={isLocked}
                                    onClick={(e) => {
                                        addToFavourite(e, test.test_data.id);
                                        setLock(true);
                                    }}
                                >
                                    Добавить в избранное
                                </button>
                            )}
                            {removeFromFavourite && test.is_favourite && (
                                <button
                                    className=" mx-2 p-1 btn btn-danger"
                                    disabled={isLocked}
                                    onClick={(e) => {
                                        removeFromFavourite(
                                            e,
                                            test.test_data.id
                                        );
                                        setLock(true);
                                    }}
                                >
                                    Удалить из избранного
                                </button>
                            )}
                        </>
                    )}
                    {test.status == TestStatusEnum.IsPending &&
                        user.role != UserRoleEnum.User && (
                            <>
                                <button
                                    className=" p-1 mx-2 btn btn-success"
                                    disabled={isLocked}
                                    onClick={() => {
                                        publishTest?.(true);
                                        setLock(true);
                                    }}
                                >
                                    Опубликовать
                                </button>
                                <button
                                    disabled={isLocked}
                                    className=" p-1 mx-2 btn btn-danger"
                                    onClick={() => {
                                        publishTest?.(false);
                                        setLock(true);
                                    }}
                                >
                                    Отказать
                                </button>
                            </>
                        )}
                    {test.status == TestStatusEnum.IsPublished &&
                        user.role != UserRoleEnum.User && (
                            <button
                                disabled={isLocked}
                                className=" p-1 mx-2 btn btn-danger"
                                onClick={(e) => {
                                    dropTest?.(e);
                                    setLock(true);
                                }}
                            >
                                Удалить тест
                            </button>
                        )}
                </div>
            </div>
        );
    }
    if (activeIndex === test.questions.length + 1 && submitAnswers) {
        return (
            <div className="text-center">
                {correctAnswers == null && (
                    <>
                        <h2>Отправить решение? </h2>
                        <div className="mt-5">
                            <button
                                className="btn btn-success mx-2"
                                disabled={isLocked}
                                onClick={(e) => {
                                    submitAnswers?.(e).then((response) => {
                                        setCorrectAnswers(
                                            response.data.correct_answers
                                        );
                                    });
                                    setLock(true);
                                }}
                            >
                                Да
                            </button>
                            <button
                                className="btn btn-danger mx-2"
                                onClick={() => {
                                    toggleIndex(0);
                                }}
                            >
                                Нет (к началу)
                            </button>
                        </div>
                    </>
                )}
                {correctAnswers != null && (
                    <>
                        <h2>Результат теста</h2>
                        <h5>
                            Вы правильно ответили на {correctAnswers} из{" "}
                            {answers.length}{" "}
                        </h5>
                        <div className="mt-5">
                            <button
                                className="mx-2 btn btn-success"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setCorrectAnswers?.(null);
                                    changeAnswers((prev) => {
                                        const updated = {
                                            ...prev,
                                            questions: prev.questions.map(
                                                (question) => ({
                                                    ...question,
                                                    chosen_ids: [],
                                                })
                                            ),
                                        };
                                        return updated;
                                    });

                                    toggleIndex(1);
                                }}
                            >
                                Решить заново
                            </button>
                            <button
                                className="mx-2 btn btn-warning"
                                onClick={() => {
                                    navigate("/");
                                }}
                            >
                                К другим тестам
                            </button>
                        </div>
                    </>
                )}
            </div>
        );
    }
    const activeQuestion = test.questions[activeIndex - 1];
    return (
        <div className="text-center">
            <h1>{activeQuestion.title}</h1>
            {activeQuestion.content.map((choice) => (
                <div className="m-2" key={choice.choice_id}>
                    <label className="m-2">{choice.choice}</label>
                    <input
                        type="checkbox"
                        className="form-check-input mx-2"
                        onChange={(e) => {
                            if (rememberAnswers === null) {
                                alert("Это только для предпросмотра");
                                return;
                            }
                            rememberAnswers?.(
                                activeQuestion.id,
                                choice.choice_id,
                                e.target.checked
                            );
                        }}
                        checked={
                            choice.is_correct ||
                            isSelectedChoice?.(
                                activeQuestion.id,
                                choice.choice_id
                            )
                        }
                        readOnly={submitAnswers == null ? false : true}
                    />
                </div>
            ))}
            <div className="mt-5">
                <button
                    className="btn btn-secondary m-2"
                    onClick={() => {
                        if (activeIndex - 1 >= 0)
                            toggleIndex?.(activeIndex - 1);
                        else console.log("Выходим за пределы массива");
                    }}
                >
                    Предыдущий вопрос
                </button>
                <button
                    className="btn btn-primary m-2"
                    onClick={() => {
                        if (
                            activeIndex < test.questions.length ||
                            (submitAnswers &&
                                activeIndex <= test.questions.length)
                        )
                            toggleIndex?.(activeIndex + 1);
                        else console.log("Выходим за пределы массива");
                    }}
                >
                    Следующий вопрос
                </button>
            </div>
        </div>
    );
};

export default TestViewer;

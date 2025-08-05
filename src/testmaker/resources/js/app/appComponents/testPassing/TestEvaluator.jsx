import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TestStatusEnum } from "../Enums/TestStatuses";
import TestHelper from "../testConstructor/TestHelper";
import TestViewer from "./TestViewer";
const TestEvaluator = () => {
    const [test, changeTestData] = useState();
    const [answers, changeAnswers] = useState();
    const { id } = useParams();
    const navigate = useNavigate();
    useEffect(() => {
        axios
            .get(`/api/tests/${id}`)
            .then((response) => {
                changeTestData(response.data);
            })
            .catch((er) => {
                console.error("ERRROR ", er);
            });
    }, [id]);
    useEffect(() => {
        if (!test?.questions) return;
        const initialAnswers = test.questions.map((question) => ({
            question_id: question.id,
            chosen_ids: [],
        }));
        changeAnswers((prev) => ({ ...prev, questions: initialAnswers }));
    }, [test]);
    if (!test || !answers) {
        return <div>Загрузка теста</div>;
    }
    const updateTestStatus = (toPublish = false) => {
        axios
            .patch(
                `/api/tests/${id}`,
                {
                    ...test,
                    status: toPublish
                        ? TestStatusEnum.IsPublished
                        : TestStatusEnum.IsEdited,
                },
                { withCredentials: true }
            )
            .then(() => {
                alert("Статус теста изменился");
                TestHelper.resetTest(changeTestData);
                navigate("/tests");
            })
            .catch((e) => {
                console.error(e);
                alert("введены некорректные данные, тест не сохранен");
            });
    };
    const dropTest = (e) => {
        e.preventDefault();
        axios
            .delete(`/api/tests/${id}`, { withCredentials: true })
            .then(() => {
                navigate("/tests");
            })
            .catch((error) => {
                console.error("FAILED TO DELETE test", error);
                alert("Не удалось удалить тест");
            });
    };
    const addToFavourite = (e, test_id) => {
        e.preventDefault();
        changeTestData((prev) => ({ ...prev, is_favourite: true }));
        axios
            .post(`/api/my/favourite/tests/${test_id}`, {
                withCredentials: true,
            })
            .catch((error) => {
                console.error("FAILED TO ADD TO FAVOURITE", error);
                alert("Не удалось добавить в избранное");
            });
    };
    const removeFromFavourite = (e, test_id) => {
        e.preventDefault();
        changeTestData((prev) => ({ ...prev, is_favourite: false }));
        axios
            .delete(`/api/my/favourite/tests/${test_id}`, {
                withCredentials: true,
            })
            .catch((error) => {
                console.error("FAILED TO REMOVE FAVOURITE", error);
                alert("не удалось убрать тест");
            });
    };
    const rememberAnswers = (question_id, choice_id, is_checked) => {
        changeAnswers((prev) => {
            const newQuestions = prev.questions.map((question) => {
                if (question.question_id === question_id) {
                    let newChoices = [];

                    if (
                        !question.chosen_ids.includes(choice_id) &&
                        is_checked
                    ) {
                        newChoices = [...question.chosen_ids, choice_id];
                    } else if (
                        question.chosen_ids.includes(choice_id) &&
                        !is_checked
                    ) {
                        newChoices = question.chosen_ids.filter(
                            (id) => id != choice_id
                        );
                    } else {
                        // if nothing changed
                        return question;
                    }

                    return { ...question, chosen_ids: newChoices };
                }
                //if question is not equals to changed question id
                return question;
            });
            return { ...prev, questions: newQuestions };
        });
    };
    const submitAnswers = (e) => {
        e.preventDefault();
        return axios
            .post(`/api/tests/${id}`, answers, { withCredentials: true })
            .catch((e) => {
                console.error("ERRROR ", e);
            });
    };
    return (
        <TestViewer
            test={test}
            publishTest={updateTestStatus}
            dropTest={dropTest}
            addToFavourite={addToFavourite}
            removeFromFavourite={removeFromFavourite}
            answers={answers.questions}
            changeAnswers={changeAnswers}
            submitAnswers={submitAnswers}
            rememberAnswers={rememberAnswers}
        ></TestViewer>
    );
};
export default TestEvaluator;

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TestHelper from "./TestHelper";
const Question = () => {
    const [question, changeQuestion] = useState();
    const [editingChoice, switchEditing] = useState({
        is_editing: false,
        id_of_editing: "",
    });
    const navigate = useNavigate();
    const { id } = useParams();
    useEffect(() => {
        let test = TestHelper.getTestFromStorage();
        if (test) {
            try {
                if (Array.isArray(test.questions)) {
                    let foundQuestion = test.questions.find((q) => q.id === id);
                    if (foundQuestion) {
                        changeQuestion(foundQuestion);
                    }
                }
            } catch {
                console.error("FAILED TO LOAD QUESTION");
                alert("Не получилось загрузить изображение");
            }
        }
    }, []);
    function changeQuestionTitle(e) {
        changeQuestion((prev) => ({ ...prev, title: e.target.value }));
    }
    function changeChoiceContent(e, id_of_edited) {
        const updatedContent = question.content.map((choice) => {
            if (choice.choice_id == id_of_edited) {
                return {
                    ...choice,
                    choice: e.target.value,
                };
            }
            return choice;
        });
        changeQuestion((prev) => ({ ...prev, content: updatedContent }));
    }
    function toggleCorrect(e, id_of_edited) {
        const updatedContent = question.content.map((choice) => {
            if (choice.choice_id == id_of_edited) {
                return {
                    ...choice,
                    is_correct: !choice.is_correct,
                };
            }
            return choice;
        });
        changeQuestion((prev) => ({
            ...prev,
            content: updatedContent,
        }));
    }
    function updateChoice(e, id_of_edited) {
        switchEditing({
            is_editing: !editingChoice.is_editing,
            id_of_editing: id_of_edited,
        });
    }
    function addChoice(e) {
        let newContent = [
            ...question.content,
            { choice_id: crypto.randomUUID(), choice: "", is_correct: false },
        ];
        changeQuestion((prev) => ({
            ...prev,
            content: newContent,
        }));
    }
    function deleteChoice(e, id_of_deleting) {
        if (confirm("Точно удалить вариант ответа?")) {
            let newContent = question.content.filter(
                (val) => val.choice_id != id_of_deleting
            );
            changeQuestion((prev) => ({ ...prev, content: newContent }));
        }
    }
    function saveQuestion(e) {
        let test = JSON.parse(localStorage.getItem(TestHelper.QUESTIONS_KEY));

        localStorage.setItem(
            TestHelper.QUESTIONS_KEY,
            JSON.stringify({
                ...test,
                questions: test.questions.map((toEdit) =>
                    toEdit.id === id ? question : toEdit
                ),
            })
        );
        alert("Вопрос сохранен");
        navigate(-1);
    }
    if (!question)
        return (
            <div>
                Загрузка вопроса. Если слишком долго грузится - вопроса значит
                такого нет
            </div>
        );
    return (
        <div className="align-items-center form-wrapper text-center flex-grow-1 ">
            <h2 className="fs-4 fs-sm-3 fs-sm-2 overflow-auto">
                Вопрос №{question.order}: {question.title}
            </h2>
            <div className="m-2 ">
                <label className="m-2">Введите сюда вопрос</label>
                <input
                    type="text"
                    onChange={changeQuestionTitle}
                    value={question.title}
                ></input>
                <h2 className="m-2 ">Варианты ответов</h2>
                <div>
                    {question.content.map((option) => (
                        <div key={option.choice_id}>
                            <div className=" m-5 mx-auto ">
                                {editingChoice.id_of_editing ==
                                    option.choice_id &&
                                editingChoice.is_editing ? (
                                    <input
                                        type="text"
                                        onChange={(e) =>
                                            changeChoiceContent(
                                                e,
                                                option.choice_id
                                            )
                                        }
                                        onBlur={(e) =>
                                            updateChoice(e, option.choice_id)
                                        }
                                        value={option.choice}
                                    ></input>
                                ) : (
                                    <label className="form-check-label me-5">
                                        {option.choice}
                                    </label>
                                )}

                                <input
                                    type="checkbox"
                                    className="form-check-input mx-2 checked"
                                    onChange={(e) =>
                                        toggleCorrect(e, option.choice_id)
                                    }
                                    checked={option.is_correct}
                                />
                                <button
                                    className="btn mx-2 btn-warning"
                                    onClick={(e) =>
                                        updateChoice(e, option.choice_id)
                                    }
                                >
                                    Ред.
                                </button>
                                <button
                                    className="btn mx-2 btn-danger"
                                    onClick={(e) =>
                                        deleteChoice(e, option.choice_id)
                                    }
                                >
                                    Удалить
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <button className="btn btn-primary mx-3" onClick={addChoice}>
                    Добавить вариант ответа
                </button>
                <button className="btn btn-success mx-3" onClick={saveQuestion}>
                    Сохранить вопрос
                </button>
            </div>
        </div>
    );
};
export default Question;

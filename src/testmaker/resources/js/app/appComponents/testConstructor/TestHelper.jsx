import axios from "axios";
import { v4 as uuidv4 } from "uuid";
const QUESTIONS_KEY = "test";
function getTestFromStorage() {
    try {
        const raw = localStorage.getItem(QUESTIONS_KEY);
        return raw ? JSON.parse(raw) : { test_data: {}, questions: [] };
    } catch (e) {
        console.error("Ошибка чтения теста:", e);
        return { test_data: {}, questions: [] };
    }
}
function getTestFromServer(uuid, hide_answers = true) {
    let endpoint = hide_answers
        ? `/api/tests/${uuid}`
        : `/api/my/tests/${uuid}`;
    return axios
        .get(endpoint)
        .then((response) => response.data)
        .catch((error) => {
            console.error("FAILED TO LOAD TEST ", error);
            return null;
        });
}
const resetTest = (changeTestData) => {
    const emptyTest = {
        test_data: { name: "", image_href: null, description: "" },
        questions: [
            {
                id: uuidv4(),
                order: 1,
                content: [
                    {
                        choice_id: uuidv4(),
                        choice: "",
                        is_correct: false,
                    },
                ],
            },
        ],
    };
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(emptyTest));
    changeTestData?.(emptyTest);
};

export default {
    QUESTIONS_KEY,
    getTestFromStorage,
    getTestFromServer,
    resetTest,
};

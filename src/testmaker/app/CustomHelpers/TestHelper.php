<?php


namespace App\CustomHelpers;

use Illuminate\Support\Str;
use App\Enums\TestStatusEnum;

class TestHelper
{
    public static function makeTest($testId = "", $name = "", $image_href = "", $description = "", $questions = [], $status = TestStatusEnum::IsEdited)
    {
        return [
            'test_data' => ['name' => $name, 'image' => $image_href, 'description' => $description, "id" => $testId],
            'questions' => $questions,
            'status' => $status
        ];
    }
    public static function makeDefaultCorrectTest($created_id = "", $status = TestStatusEnum::IsEdited)
    {
        if (empty($created_id)) {
            $created_id = Str::uuid()->toString();
        }
        return TestHelper::makeTest(testId: $created_id, name: "Name12", description: "3124124", questions: TestHelper::getQuestions(), status: $status);
    }
    public static function getQuestions($question_ids = [])
    {
        return [
            [
                "id" => $question_ids[0]['question_id'] ?? Str::uuid(),
                "title" => "Вопрос о чем-то",
                "order" => 1,
                "content" => [
                    [
                        "choice_id" => $question_ids[0]['content'][0]['choice_id'] ?? Str::uuid(),
                        "choice" => "Текст ответа 1",
                        "is_correct" => false
                    ],
                    [
                        "choice_id" => $question_ids[0]['content'][1]['choice_id'] ?? Str::uuid(),
                        "choice" => "Текст ответа 2",
                        "is_correct" => true
                    ]
                ]
            ],
            [
                "id" => $question_ids[1]['question_id'] ?? Str::uuid(),
                "title" => "Второй вопрос",
                "order" => 2,
                "content" => [
                    [
                        "choice_id" =>  $question_ids[1]['content'][0]['choice_id'] ?? Str::uuid(),
                        "choice" => "Ответ 1",
                        "is_correct" => true
                    ],
                    [
                        "choice_id" => $question_ids[1]['content'][1]['choice_id'] ??  Str::uuid(),
                        "choice" => "Текст ответа 2",
                        "is_correct" => false
                    ]

                ]
            ]
        ];
    }
}

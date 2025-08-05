<?php

namespace Tests\ControllerTests;

use App\Enums\TestStatusEnum;
use App\Enums\UserRoleEnum;
use Illuminate\Mail\Mailables\Content;
use Tests\TestCase;
use App\Models\User;
use App\Models\Test;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use App\CustomHelpers\TestHelper;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

class TestControllerTest extends TestCase
{
    use RefreshDatabase;
    protected $user;
    protected $moderator;

    public function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->moderator = User::factory()->create();
        $this->moderator->forceFill(['role' => UserRoleEnum::Moderator])->save();
        $this->actingAs($this->user);
    }

    public function test_inserting_test_should_204()
    {
        $response = $this->postJson("/api/tests", TestHelper::makeTest(
            testId: Str::uuid(),
            name: "Some name",
            description: "some description",
            questions: TestHelper::getQuestions()
        ));
        $response->assertStatus(204);
    }
    public function test_inserting_tooMuchName_should_422()
    {
        $response = $this->postJson('/api/tests', data: TestHelper::makeTest(testId: Str::uuid(), name: str_repeat("2323", 100), description: "21312", questions: TestHelper::getQuestions()));
        $response->assertStatus(422);
        $this->assertArrayHasKey('test_data.name', $response->json('errors'));
    }
    public function test_inserting_shortName_should_422()
    {
        $response = $this->postJson('/api/tests', data: TestHelper::makeTest(testId: Str::uuid(), questions: TestHelper::getQuestions()));
        $response->assertStatus(422);
        $this->assertArrayHasKey('test_data.name', $response->json('errors'));
    }

    public function test_inserting_tooMuchDescription_should_422()
    {
        $response = $this->postJson('/api/tests', data: TestHelper::makeTest(testId: Str::uuid(), name: "142", description: str_repeat("23123", 120), questions: TestHelper::getQuestions()));
        $response->assertStatus(422);
        $this->assertArrayHasKey("test_data.description", $response->json("errors"));
    }
    public function test_inserting_not_uuid_should_422()
    {

        $response = $this->postJson("/api/tests", TestHelper::makeTest(
            testId: "2124124",
            name: "Some name",
            description: "some description",
            questions: TestHelper::getQuestions()
        ));
        $response->assertStatus(422);
    }
    public function test_inserting_test_should_401()
    {
        auth()->logout();
        $this->assertGuest();
        $response = $this->postJson("/api/tests", TestHelper::makeTest(
            testId: Str::uuid(),
            name: "Some name",
            description: "some description",
            questions: TestHelper::getQuestions()
        ));
        $response->assertStatus(401);
    }
    public function test_try_to_robTest_should_403()
    {
        auth()->logout();
        $created_id = Str::uuid();
        Test::factory()->create(["created_id" => $created_id, 'status' => TestStatusEnum::IsEdited]);
        $this->assertGuest();

        $this->get('/api/tests/' . $created_id)->assertStatus(403);
        $this->actingAs($this->moderator);
        $this->get('/api/tests/' . $created_id)->assertStatus(403);
    }
    public function test_get_test_by_id_should_404()
    {
        $created_id = Str::uuid();
        $response = $this->get("/api/tests/$created_id");
        $response->assertStatus(404);
    }
    public function test_get_test_by_id_should_200()
    {
        $created_id = Str::uuid()->toString();
        $response = $this->postJson("/api/tests", TestHelper::makeDefaultCorrectTest($created_id));
        $response->assertStatus(204);
        $ResponseToGetTest = $this->get("/api/tests/$created_id");
        $ResponseToGetTest->assertStatus(200);
        $this->assertEquals($created_id, $ResponseToGetTest->json("test_data.id"));
    }
    public function test_get_favourite_test_should_success()
    {
        //this is to test the feature when you get test outside and it will show if this is in your favourite
        $created_id = Str::uuid();
        $this->postJson("/api/tests", TestHelper::makeDefaultCorrectTest($created_id));
        $this->post('/api/my/favourite/tests/' . $created_id)->assertStatus(204);
        $response = $this->get("/api/tests/$created_id");
        $response->assertStatus(200);
        $this->assertArrayHasKey('is_favourite', $response->json());
        $this->assertEquals(true, $response->json('is_favourite'));
    }
    public function test_get_my_test_should_succcess()
    {
        $created_id = Str::uuid();
        Test::factory()->create(['created_id' => $created_id, 'status' => TestStatusEnum::IsPublished, 'test_content' => TestHelper::getQuestions(), 'user_id' => $this->user->id]);
        $response = $this->get('/api/my/tests/' . $created_id);
        $response->assertStatus(200);
        $this->assertArrayHasKey('questions', $response->json());
        $this->assertCount(2, $response->json('questions'));
    }
    public function test_get_empty_tests_should_200()
    {
        $response = $this->get("/api/tests");
        $response->assertJsonStructure($this->getListStructure());
        $json = $response->json();
        $this->assertEmpty($json['data']);
    }
    public function test_get_tests_should_200()
    {
        $first_test = Str::uuid();
        $second_test = Str::uuid();
        $this->postJson('/api/tests', TestHelper::makeDefaultCorrectTest($first_test, status: TestStatusEnum::IsPending))->assertStatus(204);
        $this->postJson('/api/tests', TestHelper::makeDefaultCorrectTest($second_test, status: TestStatusEnum::IsPending))->assertStatus(204);
        $this->postJson('/api/tests', TestHelper::makeDefaultCorrectTest())->assertStatus(204);
        $this->postJson('/api/tests', TestHelper::makeDefaultCorrectTest())->assertStatus(204);
        $this->actingAs($this->moderator);
        $this->patch('/api/tests/' . $first_test, ['status' => TestStatusEnum::IsPublished])->assertStatus(204);
        $this->patch('/api/tests/' . $second_test, ['status' => TestStatusEnum::IsPublished])->assertStatus(204);
        $response = $this->get("/api/tests");
        $this->assertListEqualsLength($response, 2);
        $test = $response->json()['data'][0];
        $this->assertCount(0, $test['questions']);
    }
    public function test_get_owned_tests_should_success()
    {
        $created_id = Str::uuid();
        $this->postJson('/api/tests', TestHelper::makeDefaultCorrectTest())->assertStatus(204);
        $this->postJson('/api/tests', TestHelper::makeDefaultCorrectTest($created_id, TestStatusEnum::IsPending))->assertStatus(204);
        $this->postJson('/api/tests', TestHelper::makeDefaultCorrectTest(status: TestStatusEnum::IsPending))->assertStatus(204);
        $this->actingAs($this->moderator);
        $this->patch('/api/tests/' . $created_id, ['status' => TestStatusEnum::IsPublished])->assertStatus(status: 204);
        $this->actingAs($this->user);
        $response = $this->get('/api/my/tests');
        $this->assertListEqualsLength($response, 3);
    }
    public function test_get_tests_on_moderation_should_success()
    {
        $this->postJson('/api/tests', TestHelper::makeDefaultCorrectTest(status: TestStatusEnum::IsPending))->assertStatus(204);
        $this->postJson('/api/tests', TestHelper::makeDefaultCorrectTest(status: TestStatusEnum::IsPending))->assertStatus(204);
        $this->postJson('/api/tests', TestHelper::makeDefaultCorrectTest(status: TestStatusEnum::IsPending))->assertStatus(204);
        $this->actingAs($this->moderator);
        $response = $this->get('/api/moderated/tests');
        $this->assertListEqualsLength($response, 3);
    }
    public function test_update_non_existent_test_should_404()
    {

        $response = $this->putJson('/api/tests/' . Str::uuid(), TestHelper::makeDefaultCorrectTest());
        $response->assertStatus(404);
    }
    public function test_update_should_success()
    {
        $created_id = Str::uuid()->toString();
        $this->postJson('/api/tests', TestHelper::makeDefaultCorrectTest($created_id))->assertStatus(204);
        $test = $this->get('/api/tests/' . $created_id)->json();
        $test['test_data']['name'] = 'NEW NAME';
        $test['status'] = TestStatusEnum::IsEdited;
        $this->putJson('/api/tests/' . $created_id, $test)->assertStatus(204);
        $response = $this->get('/api/tests/' . $created_id);
        $finalTest = $response->json();
        $this->assertEquals($test['test_data']['name'], $finalTest['test_data']['name']);
    }
    public function test_update_with_emptyData_should_422()
    {
        $created_id = Str::uuid()->toString();
        $this->postJson('/api/tests', TestHelper::makeDefaultCorrectTest($created_id));
        $response = $this->putJson('/api/tests/' . $created_id, TestHelper::makeTest());
        $response->assertStatus(422);
    }
    public function test_delete_should_404()
    {
        $response = $this->delete('/api/tests/' . Str::uuid()->toString());
        $response->assertStatus(404);
    }
    public function test_delete_should_204()
    {
        $created_id = Str::uuid()->toString();
        $this->postJson('/api/tests', TestHelper::makeDefaultCorrectTest($created_id));
        $getTest = $this->get('/api/tests/' . $created_id);
        $getTest->assertJsonStructure(['test_data', 'questions']);
        $this->delete('/api/tests/' . $created_id)->assertStatus(204);
        $getTest = $this->get('/api/tests/' . $created_id);
        $getTest->assertStatus(404);
    }
    public function test_solution_check_should_success()
    {
        auth()->logout();
        $this->assertGuest();
        $created_id = Str::uuid()->toString();
        $questions_Ids = $this->createQuestionsIds();
        Test::factory()->create(['created_id' => $created_id, 'test_content' => TestHelper::getQuestions($questions_Ids), 'status' => TestStatusEnum::IsPublished]);
        $test = $this->getJson('/api/tests/' . $created_id);
        $test->assertJsonMissing(['is_correct']);
        $answersJson = ['questions' => [
            ['question_id' => $questions_Ids[0]['question_id'], 'chosen_ids' => [$questions_Ids[0]['content'][1]['choice_id']]],
            ['question_id' => $questions_Ids[1]['question_id'], 'chosen_ids' => [
                $questions_Ids[1]['content'][0]['choice_id'],
                $questions_Ids[1]['content'][1]['choice_id']
            ]],
        ]];
        $response = $this->postJson('/api/tests/' . $created_id, $answersJson);
        $response->assertStatus(200);
        $this->assertArrayHasKey('correct_answers', $response->json());
        $this->assertEquals(1, $response->json()['correct_answers']);
    }
    public function test_deny_to_publish()
    {
        $created_id = Str::uuid()->toString();
        Test::factory()->create(['created_id' => $created_id, 'status' => TestStatusEnum::IsPending]);
        Test::factory()->create(['status' => TestStatusEnum::IsPending]);
        Test::factory()->create(['status' => TestStatusEnum::IsPending]);
        $this->actingAs($this->moderator);
        $tests = $this->getJson('/api/moderated/tests')->assertStatus(200)->json('data');
        $this->assertCount(3, $tests);
        $this->patch('/api/tests/' . $created_id, ['status' => TestStatusEnum::IsEdited]);
        $tests = $this->getJson('/api/moderated/tests')->assertStatus(200)->json('data');
        $this->assertCount(2, $tests);
    }
    public function test_upload_image_should_success()
    {
        Storage::fake('public');
        $created_id = Str::uuid()->toString();
        Test::factory()->create(['created_id' => $created_id, 'image_url' => '/some-link']);
        $file = UploadedFile::fake()->image('224.png');
        $response = $this->post("/api/tests/$created_id/image", ['user_image' => $file]);
        $response->assertStatus(200);
        Storage::disk('public')->assertExists($response->json('path'));
    }
    public function test_replace_image_should_success()
    {
        Storage::fake('public');
        $created_id = Str::uuid()->toString();
        Test::factory()->create(['created_id' => $created_id, 'image_url' => '/some-link']);
        $file = UploadedFile::fake()->image('224.png');
        $response = $this->post("/api/tests/$created_id/image", ['user_image' => $file]);
        $response->assertStatus(200);
        $old_path = $response->json('path');
        $file = UploadedFile::fake()->image('221.jpg'); //load different extension
        $this->post("/api/tests/$created_id/image", ['user_image' => $file])->assertStatus(200);
        Storage::disk('public')->assertMissing($old_path);
    }
    public function test_delete_image_should_success()
    {
        Storage::fake('public');
        $created_id = Str::uuid()->toString();
        Test::factory()->create(['created_id' => $created_id, 'image_url' => '/some-link', 'user_id' => $this->user->id]);
        $file = UploadedFile::fake()->image('224.png');
        $response = $this->post("/api/tests/$created_id/image", ['user_image' => $file]);
        $response->assertStatus(200);
        $this->delete("/api/tests/$created_id/image")->assertStatus(204);
        Storage::disk("public")->assertMissing($response->json("path"));
    }
    private function getListStructure()
    {
        return [
            'current_page',
            'data' => [
                '*' => [
                    'test_data',
                    'questions'
                ]
            ],
            'first_page_url',
            'from',
            'last_page',
            'last_page_url',
            'links',
            'next_page_url',
            'path',
            'per_page',
            'prev_page_url',
            'to',
            'total',
        ];
    }
    private function assertListEqualsLength($list, $length = 0)
    {
        $list->assertJsonStructure($this->getListStructure());
        $list->assertJsonCount($length, 'data');
    }
    private function createQuestionsIds()
    {
        $questions = [
            ['question_id' => Str::uuid(), 'content' => [['choice_id' => Str::uuid()], ['choice_id' => Str::uuid()]]],
            ['question_id' => Str::uuid(), 'content' => [['choice_id' => Str::uuid()], ['choice_id' => Str::uuid()]]]
        ];
        return $questions;
    }
}

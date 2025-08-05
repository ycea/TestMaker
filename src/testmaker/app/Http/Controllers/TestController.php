<?php

namespace App\Http\Controllers;

use App\Enums\TestStatusEnum;
use App\Enums\UserRoleEnum;
use App\Http\Controllers\Controller;
use Carbon\Traits\ToStringFormat;
use Illuminate\Http\Request;
use App\Models\Test;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class TestController extends Controller
{


    public function saveTest(Request $request)
    {
        $user = auth()->user();
        $this->validateTest(request: $request);
        $status = $request->input("status", TestStatusEnum::IsEdited);
        $this->authorize('create', Test::class);
        $test = Test::create($this->createTestStructure($request, $user));
        $test->status = $status;
        $test->save();
        return response()->noContent();
    }

    public function updateStatus(Request $request, $uuid)
    {
        $test = Test::where("created_id", $uuid)->firstOrFail();
        $request->validate(['status' => ['required', Rule::in([TestStatusEnum::IsEdited, TestStatusEnum::IsPublished])]]);

        $this->authorize("publish", $test);
        $test->status = $request->input('status');
        $test->save();
        return response()->noContent();
    }
    public function denyToPublisih($uuid)
    {
        $test = Test::where("created_id", $uuid)->firstOrFail();
        $this->authorize("publish", $test);
        $test->status = TestStatusEnum::IsEdited;
        $test->save();
        return response()->noContent();
    }
    public function getTest($uuid)
    {
        $test = Test::where('created_id', $uuid)->firstOrFail();
        $this->authorize('view', $test);
        $user = auth()->user();
        $isFavourite = false;
        if ($user != null) {
            $isFavourite = $user->favourites()->where('test_id', $test->id)->exists();
        }
        return response()->json($test->format(load_questions: true, is_favourite: $isFavourite));
    }
    public function getMyTest($uuid)
    {
        $test = Test::where('created_id', $uuid)->firstOrFail();
        $this->authorize('canViewAnswers', $test);
        return response()->json($test->format(hide_answers: false, load_questions: true));
    }
    public function getTests(Request $request)
    {
        $per_page = $request->query('per_page', 20);
        return $this->getTestsWithStatus(TestStatusEnum::IsPublished, $per_page);
    }
    public function getModeratedTests(Request $request)
    {
        $user = auth()->user();
        if (!in_array($user->role, [UserRoleEnum::Moderator, UserRoleEnum::Admin])) {
            abort(403, "Not enough rights");
        }
        $per_page = $request->query('per_page', 20);
        return $this->getTestsWithStatus(TestStatusEnum::IsPending, $per_page, false);
    }
    public function getMyTests(Request $request)
    {
        $user = auth()->user();
        $per_page = $request->query('per_page', 20);
        return $this->getTestsWithStatus(TestStatusEnum::IsEdited, $per_page, false, $user);
    }
    public function update(Request $request, $uuid)
    {
        $this->validateTest($request, "update");
        $test = Test::where("created_id", $uuid)->firstOrFail();
        $status = $request->input("status", TestStatusEnum::IsEdited);
        $this->authorize('update', $test);
        $test->update([
            'name' => $request->input("test_data.name"),
            'description' => $request->input('test_data.description'),
            'test_content'  => $request->input('questions'),
            'image_url' => $request->input('test_data.image_href')
        ]);
        $test->status = $status;
        $test->save();
        return response()->noContent();
    }
    public function delete(Request $request, $uuid)
    {
        $test = Test::where('created_id', $uuid)->firstOrFail();
        $this->authorize('delete', $test);
        $this->deleteTestImage($uuid);
        $test->delete();
        return response()->noContent();
    }
    public function loadTestImage(Request $request, $uuid)
    {
        $test = Test::where('created_id', $uuid)->firstOrFail();
        $this->authorize('create', $test);

        $request->validate(['user_image' => 'required|image|mimes:jpeg,png,jpg|max:2048']);
        $image = $request->file('user_image');
        $this->deleteTestImage($uuid);
        $filename = $uuid . '.' . $image->getClientOriginalExtension();
        $path = $image->storeAs('images', $filename, 'public');

        if (!$path) {
            abort(500, "FAILED TO LOAD IMAGE");
        }
        $test->image_url = Storage::url($path);
        $test->save();
        return response()->json(['path' => (string)$path, 'url' => Storage::url($path)], 200);
    }
    public function deleteImage(Request $request, $uuid)
    {
        $test = Test::where('created_id', $uuid)->firstOrFail();
        $this->authorize('delete', $test);
        $this->deleteTestImage($uuid);
        return response()->noContent();
    }
    public function checkSolution(Request $request, $uuid)
    {
        $request->validate(['questions' => 'required|array', 'questions.*.id' => 'uuid', 'questions.*.chose_ids' => 'array', 'questions.*.chosen_ids.*' => 'uuid']);
        $test = Test::where('created_id', $uuid)->firstOrFail();
        $this->authorize('view', $test);
        $test_content = $test->test_content;
        $expected_input = [];
        foreach ($test_content as $question) {
            $expected_answers = [];
            foreach ($question['content'] as $choice) {
                if ($choice['is_correct']) {
                    $expected_answers[] = $choice['choice_id'];
                }
            }
            $expected_input[$question['id']] = $expected_answers;
        }

        $actual_input = $request->input('questions');
        $counter_of_right_answers = 0;

        if (count($expected_input) != count($actual_input)) {
            abort(422, 'incorrect answers data');
        }
        foreach ($actual_input as $question) {
            if (!array_key_exists($question['question_id'], $expected_input)) {
                Log::error('Invalid question_id provided', ['id' => $question['question_id']]);
                abort(422, 'Invalid data');
            }
            if (!isset($expected_input[$question['question_id']])) {
                abort(422, 'Incorrect data trasmitted');
            }
            $expectedIds = $expected_input[$question['question_id']];
            $isCorrect = empty(array_diff($expectedIds, $question['chosen_ids'])) && empty(array_diff($question['chosen_ids'], $expectedIds)) && count($question['chosen_ids']) > 0;

            if ($isCorrect) {
                $counter_of_right_answers++;
            }
        }
        $test->count_passed += 1;
        $test->save();

        return response()->json([
            'correct_answers' => $counter_of_right_answers
        ]);
    }
    private function getTestsWithStatus($status, $per_page, $hide_answers = true, $user = null)
    {

        $paginated_tests = null;
        switch ($status) {
            case TestStatusEnum::IsEdited:
                $query = Test::whereIn('status', [TestStatusEnum::IsEdited, TestStatusEnum::IsPending, TestStatusEnum::IsPublished])->where('user_id', $user->id);
                break;
            case TestStatusEnum::IsPending:
                $query = Test::where('status', TestStatusEnum::IsPending);
                break;
            default:
                $query = Test::where('status', $status);
        }
        $query = $query->select("created_id", "name", "image_url");
        $paginated_tests = $query->paginate($per_page);
        $formattedData = $paginated_tests->getCollection()->transform(function ($test) use ($hide_answers) {
            return $test->format($hide_answers);
        });
        $paginated_tests->setCollection($formattedData);
        return response()->json($paginated_tests);
    }

    private function validateTest($request, $action = "create")
    {
        $rules = [
            'test_data.name' => 'required|min:3|max:40',
            'test_data.description' => 'required|max:200',
            'questions' => 'array|required|min:1',
            'test_data.image_href' => 'nullable|regex:/^(?!https?:\/\/)[\/a-zA-Z0-9_\-\.]+$/',
            'status' => 'in:' . TestStatusEnum::IsPending . ',' . TestStatusEnum::IsEdited,
        ];

        if ($action == "create") {
            $rules['test_data.id'] = 'required|uuid|unique:tests,created_id';
        }
        $request->validate($rules);
    }
    private function createTestStructure(Request $request, $user)
    {
        return [
            'name' => $request->input('test_data.name'),
            'image_url' => $request->input('test_data.image_href'),
            'created_id' => $request->input('test_data.id'),
            'description' => $request->input('test_data.description'),
            'test_content' => $request->input('questions'),
            'user_id' => $user->id
        ];
    }
    private function deleteTestImage($uuid)
    {
        $matching = $this->findTestImage($uuid);
        if ($matching) {
            Storage::disk('public')->delete($matching);
        }
    }
    private function findTestImage($uuid)
    {
        $files = Storage::disk('public')->files('images');
        $matching = collect($files)->first(function ($file) use ($uuid) {
            return pathinfo($file, PATHINFO_FILENAME) == $uuid;
        });
        return $matching;
    }
}

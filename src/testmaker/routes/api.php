<?php


use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TestController;
use App\Models\Test;
use App\Http\Controllers\MailController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    if ($request->user()->hasVerifiedEmail()) {

        return $request->user();
    }
    return null;
});


Route::post("register-user", [UserController::class, "registerUser"]);
Route::post("login-user", action: [UserController::class, "loginUser"]);
//This route where we can look for many people by name or any different data. But now it will work without it



Route::get('tests/{uuid}', [TestController::class, 'getTest']);
Route::get('tests', [TestController::class, 'getTests']);
Route::post('tests/{uuid}', [TestController::class, 'checkSolution']);

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::post('send-feedback', [MailController::class, 'sendFeedBack']);

    Route::get('my/tests/{uuid}', [TestController::class, 'getMyTest']);
    Route::middleware('force.json')->post('tests', action: [TestController::class, 'saveTest']);
    Route::put('tests/{uuid}', [TestController::class, 'update']);
    Route::delete('tests/{uuid}', [TestController::class, 'delete']);
    Route::get("moderated/tests", [TestController::class, "getModeratedTests"]);
    Route::get("my/tests", [TestController::class, "getMyTests"]);
    Route::patch('tests/{uuid}', [TestController::class, 'updateStatus']);

    Route::post("tests/{uuid}/image", [TestController::class, "loadTestImage"]);
    Route::delete('tests/{uuid}/image', [TestController::class, 'deleteImage']);

    Route::get('users',  [UserController::class, 'getUsersByData']);
    Route::get('users/{name}', [UserController::class, 'getUserByName']);
    Route::patch('users/{name}', [UserController::class, 'changeUserRole']);
    Route::patch('users/{name}/ban', [UserController::class, 'banUser']);
    Route::patch('users/{name}/unban', [UserController::class, 'unbanUser']);
    Route::post("logout", action: [UserController::class, "logout"]);
    Route::get('my/favourite/tests', [UserController::class, 'getFavourites']);
    Route::post('my/favourite/tests/{uuid}', [UserController::class, 'addFavouriteTest']);
    Route::delete("my/favourite/tests/{uuid}", [UserController::class, 'removeFavouriteTest']);
});

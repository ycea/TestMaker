<?php

namespace App\Http\Controllers;

use App\Enums\UserRoleEnum;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Test;
use App\Models\User_Favourites;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Log;
use function PHPSTORM_META\map;

class UserController extends Controller
{
    public function registerUser(Request $request)
    {
        $this->validate($request, [
            "email" => "required|email|unique:users",
            "name" => "required|regex:/^[a-zA-Z0-9]{4,}$/|unique:users",
            "password" => "required|regex:/^(?=.*[A-Za-z])(?=.*\d).{8,}$/"
        ]);
        $user = User::create(['email' => $request->input("email"), 'name' => $request->input("name"), 'password' => $request->input('password')]);
        Auth::login($user);
        $user->sendEmailVerificationNotification();

        return response()->json();
    }

    public function loginUser(Request $request)
    {
        $user_data = $request->input(('nameOrEmail'));
        $succesLogin = false;
        if (str_contains($user_data, '@')) {
            $this->validate($request, ['nameOrEmail' => "required|email"]);
            $succesLogin = Auth::attempt((["email" => $request->input("nameOrEmail"), "password" => $request->input("password")]));
        } else {
            $this->validate($request, rules: ['nameOrEmail' => "required|regex:/^[a-zA-Z0-9]{4,}$/"]);
            $succesLogin = Auth::attempt((["name" => $request->input("nameOrEmail"), "password" => $request->input("password")]));
        }
        if ($succesLogin) {
            $user = Auth::user();
            if ($user->hasVerifiedEmail()) {
                return response()->json(data: ['status' => 'succes', 'user' => $user]);
            }
        }
        return response()->json(data: ['status' => "failed"], status: 401);
    }
    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate(); // 2. Уничтожить сессию
        $request->session()->regenerateToken(); // 3. Обновить CSRF токен

        return response()->noContent(); // 204 или редирект на login
    }
    public function getFavourites(Request $request)
    {
        $per_page = $request->query('per_page', 20);
        $tests_returned = auth()->user()->favourites()->paginate($per_page);
        $new_test_data =  $tests_returned->getCollection()->transform(function ($test) {
            return $test->format();
        });
        $tests_returned->setCollection($new_test_data);
        return response()->json($tests_returned);
    }
    public function addFavouriteTest(Request $request, $uuid)
    {
        $test = $this->returnTest($uuid);
        auth()->user()->favourites()->attach($test->id);
        return response()->noContent();
    }
    public function removeFavouriteTest(Request $request, $uuid)
    {
        $test = $this->returnTest($uuid);
        auth()->user()->favourites()->detach($test->id);
        return response()->noContent();
    }
    public function getUsersByData(Request $request)
    {
        $per_page = $request->query('per_page', 20);
        $query = User::query();
        if ($request->input('search')) {
            $search_word = $request->input('search');
            $query->where('name', 'like', '%' . $search_word . '%');
        }
        $users = $query->paginate($per_page);
        $new_users = $users->getCollection()->transform(function ($user) {
            return $user->formatToPublicView();
        });
        $users->setCollection($new_users);
        return response()->json($users);
    }
    public function getUserByName(Request $request, $name)
    {
        $user = User::where('name', $name)->firstOrFail();
        return response()->json($user->formatToPublicView());
    }
    public function changeUserRole(Request $request, $name)
    {
        $request->validate(['name' => 'regex:/^[a-zA-Z0-9]{4,}$/', 'change_to' => 'required|in:' . UserRoleEnum::Admin . ',' . UserRoleEnum::User . ',' . UserRoleEnum::Moderator]);
        $user_to_change = User::where('name', $name)->firstOrFail();
        $this->authorize('doAdminStuff', $user_to_change);
        $user_to_change->assignRole($request->input('change_to'));
        return response()->noContent();
    }
    public function banUser(Request $request, $name)
    {
        $request->validate(['name' => 'regex:/^[a-zA-Z0-9]{4,}$/', 'ban_days' => 'required|numeric']);
        $user = User::where('name', $name)->firstOrFail();
        $this->authorize('doAdminStuff', $user);
        $user->banned_until = now()->addDays($request->input('ban_days'));
        $user->save();
        return response()->noContent();
    }
    public function unbanUser(Request $request, $name)
    {
        $request->validate(['name' => 'regex:/^[a-zA-Z0-9]{4,}$/']);
        $user = User::where('name', $name)->firstOrFail();
        $this->authorize('doAdminStuff', $user);
        $user->banned_until = null;
        $user->save();
        return response()->noContent();
    }
    private function returnTest($uuid)
    {
        $test = Test::where('created_id',  $uuid)->firstOrFail();
        $this->authorize('view', $test);
        return $test;
    }
}

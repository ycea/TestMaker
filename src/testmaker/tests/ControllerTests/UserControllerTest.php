<?php

namespace Tests\ControllerTests;

use Tests\TestCase;
use App\Models\User;
use App\Models\Test;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use App\Enums\TestStatusEnum;
use App\Enums\UserRoleEnum;
use Carbon\Carbon;
use App\CustomHelpers\TestHelper;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;
    protected $user;
    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory(['name' => 'barbara'])->create();
    }
    public function test_inserting_existing_user_should_422()
    {
        User::factory()->create(["name" => "Dave", "email" => "r@gmail.com", "password" => "123123"]);
        $response = $this->postJson("/api/register-user", ["name" => "Dave", "email" => "r@gmail.com", "password" => "12f3123"]);
        $response->assertStatus(422);
    }
    public function test_insertins_existing_name_should_422()
    {
        User::factory()->create(["name" => "Dave", 'email' => 'r@gmail.com']);
        $response = $this->postJson('/api/register-user', ['name' => 'Dave', 'email' => 'b@gmail.com']);
        $response->assertStatus(422);
    }
    public function test_logging_withEmail_should_succes()
    {
        User::factory()->create(["name" => "Dave", "email" => "r@gmail.com", "password" => "1231f23"]);
        $response = $this->postJson("/api/login-user", ["nameOrEmail" => "r@gmail.com", "password" => "1231f23"]);
        $response->assertStatus(200);
        $this->assertAuthenticated();
    }
    public function test_logging_withName_should_succes()
    {
        User::factory()->create(["name" => "Dave", "email" => "r@gmail.com", "password" => "1231f23"]);
        $response = $this->postJson("/api/login-user", ["nameOrEmail" => "Dave", "password" => "1231f23"]);
        $response->assertStatus(200);
        $this->assertAuthenticated();
    }
    public function test_logging_withWrongEmail_should_422()
    {
        User::factory()->create(["name" => "Dave", "email" => "r@gmail.com", "password" => "1231f23"]);
        $response = $this->postJson("/api/login-user", ["nameOrEmail" => "Dave@", "password" => "1231f23"]);
        $response->assertStatus(422);
    }
    public function test_logging_withWrongName_should_422()
    {
        User::factory()->create(["name" => "Dave", "email" => "r@gmail.com", "password" => "1231f23"]);
        $response = $this->postJson("/api/login-user", ["nameOrEmail" => "", "password" => "1231f23"]);
        $response->assertStatus(422);
    }
    public function test_logging_withWrongPassword_should_401()
    {
        User::factory()->create(["name" => "Dave", "email" => "r@gmail.com", "password" => "1231f23"]);
        $response = $this->postJson("/api/login-user", ["nameOrEmail" => "Dave", "password" => "12f3123ff"]);
        $response->assertStatus(401);
        $response->assertJson(['status' => 'failed']);
    }
    public function test_add_favourite_with_no_access_should_403()
    {
        $this->actingAs($this->user);
        $created_id_1 = Str::uuid();
        $created_id_2 = Str::uuid();
        Test::factory()->create(["created_id" => $created_id_1, 'status' => TestStatusEnum::IsEdited]);
        Test::factory()->create(["created_id" => $created_id_2, 'status' => TestStatusEnum::IsPending]);
        $this->postJson('/api/my/favourite/tests/' . $created_id_1)->assertStatus(403);
        $this->postJson('/api/my/favourite/tests/' . $created_id_2)->assertStatus(403);
    }
    public function test_get_favourite_tests_should_succes()
    {
        $this->actingAs($this->user);
        $created_id_1 = Str::uuid();
        $created_id_2 = Str::uuid();
        Test::factory()->create(["created_id" => $created_id_1, 'status' => TestStatusEnum::IsPublished]);
        Test::factory()->create(["created_id" => $created_id_2, 'status' => TestStatusEnum::IsPublished]);
        $this->post('/api/my/favourite/tests/' . $created_id_1)->assertStatus(204);
        $this->post('/api/my/favourite/tests/' . $created_id_2)->assertStatus(204);
        $tests = $this->get('/api/my/favourite/tests');
        $this->assertCount(2, $tests['data']);
    }
    public function test_delete_favourite_tests_should_succes()
    {
        $created_id_1 = Str::uuid();
        $created_id_2 = Str::uuid();
        $this->actingAs($this->user);
        Test::factory()->create(["created_id" => $created_id_1, 'status' => TestStatusEnum::IsPublished]);
        Test::factory()->create(["created_id" => $created_id_2, 'status' => TestStatusEnum::IsPublished]);
        $this->post('/api/my/favourite/tests/' . $created_id_1)->assertStatus(204);
        $this->post('/api/my/favourite/tests/' . $created_id_2)->assertStatus(204);
        $this->delete(
            '/api/my/favourite/tests/' . $created_id_1
        )->assertStatus(204);
        $tests = $this->get('/api/my/favourite/tests');
        $this->assertCount(1, $tests['data']);
    }
    public function test_get_all_users()
    {
        User::factory()->create();
        User::factory()->create();
        User::factory()->create();
        $user = User::factory()->create();
        $this->actingAs($user);
        $response = $this->get('/api/users');
        $response->assertStatus(200);
        //dont forget that in setup there is a user already
        $this->assertCount(5, $response->json('data'));
        $response->assertJsonStructure(['data' => ['*' => ['name', 'registry_date', 'role', 'banned_until']]]);
    }
    public function test_get_exact_user_should_success()
    {
        User::factory()->create(['name' => "abriccc"]);
        User::factory()->create(['name' => "anriccc"]);
        User::factory()->create();
        $user = User::factory()->create();
        $this->actingAs($user);
        $response = $this->get('/api/users?search=abriccc');
        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }
    public function test_get_user_by_name()
    {
        $this->actingAs($this->user);
        User::factory()->create(['name' => 'agmailcom']);
        $user = User::factory()->create(['name' => "rgmailcom"]);

        $response = $this->get("/api/users/rgmailcom");
        $response->assertStatus(200);
        $this->assertEquals($user->name, $response->json('name'));
    }
    public function test_promote_user_should_success()
    {
        $user = User::factory()->create(['name' => '1132131231', 'email' => 'r@gmail.com']);
        $admin = User::factory()->create(['name' => 'admin', 'email' => 'admin@gmail.com']);
        $admin->assignRole(UserRoleEnum::Admin);
        $this->actingAs($admin);
        $this->patch('/api/users/' . $user->name, ['change_to' => UserRoleEnum::Moderator])->assertStatus(204);
        $user->refresh();
        $this->assertEquals(UserRoleEnum::Moderator, $user->role);
    }
    public function test_promote_with_no_rights_should_403()
    {
        $user = User::factory()->create(['name' => 'use32r']);
        $user2 = User::factory()->create(['name' => 'user232']);
        $this->actingAs($user2);
        $this->patch('/api/users/' . $user->name, ['change_to' => UserRoleEnum::Admin])->assertStatus(403);
    }
    public function test_demote_moderator_should_success()
    {
        $moderator = User::factory()->create(['name' => 'use2332r']);
        $moderator->assignRole(UserRoleEnum::Moderator);
        $admin = User::factory()->create(['name' => 'use2323r2']);
        $this->actingAs($admin);
        $admin->assignRole(UserRoleEnum::Admin);
        $this->patch('/api/users/' . $moderator->name, ['change_to' => UserRoleEnum::User])->assertStatus(204);
        $moderator->refresh();
        $this->assertEquals(UserRoleEnum::User, $moderator->role);
    }
    public function test_demote_admin_should_403()
    {
        $admin1 = User::factory()->create(['name' => "admi232323n"]);
        $admin2 = User::factory()->create(['name' => "admi3223n2"]);
        $this->actingAs($admin1);
        $this->patch('/api/users/' . $admin2->name, ['change_to' => UserRoleEnum::User])->assertStatus(403);
    }
    public function test_ban_user_should_success()
    {
        $user = User::factory()->create(["email" => "a@gmail.com", 'name' => "unique22"]);
        $admin = User::factory()->create(['email' => 'admin@gmail.com']);
        $this->actingAs($admin);
        $admin->assignRole(UserRoleEnum::Admin);
        $this->patch('/api/users/' . $user->name . '/ban', ['ban_days' => 3])->assertStatus(204);
        $user->refresh();
        $this->actingAs($user);
        $this->postJson('/api/tests', TestHelper::makeDefaultCorrectTest())->assertStatus(403);
    }
    public function test_unban_user_should_success()
    {
        $user = User::factory()->create(['email' => 'a@gmail.com', 'name' => 'na23232me2', 'banned_until' => now()->addDays(3)]);
        $admin = User::factory()->create(['email' => 'admin@gmail.com',]);
        $admin->assignRole(UserRoleEnum::Admin);
        $this->actingAs($user);
        $this->postJson('/api/tests', TestHelper::makeDefaultCorrectTest())->assertStatus(403);
        $this->actingAs($admin);
        $this->patch('/api/users/' . $user->name . '/unban')->assertStatus(204);
        $user->refresh();
        $this->actingAs($user);
        $this->postJson('/api/tests', TestHelper::makeDefaultCorrectTest())->assertStatus(204);
    }
    public function test_ban_passes_away()
    {
        $user = User::factory()->create(['email' => 'a@gmail.com', 'name' => "name2322", 'banned_until' => now()->addDays(3)]);
        $this->actingAs($user);
        $this->postJson('/api/tests', TestHelper::makeDefaultCorrectTest())->assertStatus(403);
        Carbon::setTestNow(now()->addDays(4));
        $this->postJson('/api/tests', TestHelper::makeDefaultCorrectTest())->assertStatus(204);
        Carbon::setTestNow();
    }
    public function test_ban_with_no_rights_should_403()
    {
        $user = User::factory()->create(['email' => 'a@gmail.com', 'name' => 'some23User']);
        $user2 = User::factory()->create(['email' => 'ab@gmail.com', 'name' => 'so2me23User']);
        $this->actingAs($user2);
        $this->patch('/api/users/' . $user->name . '/ban', ['ban_days' => 3])->assertStatus(403);
    }
    public function test_ban_admin_should_403()
    {
        $admin1 = User::factory()->create(['email' => 'a@gmail.com', 'name' => 'ad23m2in']);
        $admin2 = User::factory()->create(['email' => 'a1@gmail.com', 'name' => 'adm232in2']);
        $this->actingAs($admin2);
        $admin2->assignRole(UserRoleEnum::Admin);
        $admin1->assignRole(UserRoleEnum::Admin);

        $this->patch('/api/users/' . $admin1->name . '/ban', ['ban_days' => 3])->assertStatus(403);
    }
}

<?php

namespace Tests\StorageTest;
use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use function PHPUnit\Framework\assertEquals;
use function PHPUnit\Framework\assertTrue;
use Illuminate\Support\Facades\Hash;
use App\Enums\UserRoleEnum;
class UserModelTest extends TestCase
{
    use RefreshDatabase;
    public function test_inserting_user()
    {
        $user = User::factory()->create(["name" => "Dave", "email" => "r@gmail.com", "password" => "123123"]);
        assertEquals("Dave", $user->name);
        assertEquals(today(), $user->registry_date);
        assertTrue(Hash::check("123123", $user->password));
        assertEquals(UserRoleEnum::User, $user->role);
    }
}
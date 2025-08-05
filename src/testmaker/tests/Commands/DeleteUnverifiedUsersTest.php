<?php

use Tests\TestCase;
use App\Models\User;
use App\Console\Commands\CleanUnverifiedUsers;
use Illuminate\Support\Facades\Artisan;

class DeleteUnverifiedUsersTest extends TestCase
{
    public function test_delete_unverified_users()
    {
        $old_user = User::factory(['email_verified_at' => null, 'created_at' => now()->subDay(1)])->create();
        $actual_user = User::factory(['email_verified_at' => null, 'created_at' => now()->subHours(12)])->create();
        $actual_user2 = User::factory(['email_verified_at' => null, 'created_at' => now()])->create();
        Artisan::call("users:clean-unverified");
        $this->assertDatabaseMissing("users", ['id' => $old_user->id]);
        $this->assertDatabaseHas('users', ['id' => $actual_user->id]);
        $this->assertDatabaseHas('users', ['id' => $actual_user2->id]);
    }
}

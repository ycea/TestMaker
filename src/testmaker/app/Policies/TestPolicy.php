<?php

namespace App\Policies;

use App\Enums\TestStatusEnum;
use App\Enums\UserRoleEnum;
use App\Models\Test;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class TestPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewAny(User $user)
    {
        //
    }
    public function canViewAnswers(User $user, Test $test)
    {
        return $test->user_id == $user->id || $user->role == UserRoleEnum::Admin ||  $user->role == UserRoleEnum::Moderator;
    }
    /**
     * Determine whether the user can view the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Test  $test
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(?User $user, Test $test)
    {
        if ($user == null) {
            return TestStatusEnum::IsPublished == $test->status;
        }
        if ($test->status == TestStatusEnum::IsEdited) {
            return $test->user_id == $user->id;
        }
        if ($test->status == TestStatusEnum::IsPending) {
            return $test->user_id == $user->id || $user->role == UserRoleEnum::Admin ||  $user->role == UserRoleEnum::Moderator;
        }
        return true;
    }

    /**
     * Determine whether the user can create models.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function create(User $user)
    {
        return $user->checkBan();
    }

    /**
     * Determine whether the user can update the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Test  $test
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function update(User $user, Test $test)
    {
        return $user->id === $test->user_id && $user->checkBan();
    }
    /**
     * determines whether test can be published
     * @param \App\Models\User $user
     * @param \App\Models\Test $test
     * @return bool
     */
    public function publish(User $user, Test $test)
    {
        return ($test->status == TestStatusEnum::IsPending) && ($user->role == UserRoleEnum::Moderator || $user->role == UserRoleEnum::Admin);
    }
    /**
     * Determine whether the user can delete the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Test  $test
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function delete(User $user, Test $test)
    {
        return $user->id === $test->user_id && $user->checkBan() || $user->role == UserRoleEnum::Moderator || $user->role == UserRoleEnum::Admin;
    }

    /**
     * Determine whether the user can restore the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Test  $test
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function restore(User $user, Test $test)
    {
        //
    }

    /**
     * Determine whether the user can permanently delete the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Test  $test
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function forceDelete(User $user, Test $test)
    {
        //
    }
}

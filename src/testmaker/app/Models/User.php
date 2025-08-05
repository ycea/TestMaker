<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\UserRoleEnum;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Hash;
use App\Notifications\VerifyEmail;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;
    /**
     * Summary of favourites
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function favourites()
    {
        return $this->belongsToMany(Test::class, 'user_favourites');
    }
    public function assignRole($role)
    {
        $this->role = $role;
        $this->save();
    }
    public function sendEmailVerificationNotification()
    {
        $this->notify(new VerifyEmail());
    }
    public function checkBan()
    {
        if ($this->banned_until && $this->banned_until->lt(now())) {
            $this->banned_until = null;
            $this->save();
        }
        return  $this->banned_until == null;
    }
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'id',
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'registry_date' => 'date',
        'banned_until' => 'datetime',
    ];
    protected static function booted()
    {
        static::creating(function ($user) {
            $user->password = HASH::make($user->password);
            $user->registry_date = today()->format('Y-m-d');
            $user->role = UserRoleEnum::User;
        });
    }
    public function formatToPublicView()
    {
        return ['name' => $this->name, 'registry_date' => $this->registry_date, 'role' => $this->role, 'banned_until' => $this->banned_until];
    }
}

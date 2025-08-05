<?php

namespace App\Models;

use App\Enums\TestStatusEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Test extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'description',
        'created_id',
        'image_url',
        'test_content',
        'user_id',
    ];
    protected $casts = [
        'test_content' => 'array'
    ];
    protected $hidden = [
        'status'
    ];
    protected static function booted()
    {
        static::creating(function ($test) {
            if (empty($test->image_url)) {
                $test->image_url = '/storage/images/DefaultPicture.png';
            }
        });
    }
    public function owner()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function format($hide_answers = true, $load_questions = false, $is_favourite = false)
    {

        return [
            "test_data" => [
                "id" => $this->created_id,
                "description" => $this->description,
                'name' => $this->name,
                'image_href' => $this->image_url,
                'count_passed' => $this->count_passed
            ],
            "questions" => $load_questions ? $this->formatQuestions($hide_answers) : [],
            'status' => $this->status,
            'is_favourite' => $is_favourite,
            'owner_name' => $this->owner ? $this->owner->name : '',
        ];
    }
    private function formatQuestions($hide_answers)
    {
        $formatted_questions = array_map(function ($question) use ($hide_answers) {
            $filtered_content = array_map(function ($choice) use ($hide_answers) {
                if ($hide_answers) {
                    unset($choice['is_correct']);
                }
                return $choice;
            }, $question['content']);
            $question['content'] = $filtered_content;
            return $question;
        }, $this->test_content);
        return $formatted_questions;
    }
}

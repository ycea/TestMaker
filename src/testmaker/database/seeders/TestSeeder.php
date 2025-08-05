<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\CustomHelpers\TestHelper;
use App\Enums\TestStatusEnum;
use App\Models\Test;
use Illuminate\Support\Str;

class TestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        for ($i = 0; $i < 100; $i++) {
            $test = TestHelper::makeDefaultCorrectTest();
            Test::create([
                'name' => strval($i),
                'created_id' => $test['test_data']['id'],
                'description' => $test['test_data']['description'],
                'test_content' => $test['questions'],
                'status' => TestStatusEnum::IsPublished,
                'user_id' => 1
            ]);
        }
    }
}

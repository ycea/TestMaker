<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Test>
 */
class TestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'name' => $this->faker->sentence(3), // случайное название из 3 слов
            'description' => $this->faker->paragraph(2), // описание из 2 абзацев
            'image_url' => $this->faker->optional()->imageUrl(640, 480), // случайное изображение или null
            'rating' => $this->faker->randomFloat(2, 0, 10), // число с 2 знаками после запятой от 0 до 10
            'count_passed' => $this->faker->numberBetween(0, 1000),
            'test_content' => json_encode([]), // пустой json, можно заменить на любое содержимое
            'user_id' => User::factory(), // создаст связанного пользователя и подставит его id
            'created_id' => Str::uuid()
        ];
    }
}

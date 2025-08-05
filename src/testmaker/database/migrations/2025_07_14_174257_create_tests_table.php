<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\User;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tests', function (Blueprint $table) {
            $table->id();
            $table->string('name')->default('');
            $table->string('description')->default('');
            $table->string('image_url')->nullable();
            $table->enum('status', ['isEdited', 'isPending', 'isPublished'])->default("isPending");
            $table->decimal('rating', 4, 2)->default(0);
            $table->integer('count_passed')->default(0);
            $table->text('test_content');
            $table->uuid('created_id')->unique();
            $table->foreignIdFor(User::class)->nullable()->constrained()->onDelete("set null");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tests');
    }
};

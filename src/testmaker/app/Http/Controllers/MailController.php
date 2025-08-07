<?php

namespace App\Http\Controllers;

use App\Mail\FeedbackMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class MailController extends Controller
{
    public function sendFeedBack(Request $request)
    {
        $request->validate([
            "email" => "required|email",
            "name" => "required|regex:/^[a-zA-Z0-9]{4,}$/",
            "message" => "required|min:10",
        ]);
        $data = ['email' => $request->email, 'name' => $request->name, "message" => $request->message];

        Mail::to(env("FEEDBACK_MAIL"))->send(new FeedbackMail($data));
        return back()->with('success', 'Сообщение отправлено!');
    }
}

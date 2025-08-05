<?php

namespace App\Http\Controllers;

use App\Mail\FeedbackMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class MailController extends Controller
{
    public function sendFeedBack(Request $request)
    {
        $this->validate($request, [
            "email" => "required|email",
            "name" => "required|regex:/^[a-zA-Z0-9]{4,}$/"
        ]);
        $data = ['email' => $request->email, 'name' => $request->name, "message" => $request->message];

        Mail::to("rsavinov436@gmail.com")->send(new FeedbackMail($data));
        return back()->with('success', 'Сообщение отправлено!');
    }
}

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
        $secretKey = env("SITE_SECRET_KEY");
        $recaptchaToken = $request->input("g_recaptcha_response");

        $ch = curl_init("https://www.google.com/recaptcha/api/siteverify");
        curl_setopt($ch, CURLOPT_POST, true); // Метод POST
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
            'secret' => $secretKey,
            'response' => $recaptchaToken
        ]));

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // Чтобы получить результат как строку
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        $response = curl_exec($ch);
        curl_close($ch);
        $result = json_decode($response, true);
        if (isset($result) && $result['success']) {
            $data = ['email' => $request->email, 'name' => $request->name, "message" => $request->message];

            Mail::to(env("FEEDBACK_MAIL"))->send(new FeedbackMail($data));
            return back()->with('success', 'Сообщение отправлено!');
        }
        return response()->json(status: 401);
    }
}

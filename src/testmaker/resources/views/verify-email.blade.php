<!DOCTYPE html>
<html>

<head>
    <title>Подтверждение Email</title>
    <style>
        .btn {
            background-color: aquamarine;
            color: darkolivegreen;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            text-align: center;
        }

        .text-center {
            text-align: center;
        }

        .m-1 {
            margin: 1.4em;
        }

        .w-75 {
            width: 75%;
        }

        .mx-auto {
            margin-left: auto;
            margin-right: auto;
        }

        .p-1 {
            padding: 1.2em;
        }
    </style>
</head>

<body>
    <div class="w-75 mx-auto text-center p-1" style="background-color: azure">
        <h1 class="m-1">Подтверждение Email</h1>
        <hr />
        <p class="m-1">Здравствуйте!</p>

        <p>Пожалуйста, нажмите на кнопку ниже, чтобы подтвердить ваш email:</p>
        <a class="btn m-1" href="{{ $url }}">Подтвердить Email</a>

        <p class="m-1">Если вы не регистрировались, просто проигнорируйте это письмо.</p>

        <p class="m-1">Спасибо!</p>
    </div>
</body>

</html>
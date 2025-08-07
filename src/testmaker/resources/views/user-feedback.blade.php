<!DOCTYPE html>
<html>

<head>
    <title>Письмо от {{$data['name']}}</title>
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
        <h1 class="m-1">Письмо от: {{$data['name']}}</h1>
        <h4 class="m-1"> Адрес почты: {{ $data['email'] }}</h4>
        <hr />

        <p>{{ $data['message'] }}</p>

    </div>
</body>

</html>
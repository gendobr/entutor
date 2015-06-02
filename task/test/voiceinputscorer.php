<?php



$fIn = fopen('php://input', 'r');
$request_body = stream_get_contents($fIn);
fclose($fIn);

// формат пакета с данными:
// - параметры в формате JSON
// - пустая строка
// - бинарный файл в формате WAV
$tmp=explode("\n\n",$request_body,2);

// Входные параметры:
// "audioId" - уникальный идентификатор задания, используется для поиска эталона
// "audioString" - строка из слов, которые должен произнести студент, каждому отдельному слову надо выставить оценку
$parameters=json_decode($tmp[0], true);

// сохраняем звук (притворяемся, что обрабатываем)
//$fOut = fopen('uploads/sound.wav', 'w');
//fwrite($fOut, $tmp[1]);
//fclose($fOut);


// это заглушка 
// на самом деле сюда надо добавить правильный подсчёт правильности звука в целом
// и каждого слова отдельно
$reply=[];
$reply['audioId']= $parameters['audioId'];
$reply['audioString']= $parameters['audioString'];
$reply['score']= rand(0,100) * 0.01;
$reply['wordScores']=[];
$subscores=explode(' ',$reply['audioString']);
foreach($subscores as $word){
    $reply['wordScores'][$word]= rand(0,100) * 0.01;
}
echo json_encode($reply);
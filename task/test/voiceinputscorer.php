<?php


$SALT='kdsjlkajdo695bh';

//// сохраняем звук (притворяемся, что обрабатываем)
//$fOut = fopen('uploads/audio'.( (int)$_REQUEST['audioId'] ) .date('-Y-m-d-H-i-s').'.wav', 'w');
//fwrite($fOut, base64_decode($_REQUEST['wav']));
//fclose($fOut);

$until=strtotime($_REQUEST['until']);
$received_token=$_REQUEST['token'];
$control_token = md5(date('Y-m-d H:i',$until) .';'. $SALT);


// это заглушка 
// на самом деле сюда надо добавить правильный подсчёт правильности звука в целом
// и каждого слова отдельно
$reply=[];

$reply['access_allowed'] = (  $until<time() && $received_token==$control_token);
//$reply['access_until'] = (  $until );
//$reply['access_until_ok'] = (  $until<time() );
//$reply['access_received_token'] = (  $received_token );
//$reply['access_control_token'] = (  $control_token );
//$reply['access_token_ok'] = (  $received_token==$control_token );
$reply['audioId']= $_REQUEST['audioId'];
$reply['text']= $_REQUEST['text'];
$reply['score']= 0.6 + rand(0,100) * 0.001;
$reply['wordScores']=[];
$subscores=explode(' ',$reply['text']);
foreach($subscores as $word){
    $reply['wordScores'][$word]= 0.6 + rand(0,100) * 0.001;
}
echo json_encode($reply);
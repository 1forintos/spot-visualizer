<?php
	if(!isset($_POST['query'])) {
		exit;
	}
	$url = 'http://localhost:8080/spotvis';
	$data = array('query' => $_POST['query']);

	// use key 'http' even if you send the request to https://...
	$options = array(
	    'http' => array(
	        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
	        'method'  => 'POST',
	        'content' => http_build_query($data),
	    ),
	);
	$context  = stream_context_create($options);
	$result = file_get_contents($url, false, $context);

	echo $result;
?>
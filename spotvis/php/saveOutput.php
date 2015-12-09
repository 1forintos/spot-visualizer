<?php
	if(!isset($_POST['output'])) {
		exit;
	}
	$outputFile = fopen("result.statechart", "w") or die("Unable to open file!");
	fwrite($outputFile, $_POST['output']);
	fclose($outputFile);
	echo "success";
?>
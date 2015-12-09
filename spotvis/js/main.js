$(document).ready(function(){

  var btnSubmitStatement = $('#submit-statement').button();
  btnSubmitStatement.click(function(){
    submitStatement($('#input-statement').val());
  });

  var btnSubmitGraph = $('#submit-graph').button();
  btnSubmitGraph.click(function(){
    parseInput($('#input-graph').val());
  });

  var btnGenOutput = $('#generate-output').button();
  btnGenOutput.click(function(){
    generateOutput();
  });
});

function submitStatement(statement) {
  $.ajax({
    type: "POST",
    url: "php/script.php",
    data: {
      query: statement
    },
    success: function(result) {
      console.log(result);
      parseInput(result);
    }
  });
}

function generateOutput() {
  var edges = network.edgesHandler.body.edges;
  var nodes = network.nodesHandler.body.nodes;
  
  var output = 
"specification result {\n\tstatechart receiverMonitor := {\n\t\tregion main {\n";

  for(var i in nodes) {
    if(nodes[i].id == "I") {
      output += "\t\t\tinitial I\n";
    } else {
      output += "\t\t\tstate " + nodes[i].id +"\n";
    }
  }
  output += "\n";
  for(var i in edges) {
    output += "\t\t\ttransition from " + edges[i].from.id + " to " + edges[i].to.id + "\n";
  }

  output += "\t\t}\n\t}\n}";
  $.ajax({
    type: "POST",
    url: "php/saveOutput.php",
    data: {
      output: output
    },
    success: function(result) {
      if(result == "success") {
        window.open("php/download.php");
      }
    }
  });
}

function parseInput(inputGraph) {
  inputGraph = fixLogicaleOperands(inputGraph);
  var regexpForEdges = /. -> .( \[label=<.*\])?/g;
  var regexpForNodes = /. \[label=<.*\]?/g;
  var graphEdges = inputGraph.match(regexpForEdges);
  var nodes = [];
  var edges = [];
  for(var i in graphEdges) {
    inputGraph = inputGraph.replace(graphEdges[i], "");    
    var from = graphEdges[i].match(/. /).shift().trim();
    var to = graphEdges[i].match(/-> ./).shift().substr(3);
    //var edgeLabel = graphEdges[i].match(/\[label=".*"/).shift().substr(6, -1);
    var labelText = graphEdges[i].match(/label=<.*>/);
    var edgeLabel = "";
    if(labelText != null) {
      var tmp = graphEdges[i].match(/label=<.*>/).shift();
      edgeLabel = tmp.substring(7, tmp.length - 1);
    }
    edges.push({from: from, to: to, arrows: 'to', label: edgeLabel});
  }
  var graphNodes = inputGraph.match(regexpForNodes);
  nodes.push({id: "I", label: "Init"});
  for(var i in graphNodes) {
    inputGraph = inputGraph.replace(graphNodes[i], "");
    var label = graphNodes[i].match(/. /).shift().trim();
    nodes.push({id: label, label:  label});
  }  
  draw({nodes: nodes, edges: edges});
}

function fixLogicaleOperands(input) {
  var replacements = [
    {from: "&amp;", to: "&"}
  ];
  for(var i in replacements) {
    input = input.replace(replacements[i].from, replacements[i].to);
  }
  return input;
}

function destroy() {
  if (network !== null) {
    network.destroy();
    network = null;
  }
}

function draw(basicData) {
  network = null;  
  // create an array with nodes
  var nodes = new vis.DataSet([basicData.nodes]);

  // create an array with edges
  var edges = new vis.DataSet([basicData.edges]);

  var seed = 2;
  destroy();  
  var networkData = {nodes: nodes, edges: edges};

  // create a network
  var container = document.getElementById('mynetwork');
  var options = {
    "edges": {
      "smooth": {
        "type": "straightCross",
        "forceDirection": "none"
      }
    },
    layout: {randomSeed:seed}, // just to make sure the layout is the same when the locale is changed
    physics: {
      barnesHut: {
        gravitationalConstant: 0,
        centralGravity: 0, 
        springConstant: 0,
        avoidOverlap: 1
      }
    },
    manipulation: {
      addNode: function (data, callback) {
        // filling in the popup DOM elements
        document.getElementById('operation').innerHTML = "Add Node";
        document.getElementById('node-id').value = data.id;
        document.getElementById('node-label').value = data.label;
        document.getElementById('saveButton').onclick = saveData.bind(this, data, callback);
        document.getElementById('cancelButton').onclick = clearPopUp.bind();
        document.getElementById('network-popUp').style.display = 'block';
      },
      editNode: function (data, callback) {
        // filling in the popup DOM elements
        document.getElementById('operation').innerHTML = "Edit Node";
        document.getElementById('node-id').value = data.id;
        document.getElementById('node-label').value = data.label;
        document.getElementById('saveButton').onclick = saveData.bind(this, data, callback);
        document.getElementById('cancelButton').onclick = cancelEdit.bind(this,callback);
        document.getElementById('network-popUp').style.display = 'block';
      },
      addEdge: function (data, callback) {      
        document.getElementById('saveEdgeButton').onclick = saveEdgeData.bind(this, data, callback);
        document.getElementById('cancelEdgeButton').onclick = cancelEdgeEdit.bind(this,callback);
        document.getElementById('addEdge-popUp').style.display = "block";  
      }
    }
  };
  network = new vis.Network(container, basicData, options);
}

function clearPopUp() {
  document.getElementById('saveButton').onclick = null;
  document.getElementById('cancelButton').onclick = null;
  document.getElementById('network-popUp').style.display = 'none';
}

function clearEdgePopUp() {
  document.getElementById('saveEdgeButton').onclick = null;
  document.getElementById('cancelEdgeButton').onclick = null;
  document.getElementById('addEdge-popUp').style.display = 'none';
}

function cancelEdit(callback) {
  clearPopUp();
  callback(null);
}


function cancelEdgeEdit(callback) {
  clearEdgePopUp();
  callback(null);
}

function saveData(data,callback) {
  data.id = document.getElementById('node-id').value;
  data.label = document.getElementById('node-label').value;
  clearPopUp();
  callback(data);
}

function saveEdgeData(data, callback) {
  if (data.from == data.to) {
    var r = confirm("Do you want to connect the node to itself?");
    if (r != true) {
      return;
    }
  }
  data.label = document.getElementById('transaction-condition').value;
  data.arrows = "to";
  clearEdgePopUp();
  callback(data);
}
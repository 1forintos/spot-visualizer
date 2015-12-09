$(document).ready(function(){

  var btnSubmitStatement = $('#submit-statement').button();
  btnSubmitStatement.click(function(){
    submitStatement($('#input-statement').val());
  });

  var btnSubmitGraph = $('#submit-graph').button();
  btnSubmitGraph.click(function(){
    parseInput($('#input-graph').val());
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
      alert(result);
    }
  });
}

function generateOutput() {
  var edges = network.edgesHandler.body.edges;
  var nodes = network.nodesHandler.body.nodes;
  for(var i in edges) {
    console.log(edges[i]);
  }

  for(var i in nodes) {
    console.log(nodes[i]);
  }
}

function parseInput(inputGraph) {
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
  for(var i in graphNodes) {
    inputGraph = inputGraph.replace(graphNodes[i], "");
    var label = graphNodes[i].match(/. /).shift().trim();
    nodes.push({id: label, label:  label});
  }  
  draw({nodes: nodes, edges: edges});
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
  console.log(networkData);
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
        if (data.from == data.to) {
          var r = confirm("Do you want to connect the node to itself?");
          if (r == true) {
            callback(data);
          }
        }
        else {
          callback(data);
        }
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

function cancelEdit(callback) {
  clearPopUp();
  callback(null);
}

function saveData(data,callback) {
  data.id = document.getElementById('node-id').value;
  data.label = document.getElementById('node-label').value;
  clearPopUp();
  callback(data);
}
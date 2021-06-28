  var client;
  var CARESignalData = "";
  var CAREmyID = new Date().getTime();
  var CARReplyWaiting = false;
  var CARRongaudio = new Audio('js/ring.mp3');
  
  console.log("My window ID:" + CAREmyID);
  function sendMessage( messageinput) {
	  message = new Paho.MQTT.Message(messageinput);
      message.destinationName = "/Appointment/"+$('#roomid').val()+"/"+$('#name').val();     
      client.send(message);
	  return false;
  }
  
  $(document).ready(function() {
        function doSubscribe() {

        }

        $('#send').click(function(){
            var messageinput = $('#message');
            sendMessage(messageinput.val());
			messageinput.val('');
			messageinput.focus();
            return false;
        });


        function doDisconnect() {
            client.disconnect();
        }

        // Web Messaging API callbacks
        var onSuccess = function(value) {
            $('#status').toggleClass('connected',true);
            $('#status').text('Success');
			$("#send").prop('disabled', false);
        }

        var onConnect = function(frame) {
            $('#status').toggleClass('connected',true);
            $('#status').text('Connected');
			$('#status').hide();
			$("#send").prop('disabled', false);
            client.subscribe("/Appointment/"+$('#roomid').val()+"/#");
            //var form = document.getElementById("example");
            //form.connected.checked= true;
        }
        var onFailure = function(error) {
            $('#status').toggleClass('connected',false);
            $('#status').text("Failure");
			$('#status').show();
			$("#send").prop('disabled', true);
        }

        function onConnectionLost(responseObject) {
            //var form = document.getElementById("example");
            //form.connected.checked= false;
            //if (responseObject.errorCode !== 0)
            alert("Connection lost\n"+responseObject.errorCode);
        }

		var lastSender = "";
        function onMessageArrived(message) {
			var msg = message.payloadString;
			var name = message.destinationName.substring(message.destinationName.lastIndexOf("/")+1);
			var d = new Date();
			name = name + " [" + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) +"] "
			
			if(msg.indexOf("CAREsignalData") == 0) {
				if(msg.indexOf("CAREsignalData"+CAREmyID) != 0 ) { // if it is not my own data
					CARRongaudio.play();
					console.log("Playing ring tone-2");
					console.log(" Received signal data ..");
					CARESignalData = msg.substring(16+13);
					$('#messagelist').append('<li>'+'Got a call from '+name+', press <b>join</b> button</li>');
					$("#callBtn").hide();
					if( CARReplyWaiting ) {
						console.log("Stopping ring tone - 1");
						CARRongaudio.pause();CARRongaudio.currentTime = 0;
						$("#joinBtn").click();
					} else {
						$("#joinBtn").show();
					}
				}
			} else {

				if(lastSender == name) {
					$('#messagelist').append('<li>&emsp;&emsp;'+msg+'</li>');
				} 	else {
					$('#messagelist').append('<li><b>'+name+ ': </b><br/>&emsp;&emsp;' +msg+'</li>');
				}
				if(msg.indexOf("ECHO:") == 0) {
					sendMessage("Yes, I am online");
				}
				lastSender = name;
			}
				
			var d = $('#messagelist');
			d.scrollTop(d.prop("scrollHeight"));
        }
		
		function getURLParameter(sParam) {
			var sPageURL = window.location.search.substring(1);
				var sURLVariables = sPageURL.split('&');
				for (var i = 0; i < sURLVariables.length; i++) {
					var sParameterName = sURLVariables[i].split('=');
					if (sParameterName[0] == sParam) {
						return sParameterName[1];
					}
				}
				
				return null;
		}

        
        var r = Math.round(Math.random()*Math.pow(10,5));
        var d = new Date().getTime();
        var cid = r.toString() + "-" + d.toString()
		
		$("#send").prop('disabled', true);
		
		$('#start').click(function(){
			client = new Paho.MQTT.Client("demo.pas-care.com", 8081, cid );
			client.onConnect = onConnect;
			client.onMessageArrived = onMessageArrived;
			client.onConnectionLost = onConnectionLost;
			client.connect({useSSL: true, onSuccess: onConnect, onFailure: onFailure});
			$('#start').hide();
			$("#callBtn").show();
			$("#anyoneThere").show();
			AppWebTC.init();
		});
		
		


		
		$("#callBtn").hide();
		$("#joinBtn").hide();
		$("#hangBtn").hide();
		$("#anyoneThere").hide();
		$("#name").val(CAREmyID);
		
		var n = getURLParameter('name');
		var r = getURLParameter('appointmentID');
		console.log("Name = " + n + "appointmentID = " + r);
		if( n && r ) {
			$("#name").val(n);
			$("#roomid").val(r);
			$("#NameApp").hide();
			$('#start').click();
		}
		
    });

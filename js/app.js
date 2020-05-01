  var client;
  var CARESignalData = "";
  var CAREmyID = new Date().getTime();
  var CARReplyWaiting = false;
  
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
			$("#send").prop('disabled', false);
            client.subscribe("/Appointment/"+$('#roomid').val()+"/#");
            //var form = document.getElementById("example");
            //form.connected.checked= true;
        }
        var onFailure = function(error) {
            $('#status').toggleClass('connected',false);
            $('#status').text("Failure");
			$("#send").prop('disabled', true);
        }

        function onConnectionLost(responseObject) {
            //var form = document.getElementById("example");
            //form.connected.checked= false;
            //if (responseObject.errorCode !== 0)
            alert(client.clientId+"\n"+responseObject.errorCode);
        }

		var lastSender = "";
        function onMessageArrived(message) {
			var msg = message.payloadString;
			var name = message.destinationName.substring(message.destinationName.lastIndexOf("/")+1);
			if(msg.indexOf("CAREsignalData") == 0) {
				if(msg.indexOf("CAREsignalData"+CAREmyID) != 0 ) { // if it is not my own data
					console.log(" Received signal data ..");
					CARESignalData = msg.substring(16+13);
					$('#messagelist').append('<li>'+'Got a call from '+name+', press <b>join</b> button</li>');
					$("#callBtn").hide();
					if( CARReplyWaiting ) {
						$("#joinBtn").click();
					} else {
						$("#joinBtn").show();
					}
				}
			} else {

				if(lastSender == name) {
					$('#messagelist').append('<li>'+msg+'</li>');
				} 	else {
					$('#messagelist').append('<li><b>'+name+ ': </b><br/>' +msg+'</li>');
				}
				if(msg.indexOf("ECHO:") == 0) {
					sendMessage("Yes, I am online");
				}
				lastSender = name;
			}
				
			var d = $('#messagelist');
			d.scrollTop(d.prop("scrollHeight"));
        }

        
        var r = Math.round(Math.random()*Math.pow(10,5));
        var d = new Date().getTime();
        var cid = r.toString() + "-" + d.toString()
		
		$("#send").prop('disabled', true);
		
		$('#start').click(function(){
			client = new Paho.MQTT.Client("test.mosquitto.org", 8081, cid );
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
		
		var url = $(location).attr('href');
		if( url.indexOf("#") > -1 ) {
			var apid = url.substring(url.lastIndexOf("#")+1);
			$('#roomid').val(apid);
			$('#start').click();
		} 
		
		
		

    });

var AppWebTC = (function () {
	var servers = {
		"iceServers": [{
			url: 'stun:stun.l.google.com:19302'
		}]
	},

		signalData = { "desc": null, "ice": [] },
		peerConnection,
		localVideo = document.getElementById("localVideo"),
		localStream = null,
		remoteVideo = document.getElementById("remoteVideo"),
	



		getPeerConnection = function () {
			console.log("Inside getPeerConnection ..");
			peerConnection = new RTCPeerConnection(servers);
			peerConnection.onaddstream = gotRemoteStream;
			peerConnection.onicecandidate = gotIceCandidate;
			peerConnection.oniceconnectionstatechange = onConnectionStatusChange;
			peerConnection.onsignalingstatechange = (event) => { 
				console.log("Signaling change"); 
				//console.log(event);
			}
			console.log("Returned from getPeerConnection");
		},

		getMediaStream = function (callback) {
			console.log("Inside getMediaStream ..");
			navigator.mediaDevices.getUserMedia(
				{
					audio: true,
					video: true
				}).then(function (stream) {
					localStream = stream;
					callback(stream);
				}).catch(function (error) {
					console.log("getUserMedia error: ", error);
				});
			console.log("returned from getMediaStream ..");
		},

		joinSession = function () {
			if (peerConnection == null) {
				getPeerConnection();
			}
			getMediaStream(createAnswer);
			$("html, body").animate({ scrollTop: $(document).height() }, 1000);
		},

		createOffer = function (stream) {
			localVideo.srcObject = stream;
			peerConnection.addStream(stream);
			peerConnection.createOffer(onConnection, handleError);
		},

		initiateOffer = function () {
			console.log("Inside initiateOffer ..");
			if (peerConnection == null) {
				getPeerConnection();
			}
			getMediaStream(createOffer);
			$("#callBtn").hide();
			CARReplyWaiting = true;
			$("html, body").animate({ scrollTop: $(document).height() }, 1000);
		},

		onConnection = function (desc) {
			console.log("Inside On Connection");
			console.log("Description is " + desc.sdp);
			peerConnection.setLocalDescription(desc);
			signalData["desc"] = desc;
			console.log("Returned .. from onConnection");
		},

		createAnswer = function (stream) {
			console.log("Inside createAnswer ..");
			var sigdata = JSON.parse(CARESignalData);
			localVideo.srcObject = stream;
			peerConnection.addStream(stream);
			peerConnection.setRemoteDescription(new RTCSessionDescription(sigdata["desc"]), function () { console.log("Success"); }, handleError);
			peerConnection.createAnswer(sendReply, handleError);
			addIceCandidates(sigdata["ice"]);
			console.log("Returned from  createAnswer ..");
		},

		completeHandshake = function () {

			console.log("Inside complete handshake");
			var sigdata = document.getElementById("desc").value.trim();
			sigdata = JSON.parse(sigdata)
			if (!sigdata["desc"]) {
				alert("Please enter the answer");
				return;
			}
			peerConnection.setRemoteDescription(new RTCSessionDescription(sigdata["desc"]), function () { console.log("Success"); }, handleError);
			addIceCandidates(sigdata["ice"]);

		},

		sendReply = function (desc) {
			console.log("inside sendReply ..");
			peerConnection.setLocalDescription(desc);
			signalData["desc"] = desc;
			console.log("inside sendReply ..");
		},


		gotIceCandidate = function (event) {
			console.log("Inside gotIceCandidate ..");
			if (event.candidate) {
				signalData["ice"].push(event.candidate);
				var toSend = "CAREsignalData"+CAREmyID + ":     "+JSON.stringify(signalData);
				console.log("sent signalData ..");
				sendMessage(toSend);
			}
			console.log("returned from gotIceCandidate");
		},

		addIceCandidates = function (canArr) {
			for (var i in canArr) {
				peerConnection.addIceCandidate(new RTCIceCandidate(canArr[i]));
			}
		},

		handleError = function (err) {
			console.log("Error occured " + err);
		},


		closeCall = function () {
			/*peerConnection.close();
			localVideo.pause();
			remoteVideo.pause();
			localStream = null;
			peerConnection = null;
			$(localVideo).hide();
			$("#callBtn").show();
			$("#joinBtn").hide();
			$("#hangBtn").hide();*/
			
			location.reload();
		},

		onConnectionStatusChange = function (event) {
			switch (peerConnection.iceConnectionState) {
				case 'checking':
					console.log('Connecting to peer...');
					break;
				case 'connected': // on caller side
					console.log('Connection established.');
					$("#localVideo").show();
					$("#callBtn").hide();
					$("#joinBtn").hide();
					$("#hangBtn").show();
					break;
				case 'disconnected':
					console.log('Disconnected.');
					closeCall();
					break;
				case 'failed':
					console.log('Failed.');
					closeCall();
					break;
				case 'closed':
					console.log('Connection closed.');
					closeCall();
					break;
			}
		},

		gotRemoteStream = function (event) {
			console.log("Received remote stream");
			remoteVideo.srcObject = event.stream;
		},
		
		sendPing = function () {
			console.log("Inside ping ..");
			sendMessage("ECHO: Any one there ?");
		},
		
		init = function () {
			getPeerConnection();
			$("#callBtn").on("click", initiateOffer);
			$("#joinBtn").on("click", joinSession);
			$("#hangBtn").on("click", closeCall);
			$("#anyoneThere").on("click", sendPing);
		}

	return {
		init: init
	};

})();

"use strict";

window.onload = () => {
  const socket = io.connect();
  socket.binaryType = "arraybuffer";
  let naira = "500";
  let remoteId = null;
  let myId = null;
  sendBtn.style = "opacity: .4";
  sendBtn.style.pointerEvents = "none";
  let call = null;
  let filter = "none";
  let pay = null;

  const constraints = {
    audio: true,
    video: {
      frameRate: {
        ideal: 45,
        min: 15,
      },
      aspectRatio: 1.7777777778,
    },
  };

  const peer = new Peer(socket.id, {
    host: "vebbo.herokuapp.com",
    port: "",
    secure: true,
  });

  navigator.getUserMedia(constraints, onsuccess, onerror);

  function onsuccess(stream) {
    window.stream = stream;
    localVid.srcObject = stream;
    localVid.addEventListener("loadedmetadata", () => {
      localVid.play();
    });

    if (pay !== null && pay !== undefined) {
      filterList.disabled = false;
      filterList.style = "display: block;";
    }

    filterList.addEventListener("change", () => {
      filter = filterList.options[filterList.selectedIndex].dataset.rc;
      addFilter(localVid, filter);
      sendFilter(filter);
    });
  }

  filterBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (pay === null || pay === undefined) {
      loadModal("popup_guide");
      return;
    }

    filterList.disabled = false;
    filterList.style = "display: block;";
  });

  unlockBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (emailField.value === "") {
      return;
    }
    credit(emailField.value, naira);
  });

  function onerror(error) {
    console.log("navigator.getUserMedia error: ", error);
  }

  //========================== Functions =================================
  peer.on("open", (id) => {
    myId = id;
  });

  socket.on("online", (data) => {
    onlineCount.innerText = toComma(data);
  });

  socket.on("values", (data) => {
    naira = data.naira;
  });

  socket.on("info", (data) => {
    if (data !== "" && data !== null && data !== undefined) {
      showMsg(data);
    }
  });

  socket.on("comment", (data) => {
    typing.style = "display: none;";
    let li = document.createElement("li");
    addChat(data, li);
    commentList.scrollTop = commentList.scrollHeight;
  });

  function addChat(data, li) {
    if (data.comment !== null) {
      if (data.userId !== myId) {
        li.innerHTML = `<div class="comment_item">
                <label class="username">Stranger</label>
                <label class="content">${data.content}</label>
              </div>`;
      } else {
        li.innerHTML = `<div class="comment_item">
                <label class="username">You</label>
                <label class="content">${data.content}</label>
              </div>`;
      }

      commentList.appendChild(li);
    }
  }

  socket.on("typing", (data) => {
    if (data.userId !== myId && data.empty === false) {
      typing.style = "display: block;";
    } else {
      typing.style = "display: none;";
    }
  });

  sendBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (commentField.value !== null && commentField.value !== "") {
      const doc = {
        remoteId: remoteId,
        userId: myId,
        utc: new Date().toUTCString(),
        content: commentField.value,
      };

      socket.emit("comment", doc);
      commentField.value = null;
    }
  });

  commentField.addEventListener("keyup", (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      sendBtn.click();
    }
  });

  commentField.addEventListener("keypress", function () {
    const doc = {
      remoteId: remoteId,
      userId: myId,
      empty: false,
    };
    socket.emit("typing", doc);
  });

  commentField.addEventListener("keydown", function (event) {
    const key = event.key;
    if (key === "Backspace" || key === "Delete") {
      if (commentField.value.length === 1) {
        const doc = {
          remoteId: remoteId,
          userId: myId,
          empty: true,
        };
        socket.emit("typing", doc);
      }
    }
  });

  startStopBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (startStopBtn.innerText === "Start") {
      loadPeer();
      commentList.innerHTML = "";
      nextBtn.disabled = false;
      startStopBtn.innerText = "Stop";
    } else {
      leavePeer();
      stopStream();
      commentList.innerHTML = "";
      loading.style = "display: none;";
      nextBtn.disabled = true;
      commentField.disabled = true;
      startStopBtn.innerText = "Start";
      removePeer();
    }
  });

  nextBtn.addEventListener("click", (e) => {
    e.preventDefault();
    leavePeer();
    toNext();
  });

  socket.on("leave", (data) => {
    toNext();
  });

  function toNext() {
    commentList.innerHTML = "";
    commentField.disabled = true;
    stopStream();
    loadPeer();
  }

  function loadPeer() {
    loading.style = "display: block;";
    const doc = {
      userId: myId,
      socketId: socket.id,
    };
    socket.emit("peer", doc);
  }

  function removePeer() {
    const doc = {
      userId: myId,
      socketId: socket.id,
    };
    socket.emit("remove", doc);
  }

  socket.on("found", (data) => {
    if (data !== myId) {
      loading.style = "display: none;";
      commentField.disabled = false;
      sendBtn.style = "opacity: 1";
      sendBtn.style.pointerEvents = "auto";
      remoteId = data.socketId;

      // Send my stream
      call = peer.call(data.userId, window.stream);

      // Get remote stream
      call.on("stream", (remoteStream) => {
        remoteVid.srcObject = remoteStream;
        sendFilter(filter);
      });

      // close remote stream
      call.on("close", () => {
        remoteVid.srcObject = null;
      });

      // Answer Call
      peer.on("call", (call) => {
        call.answer(window.stream);
        call.on("stream", (remoteStream) => {
          remoteVid.srcObject = remoteStream;
          sendFilter(filter);
        });
      });
    }
  });

  socket.on("filter", (data) => {
    addFilter(remoteVid, data.filter);
  });

  function addFilter(vid, fil) {
    const filter_list = [
      "blur",
      "none",
      "grayscale",
      "sepia",
      "brightness",
      "contrast",
      "hue",
      "invert",
      "saturate",
    ];
    for (let item of filter_list) {
      vid.classList.remove(item);
    }
    vid.classList.add(fil);
  }

  function sendFilter(option) {
    if (remoteId !== null && remoteId !== undefined) {
      const doc = {
        remoteId: remoteId,
        userId: socket.id,
        peerId: myId,
        filter: option,
      };
      socket.emit("filter", doc);
    }
  }

  function stopStream() {
    typing.style = "display: none;";
    sendBtn.style = "opacity: .4";
    sendBtn.style.pointerEvents = "none";
    remoteId = null;
    if (call !== null && call !== undefined) {
      call.close();
      call == null;
    }
    if (remoteVid.srcObject !== null && remoteVid !== undefined) {
      remoteVid.srcObject = null;
    }
  }

  function credit(email, amt) {
    const handler = PaystackPop.setup({
      key: payHash(),
      email: email,
      amount: `${amt}00`,
      callback: (response) => {
        if (response.status == "success") {
          pay = response.trxref;
          filterList.disabled = false;
          filterList.style = "display: block;";
          clearModal();
        } else {
          showMsg("Something went wrong try again");
        }
      },
      onClose: function () {
        showMsg("Transaction cancelled");
      },
    });
    handler.openIframe();
  }

  function leavePeer() {
    const doc = {
      remoteId: remoteId,
      userId: myId,
    };
    socket.emit("leave", doc);
  }

  function terminate() {
    stopStream();
    socket.disconnect();
  }
};

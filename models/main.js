const Peer = [];

async function fetchPeer(data) {
  try {
    return new Promise(async (resolve, reject) => {
      if (Peer.length < 1) {
        Peer.push(data);
        reject("No match");
        return;
      }

      if (Peer[0].userId !== data.userId) {
        const top = Peer[0];
        Peer.shift();
        resolve(top);
        return;
      }
    });
  } catch (error) {
    console.log(error);
  }
}

async function removePeer(data) {
  try {
    return new Promise(async (resolve, reject) => {
      const index = Peer.findIndex((item) => item.userId === data.userId);

      if (index !== -1) {
        Peer.splice(index, 1);
      }
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  fetchPeer,
  removePeer,
};

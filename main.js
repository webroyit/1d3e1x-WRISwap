// Connect to Moralis server
Moralis.initialize("yOGw5F1DxY2eA9ByFSlvoze95s9woOjLcHzxgm9Y");
Moralis.serverURL = "https://okraypjofzst.usemoralis.com:2053/server"

async function init() {
  await Moralis.initPlugins();
  await Moralis.enable();
  await listAvailableTokens();
}

async function listAvailableTokens() {
  const tokens = await Moralis.Plugins.oneInch.getSupportedTokens({
    chain: 'eth', // The blockchain you want to use (eth/bsc/polygon)
  });
  console.log(tokens);
}

async function login() {
  let user = Moralis.User.current();
  if (!user) {
   try {
      user = await Moralis.authenticate({ signingMessage: "Hello World!" })
      console.log(user)
      console.log(user.get('ethAddress'))
   } catch(error) {
     console.log(error)
   }
  }
}

function openModal() {
  document.getElementById("token_modal").style.display = "block";
}

function closeModal() {
  document.getElementById("token_modal").style.display = "none";
}

init();

document.getElementById("from_token_select").onclick = openModal;
document.getElementById("modal_close").onclick = closeModal;
document.getElementById("login_button").onclick = login;
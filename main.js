// Connect to Moralis server
Moralis.initialize("yOGw5F1DxY2eA9ByFSlvoze95s9woOjLcHzxgm9Y");
Moralis.serverURL = "https://okraypjofzst.usemoralis.com:2053/server"

let currentTrade = {};
let currentSelectSide;
let tokens;

async function init() {
  await Moralis.initPlugins();
  await Moralis.enable();
  await listAvailableTokens();
}

async function listAvailableTokens() {
  const result = await Moralis.Plugins.oneInch.getSupportedTokens({
    chain: 'eth', // The blockchain you want to use (eth/bsc/polygon)
  });

  tokens = result.tokens;
  let parent = document.getElementById("token_list");

  // Create a list of tokens in HTML
  for(const address in tokens){
    let token = tokens[address];
    let div = document.createElement('div');    // Create div element
    div.setAttribute("data-address", address)   // Get the token address
    div.className = "token_row";                // Set the class name of the div element
    let html = `
      <img class="token_list_img" src="${token.logoURI}">
      <span class="token_list_text">${token.symbol}</span>
    `;

    div.innerHTML = html;
    div.onclick = selectToken;
    parent.appendChild(div);                    // Instead the list to the modal
  }
  console.log(result);
}

async function selectToken() {
  closeModal();
  let address = event.target.getAttribute("data-address");
  currentTrade[currentSelectSide] = tokens[address];
  console.log(currentTrade);
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

function openModal(side) {
  currentSelectSide = side;
  document.getElementById("token_modal").style.display = "block";
}

function closeModal() {
  document.getElementById("token_modal").style.display = "none";
}

init();

document.getElementById("from_token_select").onclick = () => {openModal("from")};
document.getElementById("modal_close").onclick = closeModal;
document.getElementById("login_button").onclick = login;
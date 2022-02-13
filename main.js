// Connect to Moralis server
Moralis.initialize("yOGw5F1DxY2eA9ByFSlvoze95s9woOjLcHzxgm9Y");
Moralis.serverURL = "https://okraypjofzst.usemoralis.com:2053/server"

let currentTrade = {};
let currentSelectSide;
let tokens;
let currentUser;

async function init() {
  await Moralis.initPlugins();
  await Moralis.enable();
  await listAvailableTokens();

  currentUser = Moralis.User.current();
  if(!currentUser){
    document.getElementById("swap_button").disabled = false;
  }
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
    div.onclick = (() => {selectToken(address)});
    parent.appendChild(div);                    // Instead the list to the modal
  }
  console.log(result);
}

function selectToken(address) {
  closeModal();
  currentTrade[currentSelectSide] = tokens[address];
  console.log(currentTrade);
  renderInterface();
  getQuote();
}

function renderInterface() {
  if(currentTrade.from){
    document.getElementById("from_token_img").src = currentTrade.from.logoURI;
    document.getElementById("from_token_text").innerHTML = currentTrade.from.symbol;
  } 
  if(currentTrade.to){
    document.getElementById("to_token_img").src = currentTrade.to.logoURI;
    document.getElementById("to_token_text").innerHTML = currentTrade.to.symbol;
  }
}

async function login() {
  try {
    currentUser = Moralis.User.current();
    if(!currentUser){
      currentUser = await Moralis.Web3.authenticate();
    }
    document.getElementById("swap_button").disabled = false;
  } catch(error) {
    console.log(error)
  }
}

function openModal(side) {
  currentSelectSide = side;
  document.getElementById("token_modal").style.display = "block";
}

function closeModal() {
  document.getElementById("token_modal").style.display = "none";
}

async function getQuote () {
  if(!currentTrade.from || !currentTrade.to || !document.getElementById("from_amount").value) return;

  let amount = Number(document.getElementById("from_amount").value * 10 ** currentTrade.from.decimals);

  // Get the price
  const quote = await Moralis.Plugins.oneInch.quote({
    chain: 'eth',
    fromTokenAddress: currentTrade.from.address,
    toTokenAddress: currentTrade.to.address,
    amount: amount 
  });

  console.log(quote);
  document.getElementById("gas_estimate").innerHTML = quote.estimatedGas;
  document.getElementById("to_amount").value = quote.toTokenAmount / (10 ** quote.toToken.decimals);
}

// Get token allowance and approve using 1Inch
async function trySwap() {
  let address = Moralis.User.current().get("ethAddress");
  let amount = Number(document.getElementById("from_amount").value * 10 ** currentTrade.from.decimals);
  
  if(currentTrade.from.symbol !== "ETH") {
    // Check Allowance
    // Return true or false
    const allowance = await Moralis.Plugins.oneInch.hasAllowance({
      chain: 'eth',
      fromTokenAddress: currentTrade.from.address,
      fromAddress: address,
      amount: amount 
    })

    console.log(allowance);
    if(!allowance) {
      // Approve token spend
      await Moralis.Plugins.oneInch.approve({
        chain: 'eth',
        tokenAddress: currentTrade.from.address,
        fromAddress: address
      })
    }
  }
  let receipt = await doSwap(address, amount);
  alert("Swap Finish")
}

// Swap tokens using 1Inch
function doSwap(userAddress, amount) {
  return Moralis.Plugins.oneInch.swap({
    chain: 'eth', // The blockchain you want to use (eth/bsc/polygon)
    fromTokenAddress: currentTrade.from.address, // The token you want to swap
    toTokenAddress: currentTrade.to.address, // The token you want to receive
    amount: amount,
    fromAddress: userAddress, // Your wallet address
    slippage: 1,
  });
}

init();

document.getElementById("from_token_select").onclick = () => {openModal("from")};
document.getElementById("to_token_select").onclick = () => {openModal("to")};
document.getElementById("modal_close").onclick = closeModal;
document.getElementById("login_button").onclick = login;
document.getElementById("from_amount").onblur = getQuote;
document.getElementById("swap_button").onclick = trySwap;
const abi = [
  "function owner() view returns (address)",
  "function totalShots() view returns (uint256)",
  "function totalGoals() view returns (uint256)",
  "function currentDay() view returns (uint256)",
  "function DAILY_SHOT_LIMIT() view returns (uint256)",
  "function dailyFanShots(address fan,uint256 day) view returns (uint256)",
  "function dailyFanPoints(address fan,uint256 day) view returns (uint256)",
  "function dailyFanGoals(address fan,uint256 day) view returns (uint256)",
  "function getFan(address fan) view returns (bytes32,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool)",
  "function getSquad(bytes32 squad) view returns (uint256,uint256,uint256,uint256,uint256,uint256)",
  "function playerCount() view returns (uint256)",
  "function players(uint256 index) view returns (address)",
  "function joinSquad(bytes32 squad)",
  "function takePenalty(uint8 shot)",
  "event PlayerRegistered(address indexed fan)",
  "event PenaltyTaken(uint256 indexed day,address indexed fan,bytes32 indexed squad,uint8 shot,uint8 keeper,bool goal,uint256 pointsAwarded,uint256 streak)",
];

// FIFA-qualified teams as of the 48-team list published for World Cup 2026.
const squads = [
  { code: "CAN", name: "Canada", iso: "CA", confed: "Host" },
  { code: "MEX", name: "Mexico", iso: "MX", confed: "Host" },
  { code: "USA", name: "United States", iso: "US", confed: "Host" },
  { code: "AUS", name: "Australia", iso: "AU", confed: "AFC" },
  { code: "IRQ", name: "Iraq", iso: "IQ", confed: "AFC" },
  { code: "IRN", name: "IR Iran", iso: "IR", confed: "AFC" },
  { code: "JPN", name: "Japan", iso: "JP", confed: "AFC" },
  { code: "JOR", name: "Jordan", iso: "JO", confed: "AFC" },
  { code: "KOR", name: "Korea Republic", iso: "KR", confed: "AFC" },
  { code: "QAT", name: "Qatar", iso: "QA", confed: "AFC" },
  { code: "KSA", name: "Saudi Arabia", iso: "SA", confed: "AFC" },
  { code: "UZB", name: "Uzbekistan", iso: "UZ", confed: "AFC" },
  { code: "ALG", name: "Algeria", iso: "DZ", confed: "CAF" },
  { code: "CPV", name: "Cabo Verde", iso: "CV", confed: "CAF" },
  { code: "COD", name: "Congo DR", iso: "CD", confed: "CAF" },
  { code: "CIV", name: "Cote d'Ivoire", iso: "CI", confed: "CAF" },
  { code: "EGY", name: "Egypt", iso: "EG", confed: "CAF" },
  { code: "GHA", name: "Ghana", iso: "GH", confed: "CAF" },
  { code: "MAR", name: "Morocco", iso: "MA", confed: "CAF" },
  { code: "SEN", name: "Senegal", iso: "SN", confed: "CAF" },
  { code: "RSA", name: "South Africa", iso: "ZA", confed: "CAF" },
  { code: "TUN", name: "Tunisia", iso: "TN", confed: "CAF" },
  { code: "CUW", name: "Curacao", iso: "CW", confed: "Concacaf" },
  { code: "HAI", name: "Haiti", iso: "HT", confed: "Concacaf" },
  { code: "PAN", name: "Panama", iso: "PA", confed: "Concacaf" },
  { code: "ARG", name: "Argentina", iso: "AR", confed: "CONMEBOL" },
  { code: "BRA", name: "Brazil", iso: "BR", confed: "CONMEBOL" },
  { code: "COL", name: "Colombia", iso: "CO", confed: "CONMEBOL" },
  { code: "ECU", name: "Ecuador", iso: "EC", confed: "CONMEBOL" },
  { code: "PAR", name: "Paraguay", iso: "PY", confed: "CONMEBOL" },
  { code: "URU", name: "Uruguay", iso: "UY", confed: "CONMEBOL" },
  { code: "NZL", name: "New Zealand", iso: "NZ", confed: "OFC" },
  { code: "AUT", name: "Austria", iso: "AT", confed: "UEFA" },
  { code: "BEL", name: "Belgium", iso: "BE", confed: "UEFA" },
  { code: "BIH", name: "Bosnia and Herzegovina", iso: "BA", confed: "UEFA" },
  { code: "CRO", name: "Croatia", iso: "HR", confed: "UEFA" },
  { code: "CZE", name: "Czechia", iso: "CZ", confed: "UEFA" },
  { code: "ENG", name: "England", iso: "GB", confed: "UEFA" },
  { code: "FRA", name: "France", iso: "FR", confed: "UEFA" },
  { code: "GER", name: "Germany", iso: "DE", confed: "UEFA" },
  { code: "NED", name: "Netherlands", iso: "NL", confed: "UEFA" },
  { code: "NOR", name: "Norway", iso: "NO", confed: "UEFA" },
  { code: "POR", name: "Portugal", iso: "PT", confed: "UEFA" },
  { code: "SCO", name: "Scotland", iso: "GB", confed: "UEFA" },
  { code: "ESP", name: "Spain", iso: "ES", confed: "UEFA" },
  { code: "SWE", name: "Sweden", iso: "SE", confed: "UEFA" },
  { code: "SUI", name: "Switzerland", iso: "CH", confed: "UEFA" },
  { code: "TUR", name: "Turkiye", iso: "TR", confed: "UEFA" },
];

const directions = ["Left", "Center", "Right"];

const state = {
  provider: null,
  signer: null,
  readProvider: null,
  readContract: null,
  contract: null,
  account: null,
  owner: null,
  isOwner: false,
  fan: null,
  squadStats: [],
  playerStats: [],
  totalShots: 0,
  totalGoals: 0,
  currentDay: 0,
  dailyShotLimit: 5,
  lastResult: null,
  matchReport: null,
  recentShots: [],
  oracleRequestId: 0,
  reportRequestId: 0,
  countdownTimer: null,
};

const config = window.XCUP_CONFIG;
let contractAddress = config.contractAddress || localStorage.getItem("penalty.contractAddress");

const elements = {
  connectWallet: document.querySelector("#connectWallet"),
  deployContract: document.querySelector("#deployContract"),
  networkName: document.querySelector("#networkName"),
  walletAddress: document.querySelector("#walletAddress"),
  walletButtonLabel: document.querySelector("#walletButtonLabel"),
  walletButtonHint: document.querySelector("#walletButtonHint"),
  contractStatus: document.querySelector("#contractStatus"),
  walletRole: document.querySelector("#walletRole"),
  txStatus: document.querySelector("#txStatus"),
  squadGrid: document.querySelector("#squadGrid"),
  passportFlag: document.querySelector("#passportFlag"),
  passportSquad: document.querySelector("#passportSquad"),
  passportPoints: document.querySelector("#passportPoints"),
  passportRecord: document.querySelector("#passportRecord"),
  shareProfile: document.querySelector("#shareProfile"),
  shotButtons: document.querySelectorAll(".shot-zone"),
  shotLimit: document.querySelector("#shotLimit"),
  practiceShot: document.querySelector("#practiceShot"),
  goalMouth: document.querySelector("#goalMouth"),
  keeper: document.querySelector("#keeper"),
  ball: document.querySelector("#ball"),
  resultBanner: document.querySelector("#resultBanner"),
  oracleCommentary: document.querySelector("#oracleCommentary"),
  oracleInsight: document.querySelector("#oracleInsight"),
  totalShotsMetric: document.querySelector("#totalShotsMetric"),
  totalGoalsMetric: document.querySelector("#totalGoalsMetric"),
  topSquadMetric: document.querySelector("#topSquadMetric"),
  topPlayerMetric: document.querySelector("#topPlayerMetric"),
  playerLeaderboard: document.querySelector("#playerLeaderboard"),
  leaderboard: document.querySelector("#leaderboard"),
  activityFeed: document.querySelector("#activityFeed"),
  resetCountdown: document.querySelector("#resetCountdown"),
  todayTopWallet: document.querySelector("#todayTopWallet"),
  todayTopSquad: document.querySelector("#todayTopSquad"),
  chaseTarget: document.querySelector("#chaseTarget"),
  shareReport: document.querySelector("#shareReport"),
  matchReportTitle: document.querySelector("#matchReportTitle"),
  matchReportBody: document.querySelector("#matchReportBody"),
  matchReportMeta: document.querySelector("#matchReportMeta"),
  contractLink: document.querySelector("#contractLink"),
};

function shortAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function explorerTxUrl(hash) {
  return `https://www.okx.com/web3/explorer/xlayer/tx/${hash}`;
}

function explorerAddressUrl(address) {
  return `https://www.okx.com/web3/explorer/xlayer/address/${address}`;
}

function squadBytes(code) {
  return ethers.encodeBytes32String(code);
}

function parseSquadCode(value) {
  if (!value || value === ethers.ZeroHash) return "";
  try {
    return ethers.decodeBytes32String(value);
  } catch {
    return "";
  }
}

function flagFromIso(iso) {
  return [...iso.toUpperCase()].map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0))).join("");
}

function setContractStatus() {
  elements.contractStatus.textContent = contractAddress ? shortAddress(contractAddress) : "Not deployed";
  elements.deployContract.hidden = Boolean(contractAddress);
  elements.contractLink.href = contractAddress ? explorerAddressUrl(contractAddress) : "#";
}

function setWalletButton(connected = false) {
  elements.connectWallet.dataset.connected = connected ? "true" : "false";
  elements.walletButtonLabel.textContent = connected ? "Disconnect" : "Connect wallet";
  elements.walletButtonHint.textContent = connected && state.account ? shortAddress(state.account) : "OKX or any EVM wallet";
}

async function getReadContract() {
  if (state.contract) return state.contract;
  if (state.readContract) return state.readContract;
  if (!contractAddress) return null;

  const chain = config.chains[config.preferredChainId];
  for (const rpcUrl of chain.rpcUrls) {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl, config.preferredChainId, { staticNetwork: true });
      const contract = new ethers.Contract(contractAddress, abi, provider);
      await contract.totalShots();
      state.readProvider = provider;
      state.readContract = contract;
      return contract;
    } catch {
      state.readProvider = null;
      state.readContract = null;
    }
  }
  return null;
}

function setStatus(message, tone = "neutral", txHash = "") {
  elements.txStatus.replaceChildren();
  elements.txStatus.textContent = message;
  elements.txStatus.dataset.tone = tone;
  if (txHash) {
    elements.txStatus.textContent = `${message} `;
    const link = document.createElement("a");
    link.href = explorerTxUrl(txHash);
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = "View tx";
    elements.txStatus.append(link);
  }
}

function updateResetCountdown() {
  const now = Date.now();
  const nextUtcMidnight = new Date(now);
  nextUtcMidnight.setUTCHours(24, 0, 0, 0);
  const remaining = Math.max(0, nextUtcMidnight.getTime() - now);
  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  elements.resetCountdown.textContent = `UTC reset in ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

async function transact(label, txFactory, afterReceipt, afterRefresh) {
  try {
    setStatus(`${label}: waiting for wallet confirmation...`);
    const tx = await txFactory();
    setStatus(`${label}: submitted ${shortAddress(tx.hash)}`, "neutral", tx.hash);
    const receipt = await tx.wait();
    if (afterReceipt) afterReceipt(receipt);
    setStatus(`${label}: confirmed`, "success", receipt.hash);
    await refreshAll();
    if (afterRefresh) afterRefresh(receipt);
  } catch (error) {
    const reason = error?.shortMessage || error?.reason || error?.message || "Transaction failed";
    elements.goalMouth.dataset.phase = "idle";
    clearSelectedShot();
    setStatus(reason, "error");
  }
}

async function ensureXLayer() {
  const chain = config.chains[config.preferredChainId];
  const current = await window.ethereum.request({ method: "eth_chainId" });
  if (current === chain.chainIdHex) return;

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chain.chainIdHex }],
    });
  } catch (error) {
    if (error.code !== 4902) throw error;
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [chain],
    });
  }
}

async function connectWallet() {
  if (!window.ethereum) {
    alert("Install OKX Wallet or another EVM wallet to continue.");
    return;
  }

  await ensureXLayer();
  await window.ethereum.request({ method: "eth_requestAccounts" });
  state.provider = new ethers.BrowserProvider(window.ethereum);
  state.signer = await state.provider.getSigner();
  state.account = await state.signer.getAddress();

  const network = await state.provider.getNetwork();
  const chain = config.chains[Number(network.chainId)];
  elements.networkName.textContent = chain?.chainName || `Chain ${network.chainId}`;
  elements.walletAddress.textContent = shortAddress(state.account);
  setWalletButton(true);

  if (contractAddress) await bindContract(contractAddress);
  await refreshAll();
}

async function restoreWalletSession() {
  if (!window.ethereum) return false;

  try {
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    if (!accounts?.length) return false;

    const chain = config.chains[config.preferredChainId];
    const current = await window.ethereum.request({ method: "eth_chainId" });
    if (current !== chain.chainIdHex) {
      setStatus("Wallet is authorized. Click Connect wallet to switch back to X Layer.", "neutral");
      return false;
    }

    state.provider = new ethers.BrowserProvider(window.ethereum);
    state.signer = await state.provider.getSigner();
    state.account = await state.signer.getAddress();

    const network = await state.provider.getNetwork();
    const networkConfig = config.chains[Number(network.chainId)];
    elements.networkName.textContent = networkConfig?.chainName || `Chain ${network.chainId}`;
    elements.walletAddress.textContent = shortAddress(state.account);
    setWalletButton(true);

    if (contractAddress) await bindContract(contractAddress);
    await refreshAll();
    return true;
  } catch {
    return false;
  }
}

async function disconnectWallet(showStatus = true) {
  state.provider = null;
  state.signer = null;
  state.contract = null;
  state.account = null;
  state.owner = null;
  state.isOwner = false;
  state.fan = null;
  elements.networkName.textContent = config.chains[config.preferredChainId]?.chainName || "X Layer";
  elements.walletAddress.textContent = "-";
  elements.walletRole.textContent = "Viewer";
  setWalletButton(false);
  renderFanProfile();
  renderShotState();
  if (showStatus) {
    setStatus("Wallet disconnected.", "success");
  }
}

async function bindContract(address) {
  state.readContract = null;
  state.contract = new ethers.Contract(address, abi, state.signer);
  state.owner = await state.contract.owner();
  state.isOwner = state.owner.toLowerCase() === state.account.toLowerCase();
  contractAddress = address;
  config.contractAddress = address;
  localStorage.setItem("penalty.contractAddress", address);
  elements.contractStatus.textContent = shortAddress(address);
  elements.deployContract.hidden = true;
  elements.walletRole.textContent = state.isOwner ? "Deployer admin" : "Fan";
  setContractStatus();
}

async function refreshAll() {
  await loadGlobalStats();
  await loadFanProfile();
  await loadSquads();
  await loadPlayers();
  await loadRecentShots();
  renderShotState();
}

async function loadGlobalStats() {
  const contract = await getReadContract();
  if (!contract) {
    setStatus("Unable to read X Layer right now. Connect wallet or refresh in a moment.", "error");
    return;
  }
  state.totalShots = Number(await contract.totalShots());
  state.totalGoals = Number(await contract.totalGoals());
  state.currentDay = Number(await contract.currentDay());
  try {
    state.dailyShotLimit = Number(await contract.DAILY_SHOT_LIMIT());
  } catch {
    state.dailyShotLimit = 5;
  }
  elements.totalShotsMetric.textContent = String(state.totalShots);
  elements.totalGoalsMetric.textContent = String(state.totalGoals);
}

async function loadFanProfile() {
  if (!state.contract || !state.account) {
    state.fan = null;
    renderFanProfile();
    return;
  }
    const profile = await state.contract.getFan(state.account);
  let todayShots = 0;
  try {
    todayShots = Number(await state.contract.dailyFanShots(state.account, state.currentDay));
  } catch {
    todayShots = profile[7] >= state.currentDay && Number(profile[2]) > 0 ? 1 : 0;
  }
  state.fan = {
    squad: parseSquadCode(profile[0]),
    points: Number(profile[1]),
    shots: Number(profile[2]),
    goals: Number(profile[3]),
    saves: Number(profile[4]),
    streak: Number(profile[5]),
    bestStreak: Number(profile[6]),
    lastShotDay: Number(profile[7]),
    todayShots,
    exists: profile[8],
  };
  renderFanProfile();
}

async function readDailyPlayerStats(contract, address) {
  let todayShots = 0;
  let todayPoints = 0;
  let todayGoals = 0;
  try {
    todayShots = Number(await contract.dailyFanShots(address, state.currentDay));
  } catch {
    todayShots = 0;
  }
  try {
    todayPoints = Number(await contract.dailyFanPoints(address, state.currentDay));
  } catch {
    todayPoints = 0;
  }
  try {
    todayGoals = Number(await contract.dailyFanGoals(address, state.currentDay));
  } catch {
    todayGoals = 0;
  }
  return { todayShots, todayPoints, todayGoals };
}

async function loadSquads() {
  const contract = await getReadContract();
  if (!contract) {
    state.squadStats = squads.map((squad) => ({ ...squad, points: 0, members: 0, shots: 0, goals: 0, saves: 0, todayPoints: 0 }));
    renderSquads();
    renderLeaderboard();
    return;
  }

  state.squadStats = await Promise.all(
    squads.map(async (squad) => {
      const stats = await contract.getSquad(squadBytes(squad.code));
      return {
        ...squad,
        points: Number(stats[0]),
        members: Number(stats[1]),
        shots: Number(stats[2]),
        goals: Number(stats[3]),
        saves: Number(stats[4]),
        todayPoints: Number(stats[5]),
      };
    })
  );
  renderSquads();
  renderLeaderboard();
  renderTodayRace();
}

async function loadPlayers() {
  const contract = await getReadContract();
  if (!contract) {
    state.playerStats = [];
    renderPlayerLeaderboard();
    return;
  }

  try {
    const count = Number(await contract.playerCount());
    const addresses = await Promise.all(
      Array.from({ length: count }, (_, index) => contract.players(index))
    );
    const uniqueAddresses = [...new Set(addresses.map((address) => address.toLowerCase()))];

    state.playerStats = await Promise.all(
      uniqueAddresses.map(async (address) => {
        const checksumAddress = ethers.getAddress(address);
        const profile = await contract.getFan(checksumAddress);
        const squadCode = parseSquadCode(profile[0]);
        const squad = squads.find((item) => item.code === squadCode);
        const daily = await readDailyPlayerStats(contract, checksumAddress);

        return {
          address: checksumAddress,
          squadCode,
          squadName: squad?.name || squadCode || "Unassigned",
          flag: squad ? flagFromIso(squad.iso) : "",
          points: Number(profile[1]),
          shots: Number(profile[2]),
          goals: Number(profile[3]),
          saves: Number(profile[4]),
          streak: Number(profile[5]),
          bestStreak: Number(profile[6]),
          todayShots: daily.todayShots,
          todayPoints: daily.todayPoints,
          todayGoals: daily.todayGoals,
        };
      })
    );
  } catch {
    state.playerStats = [];
  }

  renderPlayerLeaderboard();
  renderTodayRace();
}

async function loadRecentShots() {
  const contract = await getReadContract();
  if (!contract || !contract.queryFilter) {
    state.recentShots = [];
    renderActivityFeed();
    return;
  }

  try {
    const provider = state.readProvider || state.provider || contract.runner?.provider;
    const latest = provider ? await provider.getBlockNumber() : "latest";
    const fromBlock = typeof latest === "number" ? Math.max(0, latest - 12000) : 0;
    const events = await contract.queryFilter(contract.filters.PenaltyTaken(), fromBlock, "latest");
    state.recentShots = events
      .slice(-8)
      .reverse()
      .map((event) => {
        const squadCode = parseSquadCode(event.args.squad);
        const squad = squads.find((item) => item.code === squadCode);
        return {
          blockNumber: event.blockNumber,
          hash: event.transactionHash,
          fan: event.args.fan,
          squadCode,
          squadName: squad?.name || squadCode,
          flag: squad ? flagFromIso(squad.iso) : "",
          shot: directions[Number(event.args.shot)],
          keeper: directions[Number(event.args.keeper)],
          goal: Boolean(event.args.goal),
          points: Number(event.args.pointsAwarded),
          streak: Number(event.args.streak),
        };
      });
  } catch {
    state.recentShots = [];
  }

  renderActivityFeed();
}

function renderFanProfile() {
  const fan = state.fan;
  const squad = squads.find((item) => item.code === fan?.squad);
  elements.passportFlag.textContent = squad ? flagFromIso(squad.iso) : "◇";
  elements.passportSquad.textContent = squad ? `${squad.name} Squad` : "No squad selected";
  elements.passportPoints.textContent = `${fan?.points || 0} pts`;
  elements.passportRecord.textContent = `${fan?.shots || 0} shots · ${fan?.goals || 0} goals · ${fan?.streak || 0} streak`;
  elements.shareProfile.disabled = !fan?.squad;
}

function renderSquads() {
  elements.squadGrid.replaceChildren();
  const selected = state.fan?.squad || "";
  for (const squad of squads) {
    const stats = state.squadStats.find((item) => item.code === squad.code) || squad;
    const button = document.createElement("button");
    button.className = "squad-button";
    button.type = "button";
    button.dataset.selected = selected === squad.code ? "true" : "false";
    button.innerHTML = `
      <span>${flagFromIso(squad.iso)}</span>
      <strong>${squad.name}</strong>
      <small>${stats.points || 0} pts · ${stats.goals || 0} goals · ${squad.confed}</small>
    `;
    button.addEventListener("click", async () => {
      if (!state.contract) {
        setStatus("Connect wallet first, then choose your squad.", "error");
        return;
      }
      await transact("Squad join", () => state.contract.joinSquad(squadBytes(squad.code)));
    });
    elements.squadGrid.append(button);
  }
}

function renderPlayerLeaderboard() {
  const ranked = [...state.playerStats].sort(
    (a, b) => b.points - a.points || b.goals - a.goals || b.bestStreak - a.bestStreak || a.address.localeCompare(b.address)
  );
  elements.playerLeaderboard.replaceChildren();
  elements.topPlayerMetric.textContent = ranked[0]?.points ? `${shortAddress(ranked[0].address)} (${ranked[0].points})` : "Awaiting players";

  if (!ranked.length) {
    const empty = document.createElement("div");
    empty.className = "leaderboard-row player-row empty";
    empty.textContent = "No registered wallets yet on this contract. Join a squad to enter the player leaderboard.";
    elements.playerLeaderboard.append(empty);
    return;
  }

  for (const [index, player] of ranked.entries()) {
    const row = document.createElement("a");
    row.className = "leaderboard-row player-row";
    row.href = explorerAddressUrl(player.address);
    row.target = "_blank";
    row.rel = "noreferrer";
    row.innerHTML = `
      <span>${index + 1}</span>
      <b>${player.flag}</b>
      <strong>${shortAddress(player.address)}</strong>
      <small>${player.points} pts</small>
      <small>${player.goals}/${player.shots} goals</small>
      <small>${player.todayPoints} today</small>
      <small>${player.bestStreak} best</small>
    `;
    elements.playerLeaderboard.append(row);
  }
}

function rankedPlayersToday() {
  return [...state.playerStats]
    .filter((player) => player.todayShots > 0 || player.todayPoints > 0)
    .sort((a, b) => b.todayPoints - a.todayPoints || b.todayGoals - a.todayGoals || b.points - a.points || a.address.localeCompare(b.address));
}

function rankedSquadsToday() {
  return [...state.squadStats]
    .filter((squad) => squad.todayPoints > 0 || squad.shots > 0)
    .sort((a, b) => b.todayPoints - a.todayPoints || b.points - a.points || a.name.localeCompare(b.name));
}

function getPlayerRank(address, mode = "allTime") {
  if (!address) return null;
  const ranked =
    mode === "today"
      ? rankedPlayersToday()
      : [...state.playerStats].sort((a, b) => b.points - a.points || b.goals - a.goals || b.bestStreak - a.bestStreak || a.address.localeCompare(b.address));
  const index = ranked.findIndex((player) => player.address.toLowerCase() === address.toLowerCase());
  return index >= 0 ? index + 1 : null;
}

function renderTodayRace() {
  const topPlayers = rankedPlayersToday();
  const topSquads = rankedSquadsToday();
  const topPlayer = topPlayers[0];
  const topSquad = topSquads[0];

  elements.todayTopWallet.textContent = topPlayer ? `${shortAddress(topPlayer.address)} - ${topPlayer.todayPoints} pts` : "Awaiting shots";
  elements.todayTopSquad.textContent = topSquad ? `${flagFromIso(topSquad.iso)} ${topSquad.name} - ${topSquad.todayPoints} pts` : "Awaiting shots";

  if (!state.account || !state.fan?.squad) {
    elements.chaseTarget.textContent = "Join a squad and take a shot to enter today's race.";
    return;
  }

  const me = state.playerStats.find((player) => player.address.toLowerCase() === state.account.toLowerCase());
  if (!topPlayer || !me?.todayShots) {
    elements.chaseTarget.textContent = "Your first real shot today will put your wallet on the daily board.";
    return;
  }

  const todayRank = getPlayerRank(state.account, "today");
  const gap = Math.max(0, topPlayer.todayPoints - me.todayPoints);
  elements.chaseTarget.textContent =
    todayRank === 1
      ? `You are #1 today with ${me.todayPoints} points. Defend the spot before the UTC reset.`
      : `You are #${todayRank || "-"} today with ${me.todayPoints} points. ${gap} points behind the daily leader.`;
}

function renderLeaderboard() {
  const ranked = [...state.squadStats].sort((a, b) => b.points - a.points || b.goals - a.goals || a.name.localeCompare(b.name));
  elements.leaderboard.replaceChildren();
  elements.topSquadMetric.textContent = ranked[0]?.points ? `${ranked[0].name} (${ranked[0].points})` : "Awaiting shots";

  for (const [index, squad] of ranked.entries()) {
    const row = document.createElement("div");
    row.className = "leaderboard-row";
    row.innerHTML = `
      <span>${index + 1}</span>
      <b>${flagFromIso(squad.iso)}</b>
      <strong>${squad.name}</strong>
      <small>${squad.points} pts</small>
      <small>${squad.goals}/${squad.shots} goals</small>
      <small>${squad.todayPoints} today</small>
    `;
    elements.leaderboard.append(row);
  }
  renderOracleCommentary(ranked);
  renderOracleInsight(ranked);
}

function renderOracleInsight(ranked) {
  const active = ranked.filter((squad) => squad.shots > 0 || squad.members > 0);
  if (!active.length) {
    elements.oracleInsight.textContent = "Insight: no live squad pattern yet. The first few penalties will teach the Oracle where momentum is forming.";
    return;
  }

  const leader = active[0];
  const mostEfficient = [...active].sort((a, b) => {
    const aRate = a.shots ? a.goals / a.shots : 0;
    const bRate = b.shots ? b.goals / b.shots : 0;
    return bRate - aRate || b.points - a.points;
  })[0];
  const conversion = mostEfficient.shots ? Math.round((mostEfficient.goals / mostEfficient.shots) * 100) : 0;

  if (leader.todayPoints > 0) {
    elements.oracleInsight.textContent = `Insight: ${leader.name} has today's strongest pressure with ${leader.todayPoints} fresh points. ${mostEfficient.name} is converting ${conversion}% of shots.`;
    return;
  }

  elements.oracleInsight.textContent = `Insight: ${leader.name} leads overall, but today's table is open. One goal streak can flip the arena quickly.`;
}

function renderActivityFeed() {
  elements.activityFeed.replaceChildren();

  if (!state.recentShots.length) {
    const empty = document.createElement("div");
    empty.className = "activity-row empty";
    empty.textContent = "No on-chain penalties indexed yet. Take the first shot or use Practice Mode to test the flow.";
    elements.activityFeed.append(empty);
    return;
  }

  for (const item of state.recentShots) {
    const row = document.createElement("a");
    row.className = "activity-row";
    row.href = explorerTxUrl(item.hash);
    row.target = "_blank";
    row.rel = "noreferrer";
    row.innerHTML = `
      <span>${item.flag}</span>
      <strong>${item.goal ? "Goal" : "Saved"}</strong>
      <small>${item.squadName} · ${shortAddress(item.fan)} · ${item.shot} vs ${item.keeper}</small>
      <b>+${item.points}</b>
    `;
    elements.activityFeed.append(row);
  }
}

function clearSelectedShot() {
  for (const button of elements.shotButtons) {
    button.dataset.selected = "false";
  }
}

function setResultBanner(message, result = "") {
  elements.resultBanner.textContent = message;
  if (result) {
    elements.resultBanner.dataset.result = result;
  } else {
    delete elements.resultBanner.dataset.result;
  }
}

function resetArenaVisuals() {
  elements.goalMouth.dataset.phase = "idle";
  delete elements.goalMouth.dataset.result;
  delete elements.ball.dataset.shot;
  elements.keeper.dataset.dive = "1";
  clearSelectedShot();
  setResultBanner(elements.resultBanner.textContent);
}

function renderPenaltyResult(result) {
  if (!result) return;
  elements.goalMouth.dataset.phase = "result";
  elements.goalMouth.dataset.result = result.goal ? "goal" : "save";
  elements.ball.dataset.shot = String(result.shotIndex);
  elements.keeper.dataset.dive = String(result.keeperIndex);
  clearSelectedShot();

  const message = result.goal
    ? `Goal. You shot ${result.shot}, the keeper dived ${result.keeper}. +${result.points} points recorded on X Layer.`
    : `Saved. You shot ${result.shot}, the keeper dived ${result.keeper}. +${result.points} grit points recorded on X Layer.`;
  setResultBanner(message, result.goal ? "goal" : "save");
}

function buildMatchReportText(result) {
  if (!result) return null;
  const rank = state.account ? getPlayerRank(state.account) : null;
  const todayRank = state.account ? getPlayerRank(state.account, "today") : null;
  const fan = state.fan;
  const rankText = rank ? `Wallet rank #${rank}` : "Wallet rank pending";
  const todayText = todayRank ? `today #${todayRank}` : "today board pending";
  const streakText = fan?.streak ? `${fan.streak} streak` : "streak reset";
  const proofText = result.hash ? `Proof: ${shortAddress(result.hash)}` : "Practice report";

  return {
    title: result.goal ? "Oracle report: goal" : "Oracle report: saved",
    body: result.goal
      ? `${result.squad} scores on XKick. Shot ${result.shot}, keeper ${result.keeper}. +${result.points} points, ${streakText}, ${rankText}, ${todayText}.`
      : `${result.squad} is denied on XKick. Shot ${result.shot}, keeper ${result.keeper}. +${result.points} grit points, ${rankText}, ${todayText}.`,
    meta: proofText,
    shareText: `I just ${result.goal ? "scored" : "took"} a World Cup AI penalty for ${result.squad} on XKick. +${result.points} pts. ${rankText}. Built on @XLayerOfficial.`,
  };
}

function renderMatchReport(report) {
  state.matchReport = report;
  if (!report) {
    elements.matchReportTitle.textContent = "No shot report yet";
    elements.matchReportBody.textContent = "Take a real penalty and the Oracle Agent will turn it into a shareable match report.";
    elements.matchReportMeta.textContent = "Reports include your squad, result, streak, wallet rank, and X Layer proof.";
    elements.shareReport.disabled = true;
    return;
  }

  elements.matchReportTitle.textContent = report.title;
  elements.matchReportBody.textContent = report.body;
  elements.matchReportMeta.textContent = report.meta;
  elements.shareReport.disabled = !report.shareText;
}

async function requestMatchReport(result) {
  const fallbackReport = buildMatchReportText(result);
  renderMatchReport(fallbackReport);
  if (!result?.hash) return;

  const requestId = ++state.reportRequestId;
  const ranked = [...state.squadStats].sort((a, b) => b.points - a.points);
  const body = {
    purpose: "report",
    totalShots: state.totalShots,
    totalGoals: state.totalGoals,
    leader: ranked[0] || null,
    chaser: ranked[1] || null,
    lastResult: result,
    player: {
      address: state.account,
      rank: state.account ? getPlayerRank(state.account) : null,
      todayRank: state.account ? getPlayerRank(state.account, "today") : null,
      points: state.fan?.points || 0,
      streak: state.fan?.streak || 0,
    },
  };

  try {
    const response = await fetch("/api/oracle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) return;
    const data = await response.json();
    if (requestId !== state.reportRequestId || !data.commentary) return;
    renderMatchReport({
      ...fallbackReport,
      body: data.commentary,
      shareText: `${data.commentary} Play XKick on X Layer: ${location.origin} @XLayerOfficial`,
    });
  } catch {
    // Keep deterministic report.
  }
}

function renderShotState() {
  const fan = state.fan;
  const todayShots = fan?.todayShots || 0;
  const shotsRemaining = Math.max(0, state.dailyShotLimit - todayShots);
  const limitReached = todayShots >= state.dailyShotLimit;
  for (const button of elements.shotButtons) {
    button.disabled = !state.contract || !fan?.squad || limitReached;
  }

  if (!state.account) {
    elements.shotLimit.textContent = "Connect to shoot";
    resetArenaVisuals();
    setResultBanner(`Connect wallet, pick a squad, then take up to ${state.dailyShotLimit} penalties today. Every shot is one transaction.`);
  } else if (!fan?.squad) {
    elements.shotLimit.textContent = "Pick squad first";
    resetArenaVisuals();
    setResultBanner("Choose a country squad before facing the AI keeper.");
  } else if (limitReached) {
    elements.shotLimit.textContent = `${todayShots}/${state.dailyShotLimit} used today`;
    if (!state.lastResult) resetArenaVisuals();
    setResultBanner("Daily penalty limit reached. Come back tomorrow for five more shots.");
  } else {
    elements.shotLimit.textContent = `${todayShots}/${state.dailyShotLimit} used today`;
    if (!state.lastResult) {
      resetArenaVisuals();
      setResultBanner(`${shotsRemaining} shot${shotsRemaining === 1 ? "" : "s"} left today. Pick a corner; that kick will open one wallet transaction.`);
    }
  }
}

function renderOracleCommentary(ranked) {
  let fallbackText;
  if (state.lastResult) {
    const { squad, shot, keeper, goal, points } = state.lastResult;
    fallbackText = goal
      ? `${squad} steps up and fires ${shot}. The AI keeper dives ${keeper}. Goal. +${points} points on X Layer.`
      : `${squad} goes ${shot}, but the AI keeper reads ${keeper}. Saved. The crowd still earns grit points.`;
    elements.oracleCommentary.textContent = fallbackText;
    requestOracleCommentary(ranked, fallbackText);
    return;
  }

  const active = ranked.filter((squad) => squad.shots > 0 || squad.members > 0);
  if (!active.length) {
    fallbackText = "Waiting for the first penalty. The AI keeper is watching squad momentum.";
    elements.oracleCommentary.textContent = fallbackText;
    return;
  }

  const leader = active[0];
  const chaser = active[1];
  if (!chaser) {
    fallbackText = `${leader.name} Squad owns the spot right now with ${leader.points} points and ${leader.goals} goals.`;
    elements.oracleCommentary.textContent = fallbackText;
    requestOracleCommentary(ranked, fallbackText);
    return;
  }

  const gap = leader.points - chaser.points;
  fallbackText =
    gap === 0
      ? `${leader.name} and ${chaser.name} are level. One clean penalty can flip the table.`
      : `${leader.name} leads ${chaser.name} by ${gap} points. ${chaser.name} needs a brave taker.`;
  elements.oracleCommentary.textContent = fallbackText;
  requestOracleCommentary(ranked, fallbackText);
}

async function requestOracleCommentary(ranked, fallbackText) {
  const requestId = ++state.oracleRequestId;
  const active = ranked.filter((squad) => squad.shots > 0 || squad.members > 0);
  const body = {
    totalShots: state.totalShots,
    totalGoals: state.totalGoals,
    leader: active[0] || null,
    chaser: active[1] || null,
    lastResult: state.lastResult,
    fallbackText,
  };

  try {
    const response = await fetch("/api/oracle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) return;
    const data = await response.json();
    if (requestId === state.oracleRequestId && data.commentary) {
      elements.oracleCommentary.textContent = data.commentary;
    }
  } catch {
    // Keep deterministic commentary.
  }
}

function parsePenaltyReceipt(receipt) {
  const iface = new ethers.Interface(abi);
  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed?.name !== "PenaltyTaken") continue;
      const squadCode = parseSquadCode(parsed.args.squad);
      const squad = squads.find((item) => item.code === squadCode);
      return {
        fan: parsed.args.fan,
        squadCode,
        squad: squad?.name || squadCode,
        shot: directions[Number(parsed.args.shot)],
        keeper: directions[Number(parsed.args.keeper)],
        shotIndex: Number(parsed.args.shot),
        keeperIndex: Number(parsed.args.keeper),
        goal: parsed.args.goal,
        points: Number(parsed.args.pointsAwarded),
        streak: Number(parsed.args.streak),
        hash: receipt.hash,
      };
    } catch {
      // Ignore logs from other contracts.
    }
  }
  return null;
}

async function takeShot(direction) {
  if (!state.contract) {
    setStatus("Connect wallet first.", "error");
    return;
  }
  if (!state.fan?.squad) {
    setStatus("Choose your country squad before shooting.", "error");
    return;
  }

  state.lastResult = null;
  clearSelectedShot();
  const selected = [...elements.shotButtons].find((button) => Number(button.dataset.shot) === direction);
  if (selected) selected.dataset.selected = "true";
  elements.goalMouth.dataset.phase = "pending";
  delete elements.goalMouth.dataset.result;
  delete elements.resultBanner.dataset.result;
  elements.ball.dataset.shot = String(direction);
  elements.keeper.dataset.dive = "1";
  setResultBanner(`${directions[direction]} selected. Confirm this one-shot transaction in your wallet.`);

  await transact(
    "Penalty shot",
    () => state.contract.takePenalty(direction),
    (receipt) => {
      state.lastResult = parsePenaltyReceipt(receipt);
    },
    () => {
      renderPenaltyResult(state.lastResult);
      requestMatchReport(state.lastResult);
    }
  );
}

function practiceShot() {
  const shot = Math.floor(Math.random() * 3);
  const keeper = Math.floor(Math.random() * 3);
  const goal = shot !== keeper;
  const squad = squads.find((item) => item.code === state.fan?.squad) || squads[Math.floor(Math.random() * squads.length)];

  state.lastResult = {
    squad: squad.name,
    shot: directions[shot],
    keeper: directions[keeper],
    shotIndex: shot,
    keeperIndex: keeper,
    goal,
    points: goal ? 115 : 15,
  };
  renderPenaltyResult(state.lastResult);
  renderMatchReport(buildMatchReportText(state.lastResult));
  renderOracleCommentary([...state.squadStats].sort((a, b) => b.points - a.points));
  setStatus("Practice Mode result is off-chain. Connect and shoot to record a real X Layer penalty.", "success");
}

elements.connectWallet.addEventListener("click", async () => {
  if (state.account) {
    await disconnectWallet();
    return;
  }
  await connectWallet();
});

elements.deployContract.addEventListener("click", async () => {
  if (!state.signer) await connectWallet();
  if (!state.signer) return;

  try {
    if (!window.XCUP_ARTIFACT?.bytecode) {
      setStatus("Missing contract bytecode artifact.", "error");
      return;
    }
    setStatus("Contract deployment: waiting for wallet confirmation...");
    const factory = new ethers.ContractFactory(abi, window.XCUP_ARTIFACT.bytecode, state.signer);
    const contract = await factory.deploy();
    const tx = contract.deploymentTransaction();
    setStatus(`Contract deployment: submitted ${shortAddress(tx.hash)}`);
    await contract.waitForDeployment();
    const address = await contract.getAddress();
    await bindContract(address);
    setStatus(`Contract deployed at ${address}. This connected wallet is the owner.`, "success");
    await refreshAll();
  } catch (error) {
    const reason = error?.shortMessage || error?.reason || error?.message || "Deployment failed";
    setStatus(reason, "error");
  }
});

for (const button of elements.shotButtons) {
  button.addEventListener("click", async () => {
    await takeShot(Number(button.dataset.shot));
  });
}

elements.practiceShot.addEventListener("click", practiceShot);

elements.shareProfile.addEventListener("click", () => {
  const fan = state.fan;
  if (!fan?.squad) return;
  const squad = squads.find((item) => item.code === fan.squad);
  const text = `I joined ${squad?.name || fan.squad} Squad on XKick: ${fan.points} pts, ${fan.goals}/${fan.shots} goals, ${fan.streak} streak. Built on @XLayerOfficial.`;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(location.href)}`;
  window.open(url, "_blank", "noopener,noreferrer");
});

elements.shareReport.addEventListener("click", () => {
  if (!state.matchReport?.shareText) return;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(state.matchReport.shareText)}&url=${encodeURIComponent(location.href)}`;
  window.open(url, "_blank", "noopener,noreferrer");
});

if (window.ethereum?.on) {
  window.ethereum.on("accountsChanged", async (accounts) => {
    if (!accounts?.length) {
      await disconnectWallet(false);
      setStatus("Wallet access was removed.", "neutral");
      return;
    }
    await restoreWalletSession();
  });

  window.ethereum.on("chainChanged", () => {
    window.location.reload();
  });
}

async function initApp() {
  setContractStatus();
  setWalletButton(false);
  renderFanProfile();
  renderMatchReport(null);
  updateResetCountdown();
  state.countdownTimer = window.setInterval(updateResetCountdown, 1000);
  const restored = await restoreWalletSession();
  if (!restored) await refreshAll();
}

initApp();

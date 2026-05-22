const abi = [
  "function owner() view returns (address)",
  "function totalShots() view returns (uint256)",
  "function totalGoals() view returns (uint256)",
  "function currentDay() view returns (uint256)",
  "function getFan(address fan) view returns (bytes32,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool)",
  "function getSquad(bytes32 squad) view returns (uint256,uint256,uint256,uint256,uint256,uint256)",
  "function joinSquad(bytes32 squad)",
  "function takePenalty(uint8 shot)",
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
  totalShots: 0,
  totalGoals: 0,
  currentDay: 0,
  lastResult: null,
  recentShots: [],
  oracleRequestId: 0,
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
  keeper: document.querySelector("#keeper"),
  resultBanner: document.querySelector("#resultBanner"),
  oracleCommentary: document.querySelector("#oracleCommentary"),
  oracleInsight: document.querySelector("#oracleInsight"),
  totalShotsMetric: document.querySelector("#totalShotsMetric"),
  totalGoalsMetric: document.querySelector("#totalGoalsMetric"),
  topSquadMetric: document.querySelector("#topSquadMetric"),
  leaderboard: document.querySelector("#leaderboard"),
  activityFeed: document.querySelector("#activityFeed"),
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

async function transact(label, txFactory, afterReceipt) {
  try {
    setStatus(`${label}: waiting for wallet confirmation...`);
    const tx = await txFactory();
    setStatus(`${label}: submitted ${shortAddress(tx.hash)}`, "neutral", tx.hash);
    const receipt = await tx.wait();
    if (afterReceipt) afterReceipt(receipt);
    setStatus(`${label}: confirmed`, "success", receipt.hash);
    await refreshAll();
  } catch (error) {
    const reason = error?.shortMessage || error?.reason || error?.message || "Transaction failed";
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
    setStatus("Wallet disconnected in this app. Revoke site access in your wallet for a full provider disconnect.", "success");
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
  state.fan = {
    squad: parseSquadCode(profile[0]),
    points: Number(profile[1]),
    shots: Number(profile[2]),
    goals: Number(profile[3]),
    saves: Number(profile[4]),
    streak: Number(profile[5]),
    bestStreak: Number(profile[6]),
    lastShotDay: Number(profile[7]),
    exists: profile[8],
  };
  renderFanProfile();
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

function renderShotState() {
  const fan = state.fan;
  const alreadyShot = Boolean(fan?.shots) && fan.lastShotDay >= state.currentDay;
  for (const button of elements.shotButtons) {
    button.disabled = !state.contract || !fan?.squad || alreadyShot;
  }

  if (!state.account) {
    elements.shotLimit.textContent = "Connect to shoot";
    elements.resultBanner.textContent = "Connect wallet, pick a squad, then take your daily penalty.";
  } else if (!fan?.squad) {
    elements.shotLimit.textContent = "Pick squad first";
    elements.resultBanner.textContent = "Choose a country squad before facing the AI keeper.";
  } else if (alreadyShot) {
    elements.shotLimit.textContent = "Shot used today";
    elements.resultBanner.textContent = "Daily shot used. Come back tomorrow for another penalty.";
  } else {
    elements.shotLimit.textContent = "Shot available";
    elements.resultBanner.textContent = "Aim left, center, or right. The AI keeper is ready.";
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
        squad: squad?.name || squadCode,
        shot: directions[Number(parsed.args.shot)],
        keeper: directions[Number(parsed.args.keeper)],
        goal: parsed.args.goal,
        points: Number(parsed.args.pointsAwarded),
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

  elements.keeper.dataset.dive = String(direction);
  await transact(
    "Penalty",
    () => state.contract.takePenalty(direction),
    (receipt) => {
      state.lastResult = parsePenaltyReceipt(receipt);
    }
  );
}

function practiceShot() {
  const shot = Math.floor(Math.random() * 3);
  const keeper = Math.floor(Math.random() * 3);
  const goal = shot !== keeper;
  const squad = squads.find((item) => item.code === state.fan?.squad) || squads[Math.floor(Math.random() * squads.length)];

  elements.keeper.dataset.dive = String(keeper);
  state.lastResult = {
    squad: squad.name,
    shot: directions[shot],
    keeper: directions[keeper],
    goal,
    points: goal ? 115 : 15,
  };
  elements.resultBanner.textContent = goal
    ? `Practice goal: ${squad.name} fires ${directions[shot]}, keeper dives ${directions[keeper]}.`
    : `Practice save: keeper reads ${directions[shot]} and blocks it.`;
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
  const restored = await restoreWalletSession();
  if (!restored) await refreshAll();
}

initApp();

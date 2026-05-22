// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract XCupOracleArena {
    enum Direction {
        Left,
        Center,
        Right
    }

    struct Fan {
        bytes32 squad;
        uint256 points;
        uint256 shots;
        uint256 goals;
        uint256 saves;
        uint256 streak;
        uint256 bestStreak;
        uint256 lastShotDay;
        bool exists;
    }

    struct Squad {
        uint256 points;
        uint256 members;
        uint256 shots;
        uint256 goals;
        uint256 saves;
        uint256 todayPoints;
    }

    address public owner;
    uint256 public totalShots;
    uint256 public totalGoals;

    mapping(address => Fan) public fans;
    mapping(bytes32 => Squad) public squads;
    mapping(bytes32 => bool) public squadSeen;
    mapping(uint256 => mapping(bytes32 => uint256)) public dailySquadPoints;
    bytes32[] public squadCodes;

    event OwnershipTransferred(address indexed previousOwner, address indexed nextOwner);
    event SquadJoined(address indexed fan, bytes32 indexed squad, bytes32 indexed previousSquad);
    event PenaltyTaken(
        uint256 indexed day,
        address indexed fan,
        bytes32 indexed squad,
        Direction shot,
        Direction keeper,
        bool goal,
        uint256 pointsAwarded,
        uint256 streak
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    function transferOwnership(address nextOwner) external onlyOwner {
        require(nextOwner != address(0), "zero owner");
        emit OwnershipTransferred(owner, nextOwner);
        owner = nextOwner;
    }

    function currentDay() public view returns (uint256) {
        return block.timestamp / 1 days;
    }

    function joinSquad(bytes32 squad) external {
        require(squad != bytes32(0), "missing squad");

        Fan storage fan = fans[msg.sender];
        bytes32 previousSquad = fan.squad;
        require(previousSquad != squad, "already joined");

        if (previousSquad != bytes32(0)) {
            squads[previousSquad].members -= 1;
        }

        if (!squadSeen[squad]) {
            squadSeen[squad] = true;
            squadCodes.push(squad);
        }

        fan.squad = squad;
        fan.exists = true;
        squads[squad].members += 1;

        emit SquadJoined(msg.sender, squad, previousSquad);
    }

    function takePenalty(Direction shot) external {
        require(uint8(shot) <= uint8(Direction.Right), "bad shot");

        Fan storage fan = fans[msg.sender];
        require(fan.squad != bytes32(0), "join squad first");

        uint256 day = currentDay();
        require(fan.shots == 0 || fan.lastShotDay < day, "already shot today");

        Direction keeper = keeperDive(msg.sender, fan.squad, day, fan.shots);
        bool goal = shot != keeper;
        uint256 pointsAwarded;

        fan.lastShotDay = day;
        fan.shots += 1;
        totalShots += 1;

        Squad storage squad = squads[fan.squad];
        squad.shots += 1;

        if (goal) {
            fan.goals += 1;
            fan.streak += 1;
            if (fan.streak > fan.bestStreak) {
                fan.bestStreak = fan.streak;
            }
            squad.goals += 1;
            totalGoals += 1;
            pointsAwarded = 100 + (fan.streak * 15);
        } else {
            fan.saves += 1;
            fan.streak = 0;
            squad.saves += 1;
            pointsAwarded = 15;
        }

        fan.points += pointsAwarded;
        squad.points += pointsAwarded;
        squad.todayPoints += pointsAwarded;
        dailySquadPoints[day][fan.squad] += pointsAwarded;

        emit PenaltyTaken(day, msg.sender, fan.squad, shot, keeper, goal, pointsAwarded, fan.streak);
    }

    function keeperDive(
        address fan,
        bytes32 squad,
        uint256 day,
        uint256 fanShots
    ) public view returns (Direction) {
        bytes32 seed = keccak256(
            abi.encodePacked(block.prevrandao, blockhash(block.number - 1), fan, squad, day, fanShots, totalShots)
        );
        return Direction(uint8(uint256(seed) % 3));
    }

    function getFan(address fan)
        external
        view
        returns (
            bytes32 squad,
            uint256 points,
            uint256 shots,
            uint256 goals,
            uint256 saves,
            uint256 streak,
            uint256 bestStreak,
            uint256 lastShotDay,
            bool exists
        )
    {
        Fan storage profile = fans[fan];
        return (
            profile.squad,
            profile.points,
            profile.shots,
            profile.goals,
            profile.saves,
            profile.streak,
            profile.bestStreak,
            profile.lastShotDay,
            profile.exists
        );
    }

    function getSquad(bytes32 squad)
        external
        view
        returns (
            uint256 points,
            uint256 members,
            uint256 shots,
            uint256 goals,
            uint256 saves,
            uint256 todayPoints
        )
    {
        Squad storage item = squads[squad];
        return (item.points, item.members, item.shots, item.goals, item.saves, dailySquadPoints[currentDay()][squad]);
    }

    function squadCodeCount() external view returns (uint256) {
        return squadCodes.length;
    }
}

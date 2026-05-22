// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {XCupOracleArena} from "../contracts/XCupOracleArena.sol";

interface Vm {
    function expectRevert(bytes calldata revertData) external;
    function prank(address sender) external;
    function warp(uint256 timestamp) external;
}

contract XCupOracleArenaTest {
    Vm internal constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    XCupOracleArena internal arena;
    address internal fan = address(0xBEEF);
    address internal stranger = address(0xCAFE);
    bytes32 internal constant BRAZIL = bytes32("BRA");
    bytes32 internal constant MOROCCO = bytes32("MAR");

    function setUp() public {
        arena = new XCupOracleArena();
    }

    function testDeployerIsOwner() public view {
        require(arena.owner() == address(this), "owner mismatch");
    }

    function testFanCanJoinAndSwitchSquad() public {
        vm.prank(fan);
        arena.joinSquad(BRAZIL);

        vm.prank(fan);
        arena.joinSquad(MOROCCO);

        (bytes32 squad, , , , , , , , bool exists) = arena.getFan(fan);
        (, uint256 brazilMembers, , , , ) = arena.getSquad(BRAZIL);
        (, uint256 moroccoMembers, , , , ) = arena.getSquad(MOROCCO);

        require(squad == MOROCCO, "bad squad");
        require(exists, "missing fan");
        require(brazilMembers == 0, "brazil member not removed");
        require(moroccoMembers == 1, "morocco member not added");
    }

    function testCannotShootBeforeJoiningSquad() public {
        vm.prank(fan);
        vm.expectRevert(bytes("join squad first"));
        arena.takePenalty(XCupOracleArena.Direction.Left);
    }

    function testCanTakeFivePenaltiesPerDay() public {
        vm.prank(fan);
        arena.joinSquad(BRAZIL);

        for (uint256 i = 0; i < arena.DAILY_SHOT_LIMIT(); i++) {
            vm.prank(fan);
            arena.takePenalty(XCupOracleArena.Direction(uint8(i % 3)));
        }

        vm.prank(fan);
        vm.expectRevert(bytes("daily shot limit reached"));
        arena.takePenalty(XCupOracleArena.Direction.Right);

        vm.warp(block.timestamp + 1 days);
        vm.prank(fan);
        arena.takePenalty(XCupOracleArena.Direction.Right);

        (, , uint256 shots, , , , , , ) = arena.getFan(fan);
        require(shots == arena.DAILY_SHOT_LIMIT() + 1, "bad shots");
        require(arena.dailyFanShots(fan, block.timestamp / 1 days) == 1, "bad new day shots");
    }

    function testPenaltyUpdatesFanAndSquadStats() public {
        vm.prank(fan);
        arena.joinSquad(BRAZIL);

        vm.prank(fan);
        arena.takePenalty(XCupOracleArena.Direction.Center);

        (, uint256 points, uint256 shots, uint256 goals, uint256 saves, , , uint256 lastShotDay, ) = arena.getFan(fan);
        (uint256 squadPoints, uint256 members, uint256 squadShots, uint256 squadGoals, uint256 squadSaves, uint256 todayPoints) =
            arena.getSquad(BRAZIL);

        require(points > 0, "no points");
        require(shots == 1, "bad fan shots");
        require(goals + saves == 1, "bad fan result");
        require(lastShotDay == block.timestamp / 1 days, "bad day");
        require(squadPoints == points, "bad squad points");
        require(members == 1, "bad members");
        require(squadShots == 1, "bad squad shots");
        require(squadGoals + squadSaves == 1, "bad squad result");
        require(todayPoints == points, "bad today points");
        require(arena.totalShots() == 1, "bad total shots");
    }

    function testOnlyOwnerCanTransferOwnership() public {
        vm.prank(stranger);
        vm.expectRevert(bytes("not owner"));
        arena.transferOwnership(stranger);

        arena.transferOwnership(stranger);
        require(arena.owner() == stranger, "owner not transferred");
    }
}

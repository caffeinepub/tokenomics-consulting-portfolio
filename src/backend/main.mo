import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import UserApproval "user-approval/approval";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Text "mo:core/Text";



actor {
  include MixinStorage();

  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type VestingCliff = {
    cliffPeriod : Nat;
    cliffPercentage : Float;
  };

  type VestingStep = {
    stepPeriod : Nat;
    stepFrequency : Nat;
    stepPercentage : Float;
  };

  type Schedule = {
    id : Text;
    isTokenLock : Bool;
    lockPeriod : Nat;
    numChunks : Nat;
    chunkSize : Nat;
    cliff : VestingCliff;
    step : VestingStep;
  };

  type Recipient = {
    id : Text;
    name : Text;
    allocationPercentage : Float;
    schedule : Schedule;
  };

  type SavedSession = {
    id : Text;
    sessionName : Text;
    totalSupply : Nat;
    decimals : Nat;
    enableInflation : Bool;
    inflationStartYear : Nat;
    inflationRate : Float;
    recipients : [Recipient];
    timestamp : Int;
  };

  type VestingSchedule = {
    name : Text;
    vestingType : { #cliffLinear; #graded };
    totalTokens : Nat;
    tokenPrice : Float;
    cliffPeriod : Nat;
    vestingDuration : Nat;
    startDate : Int;
    admin : Principal;
  };

  type UserProfile = {
    name : Text;
  };

  let sessions = Map.empty<Text, SavedSession>();
  let vestingSchedules = Map.empty<Text, VestingSchedule>();
  let approvalState = UserApproval.initState(accessControlState);
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile functions — accessible to users with #user role
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Approval functions
  public query ({ caller }) func isCallerApproved() : async Bool {
    UserApproval.isApproved(approvalState, caller) or AccessControl.hasPermission(accessControlState, caller, #admin);
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };

  public query ({ caller }) func listApprovalsForCurrentUser() : async [UserApproval.UserApprovalInfo] {
    let allApprovals = UserApproval.listApprovals(approvalState);
    allApprovals.filter(
      func(approval) {
        approval.principal == caller;
      }
    );
  };

  // Session functions — accessible to approved users and admins
  public shared ({ caller }) func saveSession(session : SavedSession) : async () {
    if (not (UserApproval.isApproved(approvalState, caller) or AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only approved users can perform this action");
    };
    if (sessions.containsKey(session.id)) {
      Runtime.trap("Session with this ID already exists");
    };
    sessions.add(session.id, session);
  };

  public query ({ caller }) func getSession(id : Text) : async SavedSession {
    if (not (UserApproval.isApproved(approvalState, caller) or AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only approved users can perform this action");
    };
    switch (sessions.get(id)) {
      case (null) { Runtime.trap("Session not found") };
      case (?session) { session };
    };
  };

  public query ({ caller }) func getAllSessions() : async [SavedSession] {
    if (not (UserApproval.isApproved(approvalState, caller) or AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only approved users can perform this action");
    };
    sessions.values().toArray();
  };

  // Vesting schedule functions
  public shared ({ caller }) func saveVestingSchedule(schedule : VestingSchedule) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can save vesting schedules");
    };
    vestingSchedules.add(schedule.name, schedule);
  };

  public query ({ caller }) func getVestingSchedule(name : Text) : async VestingSchedule {
    if (not (UserApproval.isApproved(approvalState, caller) or AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only approved users can perform this action");
    };
    switch (vestingSchedules.get(name)) {
      case (null) { Runtime.trap("Vesting schedule not found") };
      case (?schedule) { schedule };
    };
  };

  public query ({ caller }) func getAllVestingSchedules() : async [VestingSchedule] {
    if (not (UserApproval.isApproved(approvalState, caller) or AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only approved users can perform this action");
    };
    vestingSchedules.values().toArray();
  };

  public shared ({ caller }) func deleteVestingSchedule(name : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete vesting schedules");
    };
    if (not vestingSchedules.containsKey(name)) {
      Runtime.trap("Vesting schedule not found");
    };
    vestingSchedules.remove(name);
  };
};

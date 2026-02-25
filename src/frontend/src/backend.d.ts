import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface VestingStep {
    stepPeriod: bigint;
    stepPercentage: number;
    stepFrequency: bigint;
}
export interface VestingCliff {
    cliffPeriod: bigint;
    cliffPercentage: number;
}
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface SavedSession {
    id: string;
    decimals: bigint;
    inflationRate: number;
    sessionName: string;
    totalSupply: bigint;
    recipients: Array<Recipient>;
    inflationStartYear: bigint;
    timestamp: bigint;
    enableInflation: boolean;
}
export interface VestingSchedule {
    admin: Principal;
    tokenPrice: number;
    cliffPeriod: bigint;
    name: string;
    totalTokens: bigint;
    vestingType: Variant_graded_cliffLinear;
    vestingDuration: bigint;
    startDate: bigint;
}
export interface Schedule {
    id: string;
    cliff: VestingCliff;
    step: VestingStep;
    numChunks: bigint;
    lockPeriod: bigint;
    isTokenLock: boolean;
    chunkSize: bigint;
}
export interface Recipient {
    id: string;
    name: string;
    allocationPercentage: number;
    schedule: Schedule;
}
export interface UserProfile {
    name: string;
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_graded_cliffLinear {
    graded = "graded",
    cliffLinear = "cliffLinear"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteVestingSchedule(name: string): Promise<void>;
    getAllSessions(): Promise<Array<SavedSession>>;
    getAllVestingSchedules(): Promise<Array<VestingSchedule>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getSession(id: string): Promise<SavedSession>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVestingSchedule(name: string): Promise<VestingSchedule>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    listApprovalsForCurrentUser(): Promise<Array<UserApprovalInfo>>;
    requestApproval(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveSession(session: SavedSession): Promise<void>;
    saveVestingSchedule(schedule: VestingSchedule): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
}

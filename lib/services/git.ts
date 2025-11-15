/**
 * Git Operations API Service
 * Handles Git operations with desktop backend
 */

import axios from "axios"
import { env } from "@/lib/env"

const gitClient = axios.create({
  baseURL: `http://localhost:${env.desktopBackendPort}/api`,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
})

export interface GitStatus {
  branch: string
  staged: string[]
  unstaged: string[]
  untracked: string[]
  ahead: number
  behind: number
}

export interface GitCommit {
  hash: string
  author: string
  date: string
  message: string
}

export interface CommitRequest {
  message: string
  files: string[]
}

export interface DiffResult {
  file: string
  additions: number
  deletions: number
  changes: Array<{
    line_number: number
    type: "add" | "remove" | "context"
    content: string
  }>
}

/**
 * Get Git repository status
 */
export async function getGitStatus(): Promise<GitStatus> {
  const response = await gitClient.get<GitStatus>("/git/status")
  return response.data
}

/**
 * Get Git commit history
 */
export async function getGitLog(limit = 10): Promise<GitCommit[]> {
  const response = await gitClient.get<GitCommit[]>("/git/log", {
    params: { limit },
  })
  return response.data
}

/**
 * Create a Git commit
 */
export async function createCommit(data: CommitRequest): Promise<{
  hash: string
  message: string
}> {
  const response = await gitClient.post("/git/commit", data)
  return response.data
}

/**
 * Get diff for a file or staged changes
 */
export async function getDiff(file?: string): Promise<DiffResult[]> {
  const response = await gitClient.get<DiffResult[]>("/git/diff", {
    params: file ? { file } : {},
  })
  return response.data
}

/**
 * Stage files for commit
 */
export async function stageFiles(files: string[]): Promise<void> {
  await gitClient.post("/git/add", { files })
}

/**
 * Unstage files
 */
export async function unstageFiles(files: string[]): Promise<void> {
  await gitClient.post("/git/reset", { files })
}

/**
 * Push commits to remote
 */
export async function pushToRemote(branch?: string): Promise<void> {
  await gitClient.post("/git/push", { branch })
}

/**
 * Pull from remote
 */
export async function pullFromRemote(branch?: string): Promise<void> {
  await gitClient.post("/git/pull", { branch })
}

/**
 * Create a new branch
 */
export async function createBranch(name: string, checkout = true): Promise<void> {
  await gitClient.post("/git/branch", { name, checkout })
}

/**
 * Switch to a branch
 */
export async function checkoutBranch(name: string): Promise<void> {
  await gitClient.post("/git/checkout", { branch: name })
}

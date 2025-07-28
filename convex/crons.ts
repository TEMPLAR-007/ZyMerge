import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Clean up old search requests every hour to maintain rolling window
crons.interval("cleanup old search requests", { hours: 1 }, internal.myFunctions.cleanupOldSearchRequests, {});

export default crons;
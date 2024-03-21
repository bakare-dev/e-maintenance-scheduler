"use strict";
const express = require("express");
const Logger = require("../utils/Logger");
const os = require("os");
const { exec } = require('child_process');
const SchedulerService = require("../services/SchedulerService");

let instance;

class Server {

    #app;
    #port;
    #logger;
    #ipRequestCount;
    #rateLimitWindowMs = 30000;
    #maxRequestsPerWindow = 10;
    #schedulerService;

    constructor(port) {

        if (instance) return instance;

        this.#port = port;
        this.#configure();
        this.#buildRoutes();
        this.#logger = new Logger().getLogger();
        this.#ipRequestCount = new Map();
        this.#schedulerService = new SchedulerService().start();

        instance = this;
    }

    #configure = () => {

        this.#app = express();
        this.#app.use(express.json());
    }

    #checkRateLimit = (req, res, next) => {
        const ip = req.ip;
        const currentTime = Date.now();
        const ipRequests = this.#ipRequestCount.get(ip) || [];
        this.#ipRequestCount.set(ip, ipRequests);

        this.#ipRequestCount.set(
            ip,
            ipRequests.filter(
                (timestamp) => currentTime - timestamp < this.#rateLimitWindowMs
            )
        );

        if (ipRequests.length > this.#maxRequestsPerWindow) {
            return res.status(429).json({ error: "Try Again Later" });
        }

        ipRequests.push(currentTime);

        next();
    };

    #getDiskUsage = (path = os.homedir()) => {
        return new Promise((resolve, reject) => {
            exec(`df -k ${path}`, (error, stdout, stderr) => {
              if (error) {
                reject(error);
                return;
              }
        
              const lines = stdout.split('\n');
              const [header, data] = lines.slice(0, 2);
        
              const headers = header.split(/\s+/).filter(Boolean);
              const values = data.split(/\s+/).filter(Boolean);
        
              const result = {};
              headers.forEach((header, index) => {
                result[header.toLowerCase()] = values[index];
              });

              result.sizeGB = (result['1024-blocks'] / (1024 * 1024)).toFixed(2);
              result.usedGB = (result.used / (1024 * 1024)).toFixed(2);
              result.availableGB = (result.available / (1024 * 1024)).toFixed(2);
        
              resolve(result);
            });
        });
    }

    #buildRoutes = () => {
        this.#app.get("/api/v1/health", async (req, res) => {
            const info = await this.#getDiskUsage();

            const healthInfo = {
                appMemUsage: (process.memoryUsage().heapUsed / (1024 ** 3)).toFixed(2),
                status: "Server is up and running",
            };

            res.status(200).json(healthInfo);
        });

        this.#app.get("/", (req, res) => {
            const message = {
                info: "You have reached fd-server",
                baseUrl: "/api/v1/",
                health: "/api/v1/health",
                docs: "/swagger",
            }
            res.json(message);
        });

    }

    start = async () => {
        this.#app.listen(this.#port, async () => {
            this.#logger.info(`e-maintenance-scheduler now listening on port ${this.#port}`);
        })
    }

    getServerApp = () => {
        return this.#app;
    }
}

module.exports = Server;

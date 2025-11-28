/**
 * NZBGet Configuration Module
 *
 * Handles all NZBGet server configuration including:
 * - Writing the initial config file
 * - Configuring Usenet servers via JSON-RPC API
 * - Multi-server setup with priority levels (per FrugalUsenet guide)
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";

/**
 * Write the initial NZBGet config file.
 * This sets directory paths that must be configured before NZBGet starts.
 *
 * @param {string} configPath - Path to write the config file
 * @param {object} options - Configuration options
 * @param {string} options.downloadDir - Final download destination
 * @param {string} options.tempDir - Intermediate/temp directory
 * @param {number} options.port - Control port for JSON-RPC API
 * @param {string} options.username - Control username
 * @param {string} options.password - Control password
 */
export function writeNZBConfig(configPath, options) {
    const directory = configPath.split("/").slice(0, -1).join("/");
    if (!existsSync(directory)) {
        mkdirSync(directory, { recursive: true });
    }

    const content = `MainDir=/downloads
DestDir=${options.downloadDir}
InterDir=${options.tempDir}
ControlPort=${options.port}
ControlIP=127.0.0.1
ControlUsername=${options.username}
ControlPassword=${options.password}
LogFile=/downloads/nzbget.log
`; // NZBGet expands missing defaults on boot

    writeFileSync(configPath, content);
}

/**
 * Configure NZBGet via JSON-RPC API after it starts.
 *
 * NZBGet configuration is done in two layers:
 * 1. Config file (-c flag): Sets directory paths at startup (handled by writeNZBConfig)
 * 2. API saveconfig: Sets Usenet server credentials and unpacking options at runtime
 *
 * Server credentials can't be in the config file (they're environment-specific).
 * Unpacking must be enabled via API because NZBGet's default is to NOT unpack.
 *
 * @param {object} nzbClient - NZBGet JSON-RPC client instance
 * @param {object} config - Full configuration object
 */
export async function configureServers(nzbClient, config) {
    // Log initial config for debugging
    console.log("[movies-on-demand] checking NZBGet initial config...");
    const currentConfig = await nzbClient.call("config", []);
    const relevantSettings = [
        "MainDir",
        "DestDir",
        "InterDir",
        "TempDir",
        "NzbDir",
    ];
    const initialConfig = {};
    for (const setting of currentConfig) {
        if (relevantSettings.includes(setting.Name)) {
            initialConfig[setting.Name] = setting.Value;
        }
    }
    console.log(
        `[movies-on-demand] NZBGet initial config (before our changes): ${JSON.stringify(
            initialConfig
        )}`
    );

    // Log server configuration
    console.log(
        "[movies-on-demand] configuring Usenet servers and directories"
    );
    console.log(
        `[movies-on-demand] Server 1 (Priority 0): ${config.usenetServer1Host}:${config.usenetServer1Port} ` +
            `(${config.usenetServer1Connections} conn, SSL: ${config.usenetServer1Encryption})`
    );
    console.log(
        `[movies-on-demand] Server 2 (Priority 1): ${config.usenetServer2Host}:${config.usenetServer2Port} ` +
            `(${config.usenetServer2Connections} conn, SSL: ${config.usenetServer2Encryption})`
    );
    console.log(
        `[movies-on-demand] Server 3 (Priority 2): ${config.usenetServer3Host}:${config.usenetServer3Port} ` +
            `(${config.usenetServer3Connections} conn, SSL: ${config.usenetServer3Encryption})`
    );

    const settings = [
        // Directory settings - ensure NZBGet uses our paths
        { Name: "MainDir", Value: "/downloads" },
        { Name: "DestDir", Value: config.downloadDir },
        { Name: "InterDir", Value: config.tempDir },

        // Unpacking settings - enable RAR extraction
        { Name: "Unpack", Value: "yes" },
        { Name: "DirectUnpack", Value: "yes" },
        { Name: "UnpackCleanupDisk", Value: "yes" },
        { Name: "UnrarCmd", Value: "unrar" }, // unrar-free is installed in the container
        { Name: "UnpackPauseQueue", Value: "no" },

        // Server 1: Primary server (Priority 0 - main download server)
        // Per FrugalUsenet guide: "local" server at priority 0 handles bulk of traffic
        ...buildServerSettings(1, {
            name: "FrugalUsenet-US",
            level: 0,
            host: config.usenetServer1Host,
            port: config.usenetServer1Port,
            encryption: config.usenetServer1Encryption,
            connections: config.usenetServer1Connections,
            username: config.usenetUser,
            password: config.usenetPass,
        }),

        // Server 2: EU server (Priority 1 - failover for missing articles)
        // Per FrugalUsenet guide: "not local" server at priority 1 for failover
        ...buildServerSettings(2, {
            name: "FrugalUsenet-EU",
            level: 1,
            host: config.usenetServer2Host,
            port: config.usenetServer2Port,
            encryption: config.usenetServer2Encryption,
            connections: config.usenetServer2Connections,
            username: config.usenetUser,
            password: config.usenetPass,
        }),

        // Server 3: Bonus server (Priority 2 - backup for older/missing posts)
        // Per FrugalUsenet guide: Bonus server at priority 2 for older posts (3000+ days retention)
        ...buildServerSettings(3, {
            name: "FrugalUsenet-Bonus",
            level: 2,
            host: config.usenetServer3Host,
            port: config.usenetServer3Port,
            encryption: config.usenetServer3Encryption,
            connections: config.usenetServer3Connections,
            username: config.usenetUser,
            password: config.usenetPass,
        }),
    ];

    await nzbClient.call("saveconfig", [settings]);
    await nzbClient.call("reload");

    // Verify the config was applied
    const updatedConfig = await nzbClient.call("config", []);
    const finalConfig = {};
    for (const setting of updatedConfig) {
        if (relevantSettings.includes(setting.Name)) {
            finalConfig[setting.Name] = setting.Value;
        }
    }
    console.log(
        `[movies-on-demand] NZBGet config after our changes: ${JSON.stringify(
            finalConfig
        )}`
    );
}

/**
 * Build NZBGet settings array for a single server.
 *
 * @param {number} serverNum - Server number (1, 2, 3, etc.)
 * @param {object} server - Server configuration
 * @returns {Array} Array of NZBGet setting objects
 */
function buildServerSettings(serverNum, server) {
    const prefix = `Server${serverNum}`;
    return [
        { Name: `${prefix}.Active`, Value: "yes" },
        { Name: `${prefix}.Name`, Value: server.name },
        { Name: `${prefix}.Level`, Value: String(server.level) },
        { Name: `${prefix}.Host`, Value: server.host },
        { Name: `${prefix}.Port`, Value: String(server.port) },
        {
            Name: `${prefix}.Encryption`,
            Value: server.encryption ? "yes" : "no",
        },
        { Name: `${prefix}.Connections`, Value: String(server.connections) },
        { Name: `${prefix}.Username`, Value: server.username },
        { Name: `${prefix}.Password`, Value: server.password },
    ];
}

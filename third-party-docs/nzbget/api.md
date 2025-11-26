# NZBGet API Reference

Source: https://nzbget.com/documentation/api/

## Status of this document

The document describes methods available in NZBGet version 13.0 and later.

## Protocols

NZBGet supports `XML-RPC`, `JSON-RPC` and `JSON-P-RPC`. RPC-protocols allow to control the program from other applications.

- XML-RPC: `http://username:password@localhost:6789/xmlrpc`
- JSON-RPC: `http://username:password@localhost:6789/jsonrpc`
- JSON-P-RPC: `http://username:password@localhost:6789/jsonprpc`

## Authentication

NZBGet has three pairs of username/password:

- `ControlUsername` / `ControlPassword` - Full access
- `RestrictedUsername` / `RestrictedPassword` - Restricted access (cannot use `saveconfig`)
- `AddUsername` / `AddPassword` - Can only use `append` and `version` methods

## API Methods

### Program Control

- `version` - Returns NZBGet version
- `shutdown` - Shutdown NZBGet
- `reload` - Reload configuration

### Queue and History

- `listgroups` - List download groups/queue
- `listfiles` - List files in a group
- `history` - Get download history
- `append` - Add NZB to queue
- `editqueue` - Edit queue items
- `scan` - Scan incoming directory

### Status, Logging and Statistics

- `status` - Get program status
- `sysinfo` - Get system info
- `log` - Get log entries
- `writelog` - Write to log
- `loadlog` - Load log for a download
- `servervolumes` - Get server volume statistics
- `resetservervolume` - Reset server volume

### Pause and Speed Limit

- `rate` - Set download rate limit
- `pausedownload` / `resumedownload` - Pause/resume downloading
- `pausepost` / `resumepost` - Pause/resume post-processing
- `pausescan` / `resumescan` - Pause/resume scanning
- `scheduleresume` - Schedule resume time

### Configuration

- `config` - Get a single config option value
- `loadconfig` - Load all configuration
- `saveconfig` - Save configuration changes
- `configtemplates` - Get configuration templates

### Tests

- `testserver` - Test news server connection
- `testserverspeed` - Test server speed
- `testdiskspeed` - Test disk speed
- `testnetworkspeed` - Test network speed

---

## Key Methods Detail

### append

Add NZB to download queue.

**Signature:**
```
append(NZBFilename, NZBContent, Category, Priority, AddToTop, AddPaused, DupeKey, DupeScore, DupeMode, PPParameters)
```

**Parameters:**
- `NZBFilename` (string) - Filename for the NZB (can be empty for URL downloads)
- `NZBContent` (string) - NZB file content (base64 encoded) OR URL to download NZB from
- `Category` (string) - Category name
- `Priority` (int) - Priority: -100 (very low) to 900 (force), 0 = normal
- `AddToTop` (bool) - Add to top of queue
- `AddPaused` (bool) - Add in paused state
- `DupeKey` (string) - Duplicate key
- `DupeScore` (int) - Duplicate score
- `DupeMode` (string) - "SCORE", "ALL", or "FORCE"
- `PPParameters` (string) - Post-processing parameters

**Returns:** NZBID (int) - ID of the added NZB, 0 on failure

### saveconfig

Save configuration options.

**Signature:**
```
saveconfig(Options)
```

**Parameters:**
- `Options` (array) - Array of option objects with `Name` and `Value` properties

**Example:**
```json
{
  "method": "saveconfig",
  "params": [[
    {"Name": "Server1.Host", "Value": "news.example.com"},
    {"Name": "Server1.Port", "Value": "563"},
    {"Name": "Server1.Username", "Value": "user"},
    {"Name": "Server1.Password", "Value": "pass"},
    {"Name": "Server1.Encryption", "Value": "yes"},
    {"Name": "Server1.Connections", "Value": "10"}
  ]]
}
```

**Returns:** boolean - true on success

### reload

Reload configuration from disk. Call this after `saveconfig` to apply changes.

**Signature:**
```
reload()
```

**Returns:** boolean - true on success

### status

Get current status.

**Returns:** Object with fields:
- `RemainingSizeLo`, `RemainingSizeHi` - Remaining bytes (32-bit parts)
- `DownloadedSizeLo`, `DownloadedSizeHi` - Downloaded bytes
- `DownloadRate` - Current download rate (bytes/sec)
- `DownloadPaused` - Is downloading paused
- `ServerStandBy` - Is server on standby
- `PostPaused` - Is post-processing paused
- And more...

### listgroups

Get list of download groups in queue.

**Signature:**
```
listgroups(NumberOfLogEntries)
```

**Parameters:**
- `NumberOfLogEntries` (int) - Number of log entries to include (0 for none)

**Returns:** Array of group objects with fields:
- `NZBID` - ID of the NZB
- `NZBName` - Name of the NZB
- `FileSizeLo`, `FileSizeHi` - Total size (32-bit parts)
- `RemainingSizeLo`, `RemainingSizeHi` - Remaining size
- `Status` - Current status
- And more...

### history

Get download history.

**Signature:**
```
history(Hidden)
```

**Parameters:**
- `Hidden` (bool) - Include hidden items

**Returns:** Array of history objects with fields:
- `NZBID` - ID of the NZB
- `Name` - Name
- `Status` - Final status ("SUCCESS", "FAILURE/*", "DELETED", etc.)
- `FileSizeLo`, `FileSizeHi` - Total size
- And more...

---

## Server Configuration Options

Server options follow the pattern `ServerX.Option` where X is the server number (1-99):

- `Server1.Active` - "yes" or "no"
- `Server1.Name` - Display name
- `Server1.Level` - Priority level (0 = primary)
- `Server1.Host` - Server hostname
- `Server1.Port` - Server port (usually 119 or 563 for SSL)
- `Server1.Username` - Username
- `Server1.Password` - Password
- `Server1.Encryption` - "yes" or "no" (SSL/TLS)
- `Server1.Connections` - Number of connections (1-99)
- `Server1.Optional` - "yes" or "no"
- `Server1.Group` - Server group (0-99)

## Example: Configure Server via JSON-RPC

```javascript
const response = await fetch('http://nzbget:tegbzn6789@127.0.0.1:6789/jsonrpc', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    method: 'saveconfig',
    params: [[
      { Name: 'Server1.Active', Value: 'yes' },
      { Name: 'Server1.Host', Value: 'news.example.com' },
      { Name: 'Server1.Port', Value: '563' },
      { Name: 'Server1.Encryption', Value: 'yes' },
      { Name: 'Server1.Username', Value: 'myuser' },
      { Name: 'Server1.Password', Value: 'mypass' },
      { Name: 'Server1.Connections', Value: '10' }
    ]],
    id: 1
  })
});

// Reload to apply changes
await fetch('http://nzbget:tegbzn6789@127.0.0.1:6789/jsonrpc', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ method: 'reload', params: [], id: 2 })
});
```

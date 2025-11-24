---
title: Commands - Wrangler · Cloudflare Workers docs
description: Create, develop, and deploy your Cloudflare Workers with Wrangler commands.
lastUpdated: 2025-11-24T09:44:42.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/workers/wrangler/commands/
  md: https://developers.cloudflare.com/workers/wrangler/commands/index.md
---

Wrangler offers a number of commands to manage your Cloudflare Workers.

* [`docs`](#docs) - Open this page in your default browser.
* [`init`](#init) - Create a new project from a variety of web frameworks and templates.
* [`containers`](#containers) - Interact with Containers.
* [`d1`](#d1) - Interact with D1.
* [`vectorize`](#vectorize) - Interact with Vectorize indexes.
* [`hyperdrive`](#hyperdrive) - Manage your Hyperdrives.
* [`deploy`](#deploy) - Deploy your Worker to Cloudflare.
* [`dev`](#dev) - Start a local server for developing your Worker.
* [`delete`](#delete) - Delete your Worker from Cloudflare.
* [`kv namespace`](#kv-namespace) - Manage Workers KV namespaces.
* [`kv key`](#kv-key) - Manage key-value pairs within a Workers KV namespace.
* [`kv bulk`](#kv-bulk) - Manage multiple key-value pairs within a Workers KV namespace in batches.
* [`r2 bucket`](#r2-bucket) - Manage Workers R2 buckets.
* [`r2 object`](#r2-object) - Manage Workers R2 objects.
* [`r2 sql`](#r2-sql) - Query tables in R2 Data Catalog with R2 SQL.
* [`secret`](#secret) - Manage the secret variables for a Worker.
* [`secret bulk`](#secret-bulk) - Manage multiple secret variables for a Worker.
* [`secrets-store secret`](#secrets-store-secret) - Manage account secrets within a secrets store.
* [`secrets-store store`](#secrets-store-store) - Manage your store within secrets store.
* [`workflows`](#workflows) - Manage and configure Workflows.
* [`tail`](#tail) - Start a session to livestream logs from a deployed Worker.
* [`pages`](#pages) - Configure Cloudflare Pages.
* [`pipelines`](#pipelines) - Configure Cloudflare Pipelines.
* [`queues`](#queues) - Configure Workers Queues.
* [`login`](#login) - Authorize Wrangler with your Cloudflare account using OAuth.
* [`logout`](#logout) - Remove Wrangler's authorization for accessing your account.
* [`whoami`](#whoami) - Retrieve your user information and test your authentication configuration.
* [`versions`](#versions) - Retrieve details for recent versions.
* [`deployments`](#deployments) - Retrieve details for recent deployments.
* [`rollback`](#rollback) - Rollback to a recent deployment.
* [`dispatch-namespace`](#dispatch-namespace) - Interact with a [dispatch namespace](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/reference/how-workers-for-platforms-works/#dispatch-namespace).
* [`mtls-certificate`](#mtls-certificate) - Manage certificates used for mTLS connections.
* [`cert`](#cert) - Manage certificates used for mTLS and Certificate Authority (CA) chain connections.
* [`types`](#types) - Generate types from bindings and module rules in configuration.
* [`telemetry`](#telemetry) - Configure whether Wrangler can collect anonymous usage data.
* [`check`](#check) - Validate your Worker.

Note

The following global flags work on every command:

* `--help` boolean
  * Show help.
* `--config` string (not supported by Pages)
  * Path to your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/).
* `--cwd` string
  * Run as if Wrangler was started in the specified directory instead of the current working directory.

***

## How to run Wrangler commands

This page provides a reference for Wrangler commands.

```txt
wrangler <COMMAND> <SUBCOMMAND> [PARAMETERS] [OPTIONS]
```

Since Cloudflare recommends [installing Wrangler locally](https://developers.cloudflare.com/workers/wrangler/install-and-update/) in your project(rather than globally), the way to run Wrangler will depend on your specific setup and package manager.

* npm

  ```sh
  npx wrangler <COMMAND> <SUBCOMMAND> [PARAMETERS] [OPTIONS]
  ```

* yarn

  ```sh
  yarn wrangler <COMMAND> <SUBCOMMAND> [PARAMETERS] [OPTIONS]
  ```

* pnpm

  ```sh
  pnpm wrangler <COMMAND> <SUBCOMMAND> [PARAMETERS] [OPTIONS]
  ```

You can add Wrangler commands that you use often as scripts in your project's `package.json` file:

```json
{
  ...
  "scripts": {
    "deploy": "wrangler deploy",
    "dev": "wrangler dev"
  }
  ...
}
```

You can then run them using your package manager of choice:

* npm

  ```sh
  npm run deploy
  ```

* yarn

  ```sh
  yarn run deploy
  ```

* pnpm

  ```sh
  pnpm run deploy
  ```

***

## `docs`

Open the Cloudflare developer documentation in your default browser.

* npm

  ```sh
  npx wrangler docs [SEARCH]
  ```

* pnpm

  ```sh
  pnpm wrangler docs [SEARCH]
  ```

* yarn

  ```sh
  yarn wrangler docs [SEARCH]
  ```

- `[SEARCH]` string

  Enter search terms (e.g. the wrangler command) you want to know more about

- `--yes` boolean alias: --y

  Takes you to the docs, even if search fails

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

***

## `init`

Create a new project via the [create-cloudflare-cli (C3) tool](https://developers.cloudflare.com/workers/get-started/guide/#1-create-a-new-worker-project). A variety of web frameworks are available to choose from as well as templates. Dependencies are installed by default, with the option to deploy your project immediately.

```txt
wrangler init [<NAME>] [OPTIONS]
```

* `NAME` string optional (default: name of working directory)
  * The name of the Workers project. This is both the directory name and `name` property in the generated [Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/).

* `--yes` boolean optional
  * Answer yes to any prompts for new projects.

* `--from-dash` string optional

  * Fetch a Worker initialized from the dashboard. This is done by passing the flag and the Worker name. `wrangler init --from-dash <WORKER_NAME>`.
  * The `--from-dash` command will not automatically sync changes made to the dashboard after the command is used. Therefore, it is recommended that you continue using the CLI.

The following global flags work on every command:

* `--help` boolean
  * Show help.
* `--config` string (not supported by Pages)
  * Path to your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/).
* `--cwd` string
  * Run as if Wrangler was started in the specified directory instead of the current working directory.

***

## `containers`

Interact with Cloudflare's Container Platform.

### `build`

Build a Container image from a Dockerfile.

```txt
wrangler containers build [PATH] [OPTIONS]
```

* `PATH` string optional
  * Path for the directory containing the Dockerfile to build.

* `-t, --tag` string required
  * Name and optionally a tag (format: "name:tag").

* `--path-to-docker` string optional

  * Path to your docker binary if it's not on `$PATH`.
  * Default: "docker"

* `-p, --push` boolean optional

  * Push the built image to Cloudflare's managed registry.
  * Default: false

### `delete`

Delete a Container (application).

```txt
wrangler containers delete <CONTAINER_ID> [OPTIONS]
```

* `CONTAINER_ID` string required
  * The ID of the Container to delete.

### `images`

Perform operations on images in your containers registry.

#### `images list`

List images in your containers registry.

```txt
wrangler containers images list [OPTIONS]
```

* `--filter` string optional
  * Regex to filter results.

* `--json` boolean optional

  * Return output as clean JSON.
  * Default: false

#### `images delete`

Remove an image from your containers registry.

```txt
wrangler containers images delete [IMAGE] [OPTIONS]
```

* `IMAGE` string required
  * Image to delete of the form `IMAGE:TAG`

### `registries`

Configure and view registries available to your container. [Read more](https://developers.cloudflare.com/containers/platform-details/image-management/#using-amazon-ecr-container-images) about our currently supported external registries.

#### `registries list`

List registries your containers are able to use.

```txt
wrangler containers registries list [OPTIONS]
```

* `--json` boolean optional

  * Return output as clean JSON.
  * Default: false

#### `registries configure`

Configure a new registry for your account.

```txt
wrangler containers registries configure [DOMAIN] [OPTIONS]
```

* `DOMAIN` string required
  * domain to configre for the registry
* `--public-credential` string required
  * The public part of the registry credentials, e.g. `AWS_ACCESS_KEY_ID` for ECR
* `--secret-store-id` string optional
  * The ID of the secret store to use to store the registry credentials
* `--secret-name` string optional
  * The name Wrangler should store the registry credentials under

When run interactively, wrangler will prompt you for your secret and store it in Secrets Store. To run non-interactively, you can send your secret value to wrangler through stdin to have the secret created for you.

#### `registries delete`

Remove a registry configuration from your account.

```txt
wrangler containers registries delete [DOMAIN] [OPTIONS]
```

* `DOMAIN` string required
  * domain of the registry to delete

### `info`

Get information about a specific Container, including top-level details and a list of instances.

```txt
wrangler containers info <CONTAINER_ID> [OPTIONS]
```

* `CONTAINER_ID` string required
  * The ID of the Container to get information about.

### `list`

List the Containers in your account.

```txt
wrangler containers list [OPTIONS]
```

### `push`

Push a tagged image to a Cloudflare managed registry, which is automatically integrated with your account.

```txt
wrangler containers push [TAG] [OPTIONS]
```

* `TAG` string required
  * The name and tag of the container image to push.

* `--path-to-docker` string optional

  * Path to your docker binary if it's not on `$PATH`.
  * Default: "docker"

## `d1`

Interact with Cloudflare's D1 service.

### `create`

Creates a new D1 database, and provides the binding and UUID that you will put in your Wrangler file.

```txt
wrangler d1 create <DATABASE_NAME> [OPTIONS]
```

* `DATABASE_NAME` string required
  * The name of the new D1 database.

* `--location` string optional

  * Provide an optional [location hint](https://developers.cloudflare.com/d1/configuration/data-location/) for your database leader.
  * Available options include `weur` (Western Europe), `eeur` (Eastern Europe), `apac` (Asia Pacific), `oc` (Oceania), `wnam` (Western North America), and `enam` (Eastern North America).

### `info`

Get information about a D1 database, including the current database size and state.

```txt
wrangler d1 info <DATABASE_NAME> [OPTIONS]
```

* `DATABASE_NAME` string required
  * The name of the D1 database to get information about.
* `--json` boolean optional
  * Return output as JSON rather than a table.

### `list`

List all D1 databases in your account.

```txt
wrangler d1 list [OPTIONS]
```

* `--json` boolean optional
  * Return output as JSON rather than a table.

### `delete`

Delete a D1 database.

```txt
wrangler d1 delete <DATABASE_NAME> [OPTIONS]
```

* `DATABASE_NAME` string required
  * The name of the D1 database to delete.
* `-y, --skip-confirmation` boolean optional
  * Skip deletion confirmation prompt.

### `execute`

Execute a query on a D1 database.

```txt
wrangler d1 execute <DATABASE_NAME> [OPTIONS]
```

Note

You must provide either `--command` or `--file` for this command to run successfully.

* `DATABASE_NAME` string required
  * The name of the D1 database to execute a query on.
* `--command` string optional
  * The SQL query you wish to execute.
* `--file` string optional
  * Path to the SQL file you wish to execute.
* `-y, --yes` boolean optional
  * Answer `yes` to any prompts.
* `--local` boolean (default: true) optional
  * Execute commands/files against a local database for use with [wrangler dev](https://developers.cloudflare.com/workers/wrangler/commands/#dev).
* `--remote` boolean (default: false) optional
  * Execute commands/files against a remote D1 database for use with [remote bindings](https://developers.cloudflare.com/workers/development-testing/#remote-bindings) or your deployed Worker.
* `--persist-to` string optional
  * Specify directory to use for local persistence (for use in combination with `--local`).
* `--json` boolean optional
  * Return output as JSON rather than a table.
* `--preview` boolean optional
  * Execute commands/files against a preview D1 database (as defined by `preview_database_id` in the [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/#d1-databases)).

### `export`

Export a D1 database or table's schema and/or content to a `.sql` file.

```txt
wrangler d1 export <DATABASE_NAME> [OPTIONS]
```

* `DATABASE_NAME` string required
  * The name of the D1 database to export.
* `--local` boolean (default: true) optional
  * Export from a local database for use with [wrangler dev](https://developers.cloudflare.com/workers/wrangler/commands/#dev).
* `--remote` boolean (default: false) optional
  * Export from a remote D1 database.
* `--output` string required
  * Path to the SQL file for your export.
* `--table` string optional
  * The name of the table within a D1 database to export.
* `--no-data` boolean (default: false) optional
  * Controls whether export SQL file contains database data. Note that `--no-data=true` is not recommended due to a known wrangler limitation that intreprets the value as false.
* `--no-schema` boolean (default: false) optional
  * Controls whether export SQL file contains database schema. Note that `--no-schema=true` is not recommended due to a known wrangler limitation that intreprets the value as false.

### `time-travel restore`

Restore a database to a specific point-in-time using [Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/).

```txt
wrangler d1 time-travel restore <DATABASE_NAME> [OPTIONS]
```

* `DATABASE_NAME` string required
  * The name of the D1 database to execute a query on.
* `--bookmark` string optional
  * A D1 bookmark representing the state of a database at a specific point in time.
* `--timestamp` string optional
  * A UNIX timestamp or JavaScript date-time `string` within the last 30 days.
* `--json` boolean optional
  * Return output as JSON rather than a table.

### `time-travel info`

Inspect the current state of a database for a specific point-in-time using [Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/).

```txt
wrangler d1 time-travel info <DATABASE_NAME> [OPTIONS]
```

* `DATABASE_NAME` string required
  * The name of the D1 database to execute a query on.
* `--timestamp` string optional
  * A UNIX timestamp or JavaScript date-time `string` within the last 30 days.
* `--json` bboolean optional
  * Return output as JSON rather than a table.

### `migrations create`

Create a new migration.

This will generate a new versioned file inside the `migrations` folder. Name your migration file as a description of your change. This will make it easier for you to find your migration in the `migrations` folder. An example filename looks like:

`0000_create_user_table.sql`

The filename will include a version number and the migration name you specify below.

```txt
wrangler d1 migrations create <DATABASE_NAME> <MIGRATION_NAME>
```

* `DATABASE_NAME` string required
  * The name of the D1 database you wish to create a migration for.
* `MIGRATION_NAME` string required
  * A descriptive name for the migration you wish to create.

### `migrations list`

View a list of unapplied migration files.

```txt
wrangler d1 migrations list <DATABASE_NAME> [OPTIONS]
```

* `DATABASE_NAME` string required
  * The name of the D1 database you wish to list unapplied migrations for.
* `--local` boolean optional
  * Show the list of unapplied migration files on your locally persisted D1 database.
* `--remote` boolean (default: false) optional
  * Show the list of unapplied migration files on your remote D1 database.
* `--persist-to` string optional
  * Specify directory to use for local persistence (for use in combination with `--local`).
* `--preview` boolean optional
  * Show the list of unapplied migration files on your preview D1 database (as defined by `preview_database_id` in the [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/#d1-databases)).

### `migrations apply`

Apply any unapplied migrations.

This command will prompt you to confirm the migrations you are about to apply. Confirm that you would like to proceed. After, a backup will be captured.

The progress of each migration will be printed in the console.

When running the apply command in a CI/CD environment or another non-interactive command line, the confirmation step will be skipped, but the backup will still be captured.

If applying a migration results in an error, this migration will be rolled back, and the previous successful migration will remain applied.

```txt
wrangler d1 migrations apply <DATABASE_NAME> [OPTIONS]
```

* `DATABASE_NAME` string required
  * The name of the D1 database you wish to apply your migrations on.
* `--env` string optional
  * Specify which environment configuration to use for D1 binding
* `--local` boolean (default: true) optional
  * Execute any unapplied migrations on your locally persisted D1 database.
* `--remote` boolean (default: false) optional
  * Execute any unapplied migrations on your remote D1 database.
* `--persist-to` string optional
  * Specify directory to use for local persistence (for use in combination with `--local`).
* `--preview` boolean optional
  * Execute any unapplied migrations on your preview D1 database (as defined by `preview_database_id` in the [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/#d1-databases)).

***

## `hyperdrive`

Manage [Hyperdrive](https://developers.cloudflare.com/hyperdrive/) database configurations.

### `hyperdrive create`

Create a Hyperdrive config

* npm

  ```sh
  npx wrangler hyperdrive create [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler hyperdrive create [NAME]
  ```

* yarn

  ```sh
  yarn wrangler hyperdrive create [NAME]
  ```

- `[NAME]` string required

  The name of the Hyperdrive config

- `--connection-string` string

  The connection string for the database you want Hyperdrive to connect to - ex: protocol://user:password\@host:port/database

- `--origin-host` string alias: --host

  The host of the origin database

- `--origin-port` number alias: --port

  The port number of the origin database

- `--origin-scheme` string alias: --scheme default: postgresql

  The scheme used to connect to the origin database

- `--database` string

  The name of the database within the origin database

- `--origin-user` string alias: --user

  The username used to connect to the origin database

- `--origin-password` string alias: --password

  The password used to connect to the origin database

- `--access-client-id` string

  The Client ID of the Access token to use when connecting to the origin database

- `--access-client-secret` string

  The Client Secret of the Access token to use when connecting to the origin database

- `--caching-disabled` boolean

  Disables the caching of SQL responses

- `--max-age` number

  Specifies max duration for which items should persist in the cache, cannot be set when caching is disabled

- `--swr` number

  Indicates the number of seconds cache may serve the response after it becomes stale, cannot be set when caching is disabled

- `--ca-certificate-id` string alias: --ca-certificate-uuid

  Sets custom CA certificate when connecting to origin database. Must be valid UUID of already uploaded CA certificate.

- `--mtls-certificate-id` string alias: --mtls-certificate-uuid

  Sets custom mTLS client certificates when connecting to origin database. Must be valid UUID of already uploaded public/private key certificates.

- `--sslmode` string

  Sets CA sslmode for connecting to database.

- `--origin-connection-limit` number

  The (soft) maximum number of connections that Hyperdrive may establish to the origin database

- `--binding` string

  The binding name of this resource in your Worker

- `--use-remote` boolean

  Use a remote binding when adding the newly created resource to your config

- `--update-config` boolean

  Automatically update your config file with the newly added resource

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `hyperdrive delete`

Delete a Hyperdrive config

* npm

  ```sh
  npx wrangler hyperdrive delete [ID]
  ```

* pnpm

  ```sh
  pnpm wrangler hyperdrive delete [ID]
  ```

* yarn

  ```sh
  yarn wrangler hyperdrive delete [ID]
  ```

- `[ID]` string required

  The ID of the Hyperdrive config

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `hyperdrive get`

Get a Hyperdrive config

* npm

  ```sh
  npx wrangler hyperdrive get [ID]
  ```

* pnpm

  ```sh
  pnpm wrangler hyperdrive get [ID]
  ```

* yarn

  ```sh
  yarn wrangler hyperdrive get [ID]
  ```

- `[ID]` string required

  The ID of the Hyperdrive config

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `hyperdrive list`

List Hyperdrive configs

* npm

  ```sh
  npx wrangler hyperdrive list
  ```

* pnpm

  ```sh
  pnpm wrangler hyperdrive list
  ```

* yarn

  ```sh
  yarn wrangler hyperdrive list
  ```



Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `hyperdrive update`

Update a Hyperdrive config

* npm

  ```sh
  npx wrangler hyperdrive update [ID]
  ```

* pnpm

  ```sh
  pnpm wrangler hyperdrive update [ID]
  ```

* yarn

  ```sh
  yarn wrangler hyperdrive update [ID]
  ```

- `[ID]` string required

  The ID of the Hyperdrive config

- `--name` string

  Give your config a new name

- `--connection-string` string

  The connection string for the database you want Hyperdrive to connect to - ex: protocol://user:password\@host:port/database

- `--origin-host` string alias: --host

  The host of the origin database

- `--origin-port` number alias: --port

  The port number of the origin database

- `--origin-scheme` string alias: --scheme

  The scheme used to connect to the origin database

- `--database` string

  The name of the database within the origin database

- `--origin-user` string alias: --user

  The username used to connect to the origin database

- `--origin-password` string alias: --password

  The password used to connect to the origin database

- `--access-client-id` string

  The Client ID of the Access token to use when connecting to the origin database

- `--access-client-secret` string

  The Client Secret of the Access token to use when connecting to the origin database

- `--caching-disabled` boolean

  Disables the caching of SQL responses

- `--max-age` number

  Specifies max duration for which items should persist in the cache, cannot be set when caching is disabled

- `--swr` number

  Indicates the number of seconds cache may serve the response after it becomes stale, cannot be set when caching is disabled

- `--ca-certificate-id` string alias: --ca-certificate-uuid

  Sets custom CA certificate when connecting to origin database. Must be valid UUID of already uploaded CA certificate.

- `--mtls-certificate-id` string alias: --mtls-certificate-uuid

  Sets custom mTLS client certificates when connecting to origin database. Must be valid UUID of already uploaded public/private key certificates.

- `--sslmode` string

  Sets CA sslmode for connecting to database.

- `--origin-connection-limit` number

  The (soft) maximum number of connections that Hyperdrive may establish to the origin database

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

***

## `vectorize`

Interact with a [Vectorize](https://developers.cloudflare.com/vectorize/) vector database.

### `vectorize create`

Create a Vectorize index

* npm

  ```sh
  npx wrangler vectorize create [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler vectorize create [NAME]
  ```

* yarn

  ```sh
  yarn wrangler vectorize create [NAME]
  ```

- `[NAME]` string required

  The name of the Vectorize index to create (must be unique).

- `--dimensions` number

  The dimension size to configure this index for, based on the output dimensions of your ML model.

- `--metric` string

  The distance metric to use for searching within the index.

- `--preset` string

  The name of an preset representing an embeddings model: Vectorize will configure the dimensions and distance metric for you when provided.

- `--description` string

  An optional description for this index.

- `--json` boolean default: false

  Return output as clean JSON

- `--deprecated-v1` boolean default: false

  Create a deprecated Vectorize V1 index. This is not recommended and indexes created with this option need all other Vectorize operations to have this option enabled.

- `--use-remote` boolean

  Use a remote binding when adding the newly created resource to your config

- `--update-config` boolean

  Automatically update your config file with the newly added resource

- `--binding` string

  The binding name of this resource in your Worker

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `vectorize delete`

Delete a Vectorize index

* npm

  ```sh
  npx wrangler vectorize delete [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler vectorize delete [NAME]
  ```

* yarn

  ```sh
  yarn wrangler vectorize delete [NAME]
  ```

- `[NAME]` string required

  The name of the Vectorize index

- `--force` boolean alias: --y default: false

  Skip confirmation

- `--deprecated-v1` boolean default: false

  Delete a deprecated Vectorize V1 index.

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `vectorize get`

Get a Vectorize index by name

* npm

  ```sh
  npx wrangler vectorize get [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler vectorize get [NAME]
  ```

* yarn

  ```sh
  yarn wrangler vectorize get [NAME]
  ```

- `[NAME]` string required

  The name of the Vectorize index.

- `--json` boolean default: false

  Return output as clean JSON

- `--deprecated-v1` boolean default: false

  Fetch a deprecated V1 Vectorize index. This must be enabled if the index was created with V1 option.

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `vectorize list`

List your Vectorize indexes

* npm

  ```sh
  npx wrangler vectorize list
  ```

* pnpm

  ```sh
  pnpm wrangler vectorize list
  ```

* yarn

  ```sh
  yarn wrangler vectorize list
  ```

- `--json` boolean default: false

  Return output as clean JSON

- `--deprecated-v1` boolean default: false

  List deprecated Vectorize V1 indexes for your account.

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `vectorize list-vectors`

List vector identifiers in a Vectorize index

* npm

  ```sh
  npx wrangler vectorize list-vectors [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler vectorize list-vectors [NAME]
  ```

* yarn

  ```sh
  yarn wrangler vectorize list-vectors [NAME]
  ```

- `[NAME]` string required

  The name of the Vectorize index

- `--count` number

  Maximum number of vectors to return (1-1000)

- `--cursor` string

  Cursor for pagination to get the next page of results

- `--json` boolean default: false

  Return output as clean JSON

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `vectorize query`

Query a Vectorize index

* npm

  ```sh
  npx wrangler vectorize query [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler vectorize query [NAME]
  ```

* yarn

  ```sh
  yarn wrangler vectorize query [NAME]
  ```

- `[NAME]` string required

  The name of the Vectorize index

- `--vector` number

  Vector to query the Vectorize Index

- `--vector-id` string

  Identifier for a vector in the index against which the index should be queried

- `--top-k` number default: 5

  The number of results (nearest neighbors) to return

- `--return-values` boolean default: false

  Specify if the vector values should be included in the results

- `--return-metadata` string default: none

  Specify if the vector metadata should be included in the results

- `--namespace` string

  Filter the query results based on this namespace

- `--filter` string

  Filter the query results based on this metadata filter.

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `vectorize insert`

Insert vectors into a Vectorize index

* npm

  ```sh
  npx wrangler vectorize insert [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler vectorize insert [NAME]
  ```

* yarn

  ```sh
  yarn wrangler vectorize insert [NAME]
  ```

- `[NAME]` string required

  The name of the Vectorize index.

- `--file` string required

  A file containing line separated json (ndjson) vector objects.

- `--batch-size` number default: 1000

  Number of vector records to include when sending to the Cloudflare API.

- `--json` boolean default: false

  return output as clean JSON

- `--deprecated-v1` boolean default: false

  Insert into a deprecated V1 Vectorize index. This must be enabled if the index was created with the V1 option.

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `vectorize upsert`

Upsert vectors into a Vectorize index

* npm

  ```sh
  npx wrangler vectorize upsert [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler vectorize upsert [NAME]
  ```

* yarn

  ```sh
  yarn wrangler vectorize upsert [NAME]
  ```

- `[NAME]` string required

  The name of the Vectorize index.

- `--file` string required

  A file containing line separated json (ndjson) vector objects.

- `--batch-size` number default: 5000

  Number of vector records to include in a single upsert batch when sending to the Cloudflare API.

- `--json` boolean default: false

  return output as clean JSON

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `vectorize get-vectors`

Get vectors from a Vectorize index

* npm

  ```sh
  npx wrangler vectorize get-vectors [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler vectorize get-vectors [NAME]
  ```

* yarn

  ```sh
  yarn wrangler vectorize get-vectors [NAME]
  ```

- `[NAME]` string required

  The name of the Vectorize index.

- `--ids` string required

  Vector identifiers to be fetched from the Vectorize Index. Example: `--ids a 'b' 1 '2'`

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `vectorize delete-vectors`

Delete vectors in a Vectorize index

* npm

  ```sh
  npx wrangler vectorize delete-vectors [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler vectorize delete-vectors [NAME]
  ```

* yarn

  ```sh
  yarn wrangler vectorize delete-vectors [NAME]
  ```

- `[NAME]` string required

  The name of the Vectorize index.

- `--ids` string required

  Vector identifiers to be deleted from the Vectorize Index. Example: `--ids a 'b' 1 '2'`

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `vectorize info`

Get additional details about the index

* npm

  ```sh
  npx wrangler vectorize info [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler vectorize info [NAME]
  ```

* yarn

  ```sh
  yarn wrangler vectorize info [NAME]
  ```

- `[NAME]` string required

  The name of the Vectorize index.

- `--json` boolean default: false

  return output as clean JSON

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `vectorize create-metadata-index`

Enable metadata filtering on the specified property

* npm

  ```sh
  npx wrangler vectorize create-metadata-index [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler vectorize create-metadata-index [NAME]
  ```

* yarn

  ```sh
  yarn wrangler vectorize create-metadata-index [NAME]
  ```

- `[NAME]` string required

  The name of the Vectorize index.

- `--propertyName` string required

  The name of the metadata property to index.

- `--type` string required

  The type of metadata property to index. Valid types are 'string', 'number' and 'boolean'.

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `vectorize list-metadata-index`

List metadata properties on which metadata filtering is enabled

* npm

  ```sh
  npx wrangler vectorize list-metadata-index [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler vectorize list-metadata-index [NAME]
  ```

* yarn

  ```sh
  yarn wrangler vectorize list-metadata-index [NAME]
  ```

- `[NAME]` string required

  The name of the Vectorize index.

- `--json` boolean default: false

  return output as clean JSON

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `vectorize delete-metadata-index`

Delete metadata indexes

* npm

  ```sh
  npx wrangler vectorize delete-metadata-index [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler vectorize delete-metadata-index [NAME]
  ```

* yarn

  ```sh
  yarn wrangler vectorize delete-metadata-index [NAME]
  ```

- `[NAME]` string required

  The name of the Vectorize index.

- `--propertyName` string required

  The name of the metadata property to index.

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

***

## `dev`

Start a local server for developing your Worker.

```txt
wrangler dev [<SCRIPT>] [OPTIONS]
```

Note

None of the options for this command are required. Many of these options can be set in your Wrangler file. Refer to the [Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration) documentation for more information.

* `SCRIPT` string
  * The path to an entry point for your Worker. Only required if your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/) does not include a `main` key (for example, `main = "index.js"`).

* `--name` string optional
  * Name of the Worker.

* `--config`, `-c` string\[] optional

  * Path(s) to [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/). If not provided, Wrangler will use the nearest config file based on your current working directory.
  * You can provide multiple configuration files to run multiple Workers in one dev session like this: `wrangler dev -c ./wrangler.toml -c ../other-worker/wrangler.toml`. The first config will be treated as the *primary* Worker, which will be exposed over HTTP. The remaining config files will only be accessible via a service binding from the primary Worker.

* `--no-bundle` boolean (default: false) optional
  * Skip Wrangler's build steps. Particularly useful when using custom builds. Refer to [Bundling](https://developers.cloudflare.com/workers/wrangler/bundling/) for more information.

* `--env` string optional
  * Perform on a specific environment.

* `--compatibility-date` string optional
  * A date in the form yyyy-mm-dd, which will be used to determine which version of the Workers runtime is used.

* `--compatibility-flags`, `--compatibility-flag` string\[] optional
  * Flags to use for compatibility checks.

* `--latest` boolean (default: true) optional
  * Use the latest version of the Workers runtime.

* `--ip` string optional
  * IP address to listen on, defaults to `localhost`.

* `--port` number optional
  * Port to listen on.

* `--inspector-port` number optional
  * Port for devtools to connect to.

* `--routes`, `--route` string\[] optional

  * Routes to upload.
  * For example: `--route example.com/*`.

* `--host` string optional
  * Host to forward requests to, defaults to the zone of project.

* `--local-protocol` 'http'|'https' (default: http) optional
  * Protocol to listen to requests on.

* `--https-key-path` string optional
  * Path to a custom certificate key.

* `--https-cert-path` string optional
  * Path to a custom certificate.

* `--local-upstream` string optional
  * Host to act as origin in local mode, defaults to `dev.host` or route.

* `--assets` string optional beta
  * Folder of static assets to be served. Replaces [Workers Sites](https://developers.cloudflare.com/workers/configuration/sites/). Visit [assets](https://developers.cloudflare.com/workers/static-assets/) for more information.

* `--site` string optional deprecated, use \`--assets\`

  * Folder of static assets for Workers Sites.

    Warning

    Workers Sites is deprecated. Please use [Workers Assets](https://developers.cloudflare.com/workers/static-assets/) or [Pages](https://developers.cloudflare.com/pages/).

* `--site-include` string\[] optional deprecated
  * Array of `.gitignore`-style patterns that match file or directory names from the sites directory. Only matched items will be uploaded.

* `--site-exclude` string\[] optional deprecated
  * Array of `.gitignore`-style patterns that match file or directory names from the sites directory. Matched items will not be uploaded.

* `--upstream-protocol` 'http'|'https' (default: https) optional
  * Protocol to forward requests to host on.

* `--var` key:value\\\[] optional

  * Array of `key:value` pairs to inject as variables into your code. The value will always be passed as a string to your Worker.
  * For example, `--var "git_hash:'$(git rev-parse HEAD)'" "test:123"` makes the `git_hash` and `test` variables available in your Worker's `env`.
  * This flag is an alternative to defining [`vars`](https://developers.cloudflare.com/workers/wrangler/configuration/#non-inheritable-keys) in your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/). If defined in both places, this flag's values will be used.

* `--define` key:value\\\[] optional

  * Array of `key:value` pairs to replace global identifiers in your code.
  * For example, `--define "GIT_HASH:'$(git rev-parse HEAD)'"` will replace all uses of `GIT_HASH` with the actual value at build time.
  * This flag is an alternative to defining [`define`](https://developers.cloudflare.com/workers/wrangler/configuration/#non-inheritable-keys) in your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/). If defined in both places, this flag's values will be used.

* `--tsconfig` string optional
  * Path to a custom `tsconfig.json` file.

* `--minify` boolean optional
  * Minify the Worker.

* `--persist-to` string optional
  * Specify directory to use for local persistence.

* `--remote` boolean (default: false) optional
  * Develop against remote resources and data stored on Cloudflare's network.

* `--test-scheduled` boolean (default: false) optional
  * Exposes a `/__scheduled` fetch route which will trigger a scheduled event (Cron Trigger) for testing during development. To simulate different cron patterns, a `cron` query parameter can be passed in: `/__scheduled?cron=*+*+*+*+*` or `/cdn-cgi/handler/scheduled?cron=*+*+*+*+*`.

* `--log-level` 'debug'|'info'|'log'|'warn'|'error|'none' (default: log) optional
  * Specify Wrangler's logging level.

* `--show-interactive-dev-session` boolean (default: true if the terminal supports interactivity) optional
  * Show the interactive dev session.

* `--alias` `Array<string>`
  * Specify modules to alias using [module aliasing](https://developers.cloudflare.com/workers/wrangler/configuration/#module-aliasing).

The following global flags work on every command:

* `--help` boolean
  * Show help.
* `--config` string (not supported by Pages)
  * Path to your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/).
* `--cwd` string
  * Run as if Wrangler was started in the specified directory instead of the current working directory.

`wrangler dev` is a way to [locally test](https://developers.cloudflare.com/workers/development-testing/) your Worker while developing. With `wrangler dev` running, send HTTP requests to `localhost:8787` and your Worker should execute as expected. You will also see `console.log` messages and exceptions appearing in your terminal.

***

## `deploy`

Deploy your Worker to Cloudflare.

```txt
wrangler deploy [<PATH>] [OPTIONS]
```

Note

None of the options for this command are required. Also, many can be set in your Wrangler file. Refer to the [Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/) documentation for more information.

* `PATH` string

  * A path specific what needs to be deployed, this can either be:

    * The path to an entry point for your Worker.

      * Only required if your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/) does not include a `main` key (for example, `main = "index.js"`).

    * Or the path to an assets directory for the deployment of a static site.

      * Visit [assets](https://developers.cloudflare.com/workers/static-assets/) for more information.
      * This overrides the eventual `assets` configuration in your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/).
      * This is equivalent to the `--assets` option listed below.
      * Note: this option currently only works only in interactive mode (so not in CI systems).

* `--name` string optional

  * Name of the Worker.

* `--no-bundle` boolean (default: false) optional

  * Skip Wrangler's build steps. Particularly useful when using custom builds. Refer to [Bundling](https://developers.cloudflare.com/workers/wrangler/bundling/) for more information.

* `--env` string optional

  * Perform on a specific environment.

    Note

    If you're using the [Cloudflare Vite plugin](https://developers.cloudflare.com/workers/vite-plugin/), you select the environment at dev or build time via the `CLOUDFLARE_ENV` environment variable rather than the `--env` flag. Otherwise, environments are defined in your Worker config file as usual. For more detail on using environments with the Cloudflare Vite plugin, refer to the [plugin documentation](https://developers.cloudflare.com/workers/vite-plugin/reference/cloudflare-environments/).

* `--outdir` string optional

  * Path to directory where Wrangler will write the bundled Worker files.

* `--compatibility-date` string optional

  * A date in the form yyyy-mm-dd, which will be used to determine which version of the Workers runtime is used.

* `--compatibility-flags`, `--compatibility-flag` string\[] optional

  * Flags to use for compatibility checks.

* `--latest` boolean (default: true) optional

  * Use the latest version of the Workers runtime.

* `--assets` string optional beta

  * Folder of static assets to be served. Replaces [Workers Sites](https://developers.cloudflare.com/workers/configuration/sites/). Visit [assets](https://developers.cloudflare.com/workers/static-assets/) for more information.

* `--site` string optional deprecated, use \`--assets\`

  * Folder of static assets for Workers Sites.

    Warning

    Workers Sites is deprecated. Please use [Workers Assets](https://developers.cloudflare.com/workers/static-assets/) or [Pages](https://developers.cloudflare.com/pages/).

* `--site-include` string\[] optional deprecated

  * Array of `.gitignore`-style patterns that match file or directory names from the sites directory. Only matched items will be uploaded.

* `--site-exclude` string\[] optional deprecated

  * Array of `.gitignore`-style patterns that match file or directory names from the sites directory. Matched items will not be uploaded.

* `--var` key:value\\\[] optional

  * Array of `key:value` pairs to inject as variables into your code. The value will always be passed as a string to your Worker.
  * For example, `--var git_hash:$(git rev-parse HEAD) test:123` makes the `git_hash` and `test` variables available in your Worker's `env`.
  * This flag is an alternative to defining [`vars`](https://developers.cloudflare.com/workers/wrangler/configuration/#non-inheritable-keys) in your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/). If defined in both places, this flag's values will be used.

* `--define` key:value\\\[] optional

  * Array of `key:value` pairs to replace global identifiers in your code.
  * For example, `--define GIT_HASH:$(git rev-parse HEAD)` will replace all uses of `GIT_HASH` with the actual value at build time.
  * This flag is an alternative to defining [`define`](https://developers.cloudflare.com/workers/wrangler/configuration/#non-inheritable-keys) in your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/). If defined in both places, this flag's values will be used.

* `--triggers`, `--schedule`, `--schedules` string\[] optional

  * Cron schedules to attach to the deployed Worker. Refer to [Cron Trigger Examples](https://developers.cloudflare.com/workers/configuration/cron-triggers/#examples).

* `--routes`, `--route` string\[] optional

  * Routes where this Worker will be deployed.
  * For example: `--route example.com/*`.

* `--tsconfig` string optional

  * Path to a custom `tsconfig.json` file.

* `--minify` boolean optional

  * Minify the bundled Worker before deploying.

* `--dry-run` boolean (default: false) optional

  * Compile a project without actually deploying to live servers. Combined with `--outdir`, this is also useful for testing the output of `npx wrangler deploy`. It also gives developers a chance to upload our generated sourcemap to a service like Sentry, so that errors from the Worker can be mapped against source code, but before the service goes live.

* `--keep-vars` boolean (default: false) optional

  * It is recommended best practice to treat your Wrangler developer environment as a source of truth for your Worker configuration, and avoid making changes via the Cloudflare dashboard.
  * If you change your environment variables in the Cloudflare dashboard, Wrangler will override them the next time you deploy. If you want to disable this behaviour set `keep-vars` to `true`.
  * Secrets are never deleted by a deployment whether this flag is true or false.

* `--dispatch-namespace` string optional

  * Specify the [Workers for Platforms dispatch namespace](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/get-started/configuration/#2-create-a-dispatch-namespace) to upload this Worker to.

* `--metafile` string optional

  * Specify a file to write the build metadata from esbuild to. If flag is used without a path string, this defaults to `bundle-meta.json` inside the directory specified by `--outdir`. This can be useful for understanding the bundle size.

* `--containers-rollout` immediate | gradual optional

  * Specify the [rollout strategy](https://developers.cloudflare.com/containers/faq#how-do-container-updates-and-rollouts-work) for [Containers](https://developers.cloudflare.com/containers) associated with the Worker. If set to `immediate`, 100% of container instances will be updated in one rollout step, overriding any configuration in `rollout_step_percentage`. Note that `rollout_active_grace_period`, if configured, still applies.
  * Defaults to `gradual`, where the default rollout is 10% then 100% of instances.

* `--strict` boolean (default: false) optional

  * Turns on strict mode for the deployment command, meaning that the command will be more defensive and prevent deployments which could introduce potential issues. In particular, this mode prevents deployments if the deployment would potentially override remote settings in non-interactive environments.

The following global flags work on every command:

* `--help` boolean
  * Show help.
* `--config` string (not supported by Pages)
  * Path to your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/).
* `--cwd` string
  * Run as if Wrangler was started in the specified directory instead of the current working directory.

***

## `delete`

Delete your Worker and all associated Cloudflare developer platform resources.

```txt
wrangler delete [<SCRIPT>] [OPTIONS]
```

* `SCRIPT` string
  * The path to an entry point for your Worker. Only required if your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/) does not include a `main` key (for example, `main = "index.js"`).
* `--name` string optional
  * Name of the Worker.
* `--env` string optional
  * Perform on a specific environment.
* `--dry-run` boolean (default: false) optional
  * Do not actually delete the Worker. This is useful for testing the output of `wrangler delete`.

The following global flags work on every command:

* `--help` boolean
  * Show help.
* `--config` string (not supported by Pages)
  * Path to your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/).
* `--cwd` string
  * Run as if Wrangler was started in the specified directory instead of the current working directory.

***

## `kv namespace`

Manage Workers KV namespaces.

Note

The `kv ...` commands allow you to manage your Workers KV resources in the Cloudflare network. Learn more about using Workers KV with Wrangler in the [Workers KV guide](https://developers.cloudflare.com/kv/get-started/).

Warning

Since version 3.60.0, Wrangler supports the `kv ...` syntax. If you are using versions below 3.60.0, the command follows the `kv:...` syntax. Learn more about the deprecation of the `kv:...` syntax in the [Wrangler commands](https://developers.cloudflare.com/kv/reference/kv-commands/#deprecations) for KV page.

### `kv namespace create`

Create a new namespace

* npm

  ```sh
  npx wrangler kv namespace create [NAMESPACE]
  ```

* pnpm

  ```sh
  pnpm wrangler kv namespace create [NAMESPACE]
  ```

* yarn

  ```sh
  yarn wrangler kv namespace create [NAMESPACE]
  ```

- `[NAMESPACE]` string required

  The name of the new namespace

- `--preview` boolean

  Interact with a preview namespace

- `--use-remote` boolean

  Use a remote binding when adding the newly created resource to your config

- `--update-config` boolean

  Automatically update your config file with the newly added resource

- `--binding` string

  The binding name of this resource in your Worker

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `kv namespace list`

Output a list of all KV namespaces associated with your account id

* npm

  ```sh
  npx wrangler kv namespace list
  ```

* pnpm

  ```sh
  pnpm wrangler kv namespace list
  ```

* yarn

  ```sh
  yarn wrangler kv namespace list
  ```



Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `kv namespace delete`

Delete a given namespace.

* npm

  ```sh
  npx wrangler kv namespace delete
  ```

* pnpm

  ```sh
  pnpm wrangler kv namespace delete
  ```

* yarn

  ```sh
  yarn wrangler kv namespace delete
  ```

- `--binding` string

  The binding name to the namespace to delete from

- `--namespace-id` string

  The id of the namespace to delete

- `--preview` boolean

  Interact with a preview namespace

- `--skip-confirmation` boolean alias: --y default: false

  Skip confirmation

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `kv namespace rename`

Rename a KV namespace

* npm

  ```sh
  npx wrangler kv namespace rename [OLD-NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler kv namespace rename [OLD-NAME]
  ```

* yarn

  ```sh
  yarn wrangler kv namespace rename [OLD-NAME]
  ```

- `[OLD-NAME]` string

  The current name (title) of the namespace to rename

- `--namespace-id` string

  The id of the namespace to rename

- `--new-name` string required

  The new name for the namespace

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

## `kv key`

Manage key-value pairs within a Workers KV namespace.

Note

The `kv ...` commands allow you to manage your Workers KV resources in the Cloudflare network. Learn more about using Workers KV with Wrangler in the [Workers KV guide](https://developers.cloudflare.com/kv/get-started/).

Warning

Since version 3.60.0, Wrangler supports the `kv ...` syntax. If you are using versions below 3.60.0, the command follows the `kv:...` syntax. Learn more about the deprecation of the `kv:...` syntax in the [Wrangler commands](https://developers.cloudflare.com/kv/reference/kv-commands/) for KV page.

### `kv key put`

Write a single key/value pair to the given namespace

* npm

  ```sh
  npx wrangler kv key put [KEY] [VALUE]
  ```

* pnpm

  ```sh
  pnpm wrangler kv key put [KEY] [VALUE]
  ```

* yarn

  ```sh
  yarn wrangler kv key put [KEY] [VALUE]
  ```

- `[KEY]` string required

  The key to write to

- `[VALUE]` string

  The value to write

- `--binding` string

  The binding name to the namespace to write to

- `--namespace-id` string

  The id of the namespace to write to

- `--preview` boolean

  Interact with a preview namespace

- `--ttl` number

  Time for which the entries should be visible

- `--expiration` number

  Time since the UNIX epoch after which the entry expires

- `--metadata` string

  Arbitrary JSON that is associated with a key

- `--path` string

  Read value from the file at a given path

- `--local` boolean

  Interact with local storage

- `--remote` boolean

  Interact with remote storage

- `--persist-to` string

  Directory for local persistence

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `kv key list`

Output a list of all keys in a given namespace

* npm

  ```sh
  npx wrangler kv key list
  ```

* pnpm

  ```sh
  pnpm wrangler kv key list
  ```

* yarn

  ```sh
  yarn wrangler kv key list
  ```

- `--binding` string

  The binding name to the namespace to list

- `--namespace-id` string

  The id of the namespace to list

- `--preview` boolean default: false

  Interact with a preview namespace

- `--prefix` string

  A prefix to filter listed keys

- `--local` boolean

  Interact with local storage

- `--remote` boolean

  Interact with remote storage

- `--persist-to` string

  Directory for local persistence

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `kv key get`

Read a single value by key from the given namespace

* npm

  ```sh
  npx wrangler kv key get [KEY]
  ```

* pnpm

  ```sh
  pnpm wrangler kv key get [KEY]
  ```

* yarn

  ```sh
  yarn wrangler kv key get [KEY]
  ```

- `[KEY]` string required

  The key value to get.

- `--binding` string

  The binding name to the namespace to get from

- `--namespace-id` string

  The id of the namespace to get from

- `--preview` boolean default: false

  Interact with a preview namespace

- `--text` boolean default: false

  Decode the returned value as a utf8 string

- `--local` boolean

  Interact with local storage

- `--remote` boolean

  Interact with remote storage

- `--persist-to` string

  Directory for local persistence

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `kv key delete`

Remove a single key value pair from the given namespace

* npm

  ```sh
  npx wrangler kv key delete [KEY]
  ```

* pnpm

  ```sh
  pnpm wrangler kv key delete [KEY]
  ```

* yarn

  ```sh
  yarn wrangler kv key delete [KEY]
  ```

- `[KEY]` string required

  The key value to delete.

- `--binding` string

  The binding name to the namespace to delete from

- `--namespace-id` string

  The id of the namespace to delete from

- `--preview` boolean

  Interact with a preview namespace

- `--local` boolean

  Interact with local storage

- `--remote` boolean

  Interact with remote storage

- `--persist-to` string

  Directory for local persistence

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

## `kv bulk`

Manage multiple key-value pairs within a Workers KV namespace in batches.

Note

The `kv ...` commands allow you to manage your Workers KV resources in the Cloudflare network. Learn more about using Workers KV with Wrangler in the [Workers KV guide](https://developers.cloudflare.com/kv/get-started/).

Warning

Since version 3.60.0, Wrangler supports the `kv ...` syntax. If you are using versions below 3.60.0, the command follows the `kv:...` syntax. Learn more about the deprecation of the `kv:...` syntax in the [Wrangler commands](https://developers.cloudflare.com/kv/reference/kv-commands/) for KV page.

### `kv bulk get`

Gets multiple key-value pairs from a namespace

* npm

  ```sh
  npx wrangler kv bulk get [FILENAME]
  ```

* pnpm

  ```sh
  pnpm wrangler kv bulk get [FILENAME]
  ```

* yarn

  ```sh
  yarn wrangler kv bulk get [FILENAME]
  ```

- `[FILENAME]` string required

  The file containing the keys to get

- `--binding` string

  The binding name to the namespace to get from

- `--namespace-id` string

  The id of the namespace to get from

- `--preview` boolean

  Interact with a preview namespace

- `--local` boolean

  Interact with local storage

- `--remote` boolean

  Interact with remote storage

- `--persist-to` string

  Directory for local persistence

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `kv bulk put`

Upload multiple key-value pairs to a namespace

* npm

  ```sh
  npx wrangler kv bulk put [FILENAME]
  ```

* pnpm

  ```sh
  pnpm wrangler kv bulk put [FILENAME]
  ```

* yarn

  ```sh
  yarn wrangler kv bulk put [FILENAME]
  ```

- `[FILENAME]` string required

  The file containing the key/value pairs to write

- `--binding` string

  The binding name to the namespace to write to

- `--namespace-id` string

  The id of the namespace to write to

- `--preview` boolean

  Interact with a preview namespace

- `--ttl` number

  Time for which the entries should be visible

- `--expiration` number

  Time since the UNIX epoch after which the entry expires

- `--metadata` string

  Arbitrary JSON that is associated with a key

- `--local` boolean

  Interact with local storage

- `--remote` boolean

  Interact with remote storage

- `--persist-to` string

  Directory for local persistence

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `kv bulk delete`

Delete multiple key-value pairs from a namespace

* npm

  ```sh
  npx wrangler kv bulk delete [FILENAME]
  ```

* pnpm

  ```sh
  pnpm wrangler kv bulk delete [FILENAME]
  ```

* yarn

  ```sh
  yarn wrangler kv bulk delete [FILENAME]
  ```

- `[FILENAME]` string required

  The file containing the keys to delete

- `--binding` string

  The binding name to the namespace to delete from

- `--namespace-id` string

  The id of the namespace to delete from

- `--preview` boolean

  Interact with a preview namespace

- `--force` boolean alias: --f

  Do not ask for confirmation before deleting

- `--local` boolean

  Interact with local storage

- `--remote` boolean

  Interact with remote storage

- `--persist-to` string

  Directory for local persistence

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

***

## `r2 bucket`

Interact with buckets in an R2 store.

Note

The `r2 bucket` commands allow you to manage application data in the Cloudflare network to be accessed from Workers using [the R2 API](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/).

### `r2 bucket create`

Create a new R2 bucket

* npm

  ```sh
  npx wrangler r2 bucket create [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 bucket create [NAME]
  ```

* yarn

  ```sh
  yarn wrangler r2 bucket create [NAME]
  ```

- `[NAME]` string required

  The name of the new bucket

- `--location` string

  The optional location hint that determines geographic placement of the R2 bucket

- `--storage-class` string alias: --s

  The default storage class for objects uploaded to this bucket

- `--jurisdiction` string alias: --J

  The jurisdiction where the new bucket will be created

- `--use-remote` boolean

  Use a remote binding when adding the newly created resource to your config

- `--update-config` boolean

  Automatically update your config file with the newly added resource

- `--binding` string

  The binding name of this resource in your Worker

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `r2 bucket info`

Get information about an R2 bucket

* npm

  ```sh
  npx wrangler r2 bucket info [BUCKET]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 bucket info [BUCKET]
  ```

* yarn

  ```sh
  yarn wrangler r2 bucket info [BUCKET]
  ```

- `[BUCKET]` string required

  The name of the bucket to retrieve info for

- `--jurisdiction` string alias: --J

  The jurisdiction where the bucket exists

- `--json` boolean default: false

  Return the bucket information as JSON

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `r2 bucket delete`

Delete an R2 bucket

* npm

  ```sh
  npx wrangler r2 bucket delete [BUCKET]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 bucket delete [BUCKET]
  ```

* yarn

  ```sh
  yarn wrangler r2 bucket delete [BUCKET]
  ```

- `[BUCKET]` string required

  The name of the bucket to delete

- `--jurisdiction` string alias: --J

  The jurisdiction where the bucket exists

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `r2 bucket list`

List R2 buckets

* npm

  ```sh
  npx wrangler r2 bucket list
  ```

* pnpm

  ```sh
  pnpm wrangler r2 bucket list
  ```

* yarn

  ```sh
  yarn wrangler r2 bucket list
  ```

- `--jurisdiction` string alias: --J

  The jurisdiction to list

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `r2 bucket catalog enable`

Enable the data catalog on an R2 bucket

* npm

  ```sh
  npx wrangler r2 bucket catalog enable [BUCKET]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 bucket catalog enable [BUCKET]
  ```

* yarn

  ```sh
  yarn wrangler r2 bucket catalog enable [BUCKET]
  ```

- `[BUCKET]` string required

  The name of the bucket to enable

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `r2 bucket catalog disable`

Disable the data catalog for an R2 bucket

* npm

  ```sh
  npx wrangler r2 bucket catalog disable [BUCKET]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 bucket catalog disable [BUCKET]
  ```

* yarn

  ```sh
  yarn wrangler r2 bucket catalog disable [BUCKET]
  ```

- `[BUCKET]` string required

  The name of the bucket to disable the data catalog for

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `r2 bucket catalog get`

Get the status of the data catalog for an R2 bucket

* npm

  ```sh
  npx wrangler r2 bucket catalog get [BUCKET]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 bucket catalog get [BUCKET]
  ```

* yarn

  ```sh
  yarn wrangler r2 bucket catalog get [BUCKET]
  ```

- `[BUCKET]` string required

  The name of the R2 bucket whose data catalog status to retrieve

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `r2 bucket catalog compaction enable`

Enable automatic file compaction for your R2 data catalog or a specific table

* npm

  ```sh
  npx wrangler r2 bucket catalog compaction enable [BUCKET] [NAMESPACE] [TABLE]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 bucket catalog compaction enable [BUCKET] [NAMESPACE] [TABLE]
  ```

* yarn

  ```sh
  yarn wrangler r2 bucket catalog compaction enable [BUCKET] [NAMESPACE] [TABLE]
  ```

- `[BUCKET]` string required

  The name of the bucket which contains the catalog

- `[NAMESPACE]` string

  The namespace containing the table (optional, for table-level compaction)

- `[TABLE]` string

  The name of the table (optional, for table-level compaction)

- `--target-size` number default: 128

  The target size for compacted files in MB (allowed values: 64, 128, 256, 512)

- `--token` string

  A cloudflare api token with access to R2 and R2 Data Catalog (required for catalog-level compaction settings only)

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

Examples:

```bash
# Enable catalog-level compaction (requires token)
npx wrangler r2 bucket catalog compaction enable my-bucket --token <TOKEN>


# Enable table-level compaction
npx wrangler r2 bucket catalog compaction enable my-bucket my-namespace my-table --target-size 256
```

### `r2 bucket catalog compaction disable`

Disable automatic file compaction for your R2 data catalog or a specific table

* npm

  ```sh
  npx wrangler r2 bucket catalog compaction disable [BUCKET] [NAMESPACE] [TABLE]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 bucket catalog compaction disable [BUCKET] [NAMESPACE] [TABLE]
  ```

* yarn

  ```sh
  yarn wrangler r2 bucket catalog compaction disable [BUCKET] [NAMESPACE] [TABLE]
  ```

- `[BUCKET]` string required

  The name of the bucket which contains the catalog

- `[NAMESPACE]` string

  The namespace containing the table (optional, for table-level compaction)

- `[TABLE]` string

  The name of the table (optional, for table-level compaction)

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

Examples:

```bash
# Disable catalog-level compaction
npx wrangler r2 bucket catalog compaction disable my-bucket


# Disable table-level compaction
npx wrangler r2 bucket catalog compaction disable my-bucket my-namespace my-table
```

### `r2 bucket cors set`

Set the CORS configuration for an R2 bucket from a JSON file

* npm

  ```sh
  npx wrangler r2 bucket cors set [BUCKET]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 bucket cors set [BUCKET]
  ```

* yarn

  ```sh
  yarn wrangler r2 bucket cors set [BUCKET]
  ```

- `[BUCKET]` string required

  The name of the R2 bucket to set the CORS configuration for

- `--file` string required

  Path to the JSON file containing the CORS configuration

- `--jurisdiction` string alias: --J

  The jurisdiction where the bucket exists

- `--force` boolean alias: --y default: false

  Skip confirmation

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `r2 bucket cors delete`

Clear the CORS configuration for an R2 bucket

* npm

  ```sh
  npx wrangler r2 bucket cors delete [BUCKET]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 bucket cors delete [BUCKET]
  ```

* yarn

  ```sh
  yarn wrangler r2 bucket cors delete [BUCKET]
  ```

- `[BUCKET]` string required

  The name of the R2 bucket to delete the CORS configuration for

- `--jurisdiction` string alias: --J

  The jurisdiction where the bucket exists

- `--force` boolean alias: --y default: false

  Skip confirmation

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `r2 bucket cors list`

List the CORS rules for an R2 bucket

* npm

  ```sh
  npx wrangler r2 bucket cors list [BUCKET]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 bucket cors list [BUCKET]
  ```

* yarn

  ```sh
  yarn wrangler r2 bucket cors list [BUCKET]
  ```

- `[BUCKET]` string required

  The name of the R2 bucket to list the CORS rules for

- `--jurisdiction` string alias: --J

  The jurisdiction where the bucket exists

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `r2 bucket dev-url enable`

Enable public access via the r2.dev URL for an R2 bucket

* npm

  ```sh
  npx wrangler r2 bucket dev-url enable [BUCKET]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 bucket dev-url enable [BUCKET]
  ```

* yarn

  ```sh
  yarn wrangler r2 bucket dev-url enable [BUCKET]
  ```

- `[BUCKET]` string required

  The name of the R2 bucket to enable public access via its r2.dev URL

- `--jurisdiction` string alias: --J

  The jurisdiction where the bucket exists

- `--force` boolean alias: --y default: false

  Skip confirmation

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `r2 bucket dev-url disable`

Disable public access via the r2.dev URL for an R2 bucket

* npm

  ```sh
  npx wrangler r2 bucket dev-url disable [BUCKET]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 bucket dev-url disable [BUCKET]
  ```

* yarn

  ```sh
  yarn wrangler r2 bucket dev-url disable [BUCKET]
  ```

- `[BUCKET]` string required

  The name of the R2 bucket to disable public access via its r2.dev URL

- `--jurisdiction` string alias: --J

  The jurisdiction where the bucket exists

- `--force` boolean alias: --y default: false

  Skip confirmation

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `r2 bucket dev-url get`

Get the r2.dev URL and status for an R2 bucket

* npm

  ```sh
  npx wrangler r2 bucket dev-url get [BUCKET]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 bucket dev-url get [BUCKET]
  ```

* yarn

  ```sh
  yarn wrangler r2 bucket dev-url get [BUCKET]
  ```

- `[BUCKET]` string required

  The name of the R2 bucket whose r2.dev URL status to retrieve

- `--jurisdiction` string alias: --J

  The jurisdiction where the bucket exists

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `r2 bucket domain add`

Connect a custom domain to an R2 bucket

* npm

  ```sh
  npx wrangler r2 bucket domain add [BUCKET]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 bucket domain add [BUCKET]
  ```

* yarn

  ```sh
  yarn wrangler r2 bucket domain add [BUCKET]
  ```

- `[BUCKET]` string required

  The name of the R2 bucket to connect a custom domain to

- `--domain` string required

  The custom domain to connect to the R2 bucket

- `--zone-id` string required

  The zone ID associated with the custom domain

- `--min-tls` string

  Set the minimum TLS version for the custom domain (defaults to 1.0 if not set)

- `--jurisdiction` string alias: --J

  The jurisdiction where the bucket exists

- `--force` boolean alias: --y default: false

  Skip confirmation

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `r2 bucket domain remove`

Remove a custom domain from an R2 bucket

* npm

  ```sh
  npx wrangler r2 bucket domain remove [BUCKET]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 bucket domain remove [BUCKET]
  ```

* yarn

  ```sh
  yarn wrangler r2 bucket domain remove [BUCKET]
  ```

- `[BUCKET]` string required

  The name of the R2 bucket to remove the custom domain from

- `--domain` string required

  The custom domain to remove from the R2 bucket

- `--jurisdiction` string alias: --J

  The jurisdiction where the bucket exists

- `--force` boolean alias: --y default: false

  Skip confirmation

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `r2 bucket domain update`

Update settings for a custom domain connected to an R2 bucket

* npm

  ```sh
  npx wrangler r2 bucket domain update [BUCKET]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 bucket domain update [BUCKET]
  ```

* yarn

  ```sh
  yarn wrangler r2 bucket domain update [BUCKET]
  ```

- `[BUCKET]` string required

  The name of the R2 bucket associated with the custom domain to update

- `--domain` string required

  The custom domain whose settings will be updated

- `--min-tls` string

  Update the minimum TLS version for the custom domain

- `--jurisdiction` string alias: --J

  The jurisdiction where the bucket exists

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `r2 bucket domain get`

Get custom domain connected to an R2 bucket

* npm

  ```sh
  npx wrangler r2 bucket domain get [BUCKET]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 bucket domain get [BUCKET]
  ```

* yarn

  ```sh
  yarn wrangler r2 bucket domain get [BUCKET]
  ```

- `[BUCKET]` string required

  The name of the R2 bucket whose custom domain to retrieve

- `--domain` string required

  The custom domain to get information for

- `--jurisdiction` string alias: --J

  The jurisdiction where the bucket exists

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `r2 bucket domain list`

List custom domains for an R2 bucket

* npm

  ```sh
  npx wrangler r2 bucket domain list [BUCKET]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 bucket domain list [BUCKET]
  ```

* yarn

  ```sh
  yarn wrangler r2 bucket domain list [BUCKET]
  ```

- `[BUCKET]` string required

  The name of the R2 bucket whose connected custom domains will be listed

- `--jurisdiction` string alias: --J

  The jurisdiction where the bucket exists

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `r2 bucket lifecycle add`

Add a lifecycle rule to an R2 bucket

* npm

  ```sh
  npx wrangler r2 bucket lifecycle add [BUCKET] [NAME] [PREFIX]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 bucket lifecycle add [BUCKET] [NAME] [PREFIX]
  ```

* yarn

  ```sh
  yarn wrangler r2 bucket lifecycle add [BUCKET] [NAME] [PREFIX]
  ```

- `[BUCKET]` string required

  The name of the R2 bucket to add a lifecycle rule to

- `[NAME]` string alias: --id

  A unique name for the lifecycle rule, used to identify and manage it.

- `[PREFIX]` string

  Prefix condition for the lifecycle rule (leave empty for all prefixes)

- `--expire-days` number

  Number of days after which objects expire

- `--expire-date` string

  Date after which objects expire (YYYY-MM-DD)

- `--ia-transition-days` number

  Number of days after which objects transition to Infrequent Access storage

- `--ia-transition-date` string

  Date after which objects transition to Infrequent Access storage (YYYY-MM-DD)

- `--abort-multipart-days` number

  Number of days after which incomplete multipart uploads are aborted

- `--jurisdiction` string alias: --J

  The jurisdiction where the bucket exists

- `--force` boolean alias: --y default: false

  Skip confirmation

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `r2 bucket lifecycle remove`

Remove a lifecycle rule from an R2 bucket

* npm

  ```sh
  npx wrangler r2 bucket lifecycle remove [BUCKET]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 bucket lifecycle remove [BUCKET]
  ```

* yarn

  ```sh
  yarn wrangler r2 bucket lifecycle remove [BUCKET]
  ```

- `[BUCKET]` string required

  The name of the R2 bucket to remove a lifecycle rule from

- `--name` string alias: --id required

  The unique name of the lifecycle rule to remove

- `--jurisdiction` string alias: --J

  The jurisdiction where the bucket exists

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `r2 bucket lifecycle list`

List lifecycle rules for an R2 bucket

* npm

  ```sh
  npx wrangler r2 bucket lifecycle list [BUCKET]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 bucket lifecycle list [BUCKET]
  ```

* yarn

  ```sh
  yarn wrangler r2 bucket lifecycle list [BUCKET]
  ```

- `[BUCKET]` string required

  The name of the R2 bucket to list lifecycle rules for

- `--jurisdiction` string alias: --J

  The jurisdiction where the bucket exists

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `r2 bucket lifecycle set`

Set the lifecycle configuration for an R2 bucket from a JSON file

* npm

  ```sh
  npx wrangler r2 bucket lifecycle set [BUCKET]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 bucket lifecycle set [BUCKET]
  ```

* yarn

  ```sh
  yarn wrangler r2 bucket lifecycle set [BUCKET]
  ```

- `[BUCKET]` string required

  The name of the R2 bucket to set lifecycle configuration for

- `--file` string required

  Path to the JSON file containing lifecycle configuration

- `--jurisdiction` string alias: --J

  The jurisdiction where the bucket exists

- `--force` boolean alias: --y default: false

  Skip confirmation

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `r2 bucket lock add`

Add a lock rule to an R2 bucket

* npm

  ```sh
  npx wrangler r2 bucket lock add [BUCKET] [NAME] [PREFIX]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 bucket lock add [BUCKET] [NAME] [PREFIX]
  ```

* yarn

  ```sh
  yarn wrangler r2 bucket lock add [BUCKET] [NAME] [PREFIX]
  ```

- `[BUCKET]` string required

  The name of the R2 bucket to add a bucket lock rule to

- `[NAME]` string alias: --id

  A unique name for the bucket lock rule, used to identify and manage it.

- `[PREFIX]` string

  Prefix condition for the bucket lock rule (set to "" for all prefixes)

- `--retention-days` number

  Number of days which objects will be retained for

- `--retention-date` string

  Date after which objects will be retained until (YYYY-MM-DD)

- `--retention-indefinite` boolean

  Retain objects indefinitely

- `--jurisdiction` string alias: --J

  The jurisdiction where the bucket exists

- `--force` boolean alias: --y default: false

  Skip confirmation

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `r2 bucket lock remove`

Remove a bucket lock rule from an R2 bucket

* npm

  ```sh
  npx wrangler r2 bucket lock remove [BUCKET]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 bucket lock remove [BUCKET]
  ```

* yarn

  ```sh
  yarn wrangler r2 bucket lock remove [BUCKET]
  ```

- `[BUCKET]` string required

  The name of the R2 bucket to remove a bucket lock rule from

- `--name` string alias: --id required

  The unique name of the bucket lock rule to remove

- `--jurisdiction` string alias: --J

  The jurisdiction where the bucket exists

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `r2 bucket lock list`

List lock rules for an R2 bucket

* npm

  ```sh
  npx wrangler r2 bucket lock list [BUCKET]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 bucket lock list [BUCKET]
  ```

* yarn

  ```sh
  yarn wrangler r2 bucket lock list [BUCKET]
  ```

- `[BUCKET]` string required

  The name of the R2 bucket to list lock rules for

- `--jurisdiction` string alias: --J

  The jurisdiction where the bucket exists

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `r2 bucket lock set`

Set the lock configuration for an R2 bucket from a JSON file

* npm

  ```sh
  npx wrangler r2 bucket lock set [BUCKET]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 bucket lock set [BUCKET]
  ```

* yarn

  ```sh
  yarn wrangler r2 bucket lock set [BUCKET]
  ```

- `[BUCKET]` string required

  The name of the R2 bucket to set lock configuration for

- `--file` string required

  Path to the JSON file containing lock configuration

- `--jurisdiction` string alias: --J

  The jurisdiction where the bucket exists

- `--force` boolean alias: --y default: false

  Skip confirmation

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `r2 bucket notification create`

Create an event notification rule for an R2 bucket

* npm

  ```sh
  npx wrangler r2 bucket notification create [BUCKET]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 bucket notification create [BUCKET]
  ```

* yarn

  ```sh
  yarn wrangler r2 bucket notification create [BUCKET]
  ```

- `[BUCKET]` string required

  The name of the R2 bucket to create an event notification rule for

- `--event-types` "object-create" | "object-delete" alias: --event-type required

  The type of event(s) that will emit event notifications

- `--prefix` string

  The prefix that an object must match to emit event notifications (note: regular expressions not supported)

- `--suffix` string

  The suffix that an object must match to emit event notifications (note: regular expressions not supported)

- `--queue` string required

  The name of the queue that will receive event notification messages

- `--jurisdiction` string alias: --J

  The jurisdiction where the bucket exists

- `--description` string

  A description that can be used to identify the event notification rule after creation

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `r2 bucket notification delete`

Delete an event notification rule from an R2 bucket

* npm

  ```sh
  npx wrangler r2 bucket notification delete [BUCKET]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 bucket notification delete [BUCKET]
  ```

* yarn

  ```sh
  yarn wrangler r2 bucket notification delete [BUCKET]
  ```

- `[BUCKET]` string required

  The name of the R2 bucket to delete an event notification rule for

- `--queue` string required

  The name of the queue that corresponds to the event notification rule. If no rule is provided, all event notification rules associated with the bucket and queue will be deleted

- `--rule` string

  The ID of the event notification rule to delete

- `--jurisdiction` string alias: --J

  The jurisdiction where the bucket exists

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `r2 bucket notification list`

List event notification rules for an R2 bucket

* npm

  ```sh
  npx wrangler r2 bucket notification list [BUCKET]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 bucket notification list [BUCKET]
  ```

* yarn

  ```sh
  yarn wrangler r2 bucket notification list [BUCKET]
  ```

- `[BUCKET]` string required

  The name of the R2 bucket to get event notification rules for

- `--jurisdiction` string alias: --J

  The jurisdiction where the bucket exists

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `r2 bucket sippy enable`

Enable Sippy on an R2 bucket

* npm

  ```sh
  npx wrangler r2 bucket sippy enable [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 bucket sippy enable [NAME]
  ```

* yarn

  ```sh
  yarn wrangler r2 bucket sippy enable [NAME]
  ```

- `[NAME]` string required

  The name of the bucket

- `--jurisdiction` string alias: --J

  The jurisdiction where the bucket exists

- `--provider` "AWS" | "GCS"

- `--bucket` string

  The name of the upstream bucket

- `--region` string

  (AWS provider only) The region of the upstream bucket

- `--access-key-id` string

  (AWS provider only) The secret access key id for the upstream bucket

- `--secret-access-key` string

  (AWS provider only) The secret access key for the upstream bucket

- `--service-account-key-file` string

  (GCS provider only) The path to your Google Cloud service account key JSON file

- `--client-email` string

  (GCS provider only) The client email for your Google Cloud service account key

- `--private-key` string

  (GCS provider only) The private key for your Google Cloud service account key

- `--r2-access-key-id` string

  The secret access key id for this R2 bucket

- `--r2-secret-access-key` string

  The secret access key for this R2 bucket

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `r2 bucket sippy disable`

Disable Sippy on an R2 bucket

* npm

  ```sh
  npx wrangler r2 bucket sippy disable [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 bucket sippy disable [NAME]
  ```

* yarn

  ```sh
  yarn wrangler r2 bucket sippy disable [NAME]
  ```

- `[NAME]` string required

  The name of the bucket

- `--jurisdiction` string alias: --J

  The jurisdiction where the bucket exists

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `r2 bucket sippy get`

Check the status of Sippy on an R2 bucket

* npm

  ```sh
  npx wrangler r2 bucket sippy get [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 bucket sippy get [NAME]
  ```

* yarn

  ```sh
  yarn wrangler r2 bucket sippy get [NAME]
  ```

- `[NAME]` string required

  The name of the bucket

- `--jurisdiction` string alias: --J

  The jurisdiction where the bucket exists

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

## `r2 object`

Interact with R2 objects.

Note

The `r2 object` commands allow you to manage application data in the Cloudflare network to be accessed from Workers using [the R2 API](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/).

### `r2 object get`

Fetch an object from an R2 bucket

* npm

  ```sh
  npx wrangler r2 object get [OBJECTPATH]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 object get [OBJECTPATH]
  ```

* yarn

  ```sh
  yarn wrangler r2 object get [OBJECTPATH]
  ```

- `[OBJECTPATH]` string required

  The source object path in the form of {bucket}/{key}

- `--file` string alias: --f

  The destination file to create

- `--pipe` boolean alias: --p

  Enables the file to be piped to a destination, rather than specified with the --file option

- `--local` boolean

  Interact with local storage

- `--remote` boolean

  Interact with remote storage

- `--persist-to` string

  Directory for local persistence

- `--jurisdiction` string alias: --J

  The jurisdiction where the object exists

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `r2 object put`

Create an object in an R2 bucket

* npm

  ```sh
  npx wrangler r2 object put [OBJECTPATH]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 object put [OBJECTPATH]
  ```

* yarn

  ```sh
  yarn wrangler r2 object put [OBJECTPATH]
  ```

- `[OBJECTPATH]` string required

  The destination object path in the form of {bucket}/{key}

- `--file` string alias: --f

  The path of the file to upload

- `--pipe` boolean alias: --p

  Enables the file to be piped in, rather than specified with the --file option

- `--content-type` string alias: --ct

  A standard MIME type describing the format of the object data

- `--content-disposition` string alias: --cd

  Specifies presentational information for the object

- `--content-encoding` string alias: --ce

  Specifies what content encodings have been applied to the object and thus what decoding mechanisms must be applied to obtain the media-type referenced by the Content-Type header field

- `--content-language` string alias: --cl

  The language the content is in

- `--cache-control` string alias: --cc

  Specifies caching behavior along the request/reply chain

- `--expires` string

  The date and time at which the object is no longer cacheable

- `--local` boolean

  Interact with local storage

- `--remote` boolean

  Interact with remote storage

- `--persist-to` string

  Directory for local persistence

- `--jurisdiction` string alias: --J

  The jurisdiction where the object will be created

- `--storage-class` string alias: --s

  The storage class of the object to be created

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `r2 object delete`

Delete an object in an R2 bucket

* npm

  ```sh
  npx wrangler r2 object delete [OBJECTPATH]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 object delete [OBJECTPATH]
  ```

* yarn

  ```sh
  yarn wrangler r2 object delete [OBJECTPATH]
  ```

- `[OBJECTPATH]` string required

  The destination object path in the form of {bucket}/{key}

- `--local` boolean

  Interact with local storage

- `--remote` boolean

  Interact with remote storage

- `--persist-to` string

  Directory for local persistence

- `--jurisdiction` string alias: --J

  The jurisdiction where the object exists

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

***

## r2 SQL

Note

R2 SQL is currently in open beta. Report R2 SQL bugs in [GitHub](https://github.com/cloudflare/workers-sdk/issues/new/choose). R2 SQL expects there to be a [`WRANGLER_R2_SQL_AUTH_TOKEN`](https://developers.cloudflare.com/r2-sql/query-data/#authentication) environment variable to be set.

### `r2 sql query`

Execute SQL query against R2 Data Catalog

* npm

  ```sh
  npx wrangler r2 sql query [WAREHOUSE] [QUERY]
  ```

* pnpm

  ```sh
  pnpm wrangler r2 sql query [WAREHOUSE] [QUERY]
  ```

* yarn

  ```sh
  yarn wrangler r2 sql query [WAREHOUSE] [QUERY]
  ```

- `[WAREHOUSE]` string required

  R2 Data Catalog warehouse name

- `[QUERY]` string required

  The SQL query to execute

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

***

## `secret`

Manage the secret variables for a Worker.

This action creates a new [version](https://developers.cloudflare.com/workers/configuration/versions-and-deployments/#versions) of the Worker and [deploys](https://developers.cloudflare.com/workers/configuration/versions-and-deployments/#deployments) it immediately. To only create a new version of the Worker, use the [`wrangler versions secret`](https://developers.cloudflare.com/workers/wrangler/commands/#versions-secret-put) commands.

### `secret put`

Create or update a secret variable for a Worker

* npm

  ```sh
  npx wrangler secret put [KEY]
  ```

* pnpm

  ```sh
  pnpm wrangler secret put [KEY]
  ```

* yarn

  ```sh
  yarn wrangler secret put [KEY]
  ```

- `[KEY]` string required

  The variable name to be accessible in the Worker

- `--name` string

  Name of the Worker

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

When running this command, you will be prompted to input the secret's value:

```sh
npx wrangler secret put FOO
```

```sh
? Enter a secret value: > ***
🌀 Creating the secret for script worker-app
✨ Success! Uploaded secret FOO
```

The `put` command can also receive piped input. For example:

```sh
echo "-----BEGIN PRIVATE KEY-----\nM...==\n-----END PRIVATE KEY-----\n" | wrangler secret put PRIVATE_KEY
```

### `secret delete`

Delete a secret variable from a Worker

* npm

  ```sh
  npx wrangler secret delete [KEY]
  ```

* pnpm

  ```sh
  pnpm wrangler secret delete [KEY]
  ```

* yarn

  ```sh
  yarn wrangler secret delete [KEY]
  ```

- `[KEY]` string required

  The variable name to be accessible in the Worker

- `--name` string

  Name of the Worker

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `secret list`

List all secrets for a Worker

* npm

  ```sh
  npx wrangler secret list
  ```

* pnpm

  ```sh
  pnpm wrangler secret list
  ```

* yarn

  ```sh
  yarn wrangler secret list
  ```

- `--name` string

  Name of the Worker

- `--format` "json" | "pretty" default: json

  The format to print the secrets in

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

The following is an example of listing the secrets for the current Worker.

```sh
npx wrangler secret list
```

```sh
[
  {
    "name": "FOO",
    "type": "secret_text"
  }
]
```

***

### `secret bulk`

Bulk upload secrets for a Worker

* npm

  ```sh
  npx wrangler secret bulk [FILE]
  ```

* pnpm

  ```sh
  pnpm wrangler secret bulk [FILE]
  ```

* yarn

  ```sh
  yarn wrangler secret bulk [FILE]
  ```

- `[FILE]` string

  The file of key-value pairs to upload, as JSON in form {"key": value, ...} or .dev.vars file in the form KEY=VALUE

- `--name` string

  Name of the Worker

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

The following is an example of uploading secrets from a JSON file redirected to `stdin`. When complete, the output summary will show the number of secrets uploaded and the number of secrets that failed to upload.

```json
{
  "secret-name-1": "secret-value-1",
  "secret-name-2": "secret-value-2"
}
```

```sh
npx wrangler secret bulk < secrets.json
```

```sh
🌀 Creating the secrets for the Worker "script-name"
✨ Successfully created secret for key: secret-name-1
...
🚨 Error uploading secret for key: secret-name-1
✨ Successfully created secret for key: secret-name-2


Finished processing secrets JSON file:
✨ 1 secrets successfully uploaded
🚨 1 secrets failed to upload
```

## `secrets-store secret`

With the release of [Secrets Store](https://developers.cloudflare.com/secrets-store/) in open beta, you can use the following commands to manage your account secrets.

`--remote` option

In order to interact with Secrets Store in production, you should append `--remote` to your command. Without it, your command will default to [local development mode](https://developers.cloudflare.com/workers/development-testing/).

### `secrets-store secret create`

Create a secret within a store

* npm

  ```sh
  npx wrangler secrets-store secret create [STORE-ID]
  ```

* pnpm

  ```sh
  pnpm wrangler secrets-store secret create [STORE-ID]
  ```

* yarn

  ```sh
  yarn wrangler secrets-store secret create [STORE-ID]
  ```

- `[STORE-ID]` string required

  ID of the store in which the secret resides

- `--name` string required

  Name of the secret

- `--value` string

  Value of the secret (Note: Only for testing. Not secure as this will leave secret value in plain-text in terminal history, exclude this flag and use automatic prompt instead)

- `--scopes` string required

  Scopes for the secret (comma-separated list of scopes eg:"workers")

- `--comment` string

  Comment for the secret

- `--remote` boolean default: false

  Execute command against remote Secrets Store

- `--persist-to` string

  Directory for local persistence

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

The following is an example of using the `create` command to create an account-level secret.

```sh
npx wrangler secrets-store secret create 8f7a1cdced6342c18d223ece462fd88d --name ServiceA_key-1 --scopes workers --remote
```

```sh
✓ Enter a secret value: › ***


🔐 Creating secret... (Name: ServiceA_key-1, Value: REDACTED, Scopes: workers, Comment: undefined)
✓ Select an account: › My account
✅ Created secret! (ID: 13bc7498c6374a4e9d13be091c3c65f1)
```

### `secrets-store secret update`

Update a secret within a store

* npm

  ```sh
  npx wrangler secrets-store secret update [STORE-ID]
  ```

* pnpm

  ```sh
  pnpm wrangler secrets-store secret update [STORE-ID]
  ```

* yarn

  ```sh
  yarn wrangler secrets-store secret update [STORE-ID]
  ```

- `[STORE-ID]` string required

  ID of the store in which the secret resides

- `--secret-id` string required

  ID of the secret to update

- `--value` string

  Updated value of the secret (Note: Only for testing. Not secure as this will leave secret value in plain-text in terminal history, exclude this flag and use automatic prompt instead)

- `--scopes` string

  Updated scopes for the secret (comma-separated list of scopes eg:"workers")

- `--comment` string

  Updated comment for the secret

- `--remote` boolean default: false

  Execute command against remote Secrets Store

- `--persist-to` string

  Directory for local persistence

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `secrets-store secret duplicate`

Duplicate a secret within a store

* npm

  ```sh
  npx wrangler secrets-store secret duplicate [STORE-ID]
  ```

* pnpm

  ```sh
  pnpm wrangler secrets-store secret duplicate [STORE-ID]
  ```

* yarn

  ```sh
  yarn wrangler secrets-store secret duplicate [STORE-ID]
  ```

- `[STORE-ID]` string required

  ID of the store in which the secret resides

- `--secret-id` string required

  ID of the secret to duplicate the secret value of

- `--name` string required

  Name of the new secret

- `--scopes` string required

  Scopes for the new secret

- `--comment` string

  Comment for the new secret

- `--remote` boolean default: false

  Execute command against remote Secrets Store

- `--persist-to` string

  Directory for local persistence

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `secrets-store secret get`

Get a secret within a store

* npm

  ```sh
  npx wrangler secrets-store secret get [STORE-ID]
  ```

* pnpm

  ```sh
  pnpm wrangler secrets-store secret get [STORE-ID]
  ```

* yarn

  ```sh
  yarn wrangler secrets-store secret get [STORE-ID]
  ```

- `[STORE-ID]` string required

  ID of the store in which the secret resides

- `--secret-id` string required

  ID of the secret to retrieve

- `--remote` boolean default: false

  Execute command against remote Secrets Store

- `--persist-to` string

  Directory for local persistence

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

The following is an example with the expected output:

```sh
npx wrangler secrets-store secret get 8f7a1cdced6342c18d223ece462fd88d --secret-id 13bc7498c6374a4e9d13be091c3c65f1 --remote
```

```sh
🔐 Getting secret... (ID: 13bc7498c6374a4e9d13be091c3c65f1)
✓ Select an account: › My account
| Name                        | ID                                  | StoreID                             | Comment | Scopes  | Status  | Created                | Modified               |
|-----------------------------|-------------------------------------|-------------------------------------|---------|---------|---------|------------------------|------------------------|
| ServiceA_key-1          | 13bc7498c6374a4e9d13be091c3c65f1    | 8f7a1cdced6342c18d223ece462fd88d    |         | workers | active  | 4/9/2025, 10:06:01 PM  | 4/15/2025, 09:13:05 AM |
```

### `secrets-store secret delete`

Delete a secret within a store

* npm

  ```sh
  npx wrangler secrets-store secret delete [STORE-ID]
  ```

* pnpm

  ```sh
  pnpm wrangler secrets-store secret delete [STORE-ID]
  ```

* yarn

  ```sh
  yarn wrangler secrets-store secret delete [STORE-ID]
  ```

- `[STORE-ID]` string required

  ID of the store in which the secret resides

- `--secret-id` string required

  ID of the secret to delete

- `--remote` boolean default: false

  Execute command against remote Secrets Store

- `--persist-to` string

  Directory for local persistence

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `secrets-store secret list`

List secrets within a store

* npm

  ```sh
  npx wrangler secrets-store secret list [STORE-ID]
  ```

* pnpm

  ```sh
  pnpm wrangler secrets-store secret list [STORE-ID]
  ```

* yarn

  ```sh
  yarn wrangler secrets-store secret list [STORE-ID]
  ```

- `[STORE-ID]` string required

  ID of the store in which to list secrets

- `--page` number default: 1

  Page number of secrets listing results, can configure page size using "per-page"

- `--per-page` number default: 10

  Number of secrets to show per page

- `--remote` boolean default: false

  Execute command against remote Secrets Store

- `--persist-to` string

  Directory for local persistence

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

## `secrets-store store`

Use the following commands to manage your store.

Store limitation

[Secrets Store](https://developers.cloudflare.com/secrets-store/) is in open beta. Currently, you can only have one store per Cloudflare account.

### `secrets-store store create`

Create a store within an account

* npm

  ```sh
  npx wrangler secrets-store store create [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler secrets-store store create [NAME]
  ```

* yarn

  ```sh
  yarn wrangler secrets-store store create [NAME]
  ```

- `[NAME]` string required

  Name of the store

- `--remote` boolean default: false

  Execute command against remote Secrets Store

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

The following is an example of using the `create` command to create a store.

```sh
npx wrangler secrets-store store create default --remote
```

```sh
🔐 Creating store... (Name: default)
✅ Created store! (Name: default, ID: 2e2a82d317134506b58defbe16982d54)
```

### `secrets-store store delete`

Delete a store within an account

* npm

  ```sh
  npx wrangler secrets-store store delete [STORE-ID]
  ```

* pnpm

  ```sh
  pnpm wrangler secrets-store store delete [STORE-ID]
  ```

* yarn

  ```sh
  yarn wrangler secrets-store store delete [STORE-ID]
  ```

- `[STORE-ID]` string required

  ID of the store

- `--remote` boolean default: false

  Execute command against remote Secrets Store

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

The following is an example of using the `delete` command to delete a store.

```sh
npx wrangler secrets-store store delete d2dafaeac9434de2b6d08b292ce08211 --remote
```

```sh
🔐 Deleting store... (Name: d2dafaeac9434de2b6d08b292ce08211)
✅ Deleted store! (ID: d2dafaeac9434de2b6d08b292ce08211)
```

### `secrets-store store list`

List stores within an account

* npm

  ```sh
  npx wrangler secrets-store store list
  ```

* pnpm

  ```sh
  pnpm wrangler secrets-store store list
  ```

* yarn

  ```sh
  yarn wrangler secrets-store store list
  ```

- `--page` number default: 1

  Page number of stores listing results, can configure page size using "per-page"

- `--per-page` number default: 10

  Number of stores to show per page

- `--remote` boolean default: false

  Execute command against remote Secrets Store

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

The following is an example of using the `list` command to list stores.

```sh
npx wrangler secrets-store store list --remote
```

```sh
🔐 Listing stores...
┌─────────┬──────────────────────────────────┬──────────────────────────────────┬──────────────────────┬──────────────────────┐
│ Name    │ ID                               │ AccountID                        │ Created              │ Modified             │
├─────────┼──────────────────────────────────┼──────────────────────────────────┼──────────────────────┼──────────────────────┤
│ default │ 8876bad33f164462bf0743fe8adf98f4 │ REDACTED │ 4/9/2025, 1:11:48 PM  │ 4/9/2025, 1:11:48 PM │
└─────────┴──────────────────────────────────┴──────────────────────────────────┴──────────────────────┴──────────────────────┘
```

## `workflows`

Note

The `wrangler workflows` command requires Wrangler version `3.83.0` or greater. Use `npx wrangler@latest` to always use the latest Wrangler version when invoking commands.

Manage and configure [Workflows](https://developers.cloudflare.com/workflows/).

### `workflows list`

List Workflows associated to account

* npm

  ```sh
  npx wrangler workflows list
  ```

* pnpm

  ```sh
  pnpm wrangler workflows list
  ```

* yarn

  ```sh
  yarn wrangler workflows list
  ```

- `--page` number default: 1

  Show a sepecific page from the listing, can configure page size using "per-page"

- `--per-page` number

  Configure the maximum number of workflows to show per page

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `workflows describe`

Describe Workflow resource

* npm

  ```sh
  npx wrangler workflows describe [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler workflows describe [NAME]
  ```

* yarn

  ```sh
  yarn wrangler workflows describe [NAME]
  ```

- `[NAME]` string required

  Name of the workflow

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `workflows delete`

Delete workflow - when deleting a workflow, it will also delete it's own instances

* npm

  ```sh
  npx wrangler workflows delete [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler workflows delete [NAME]
  ```

* yarn

  ```sh
  yarn wrangler workflows delete [NAME]
  ```

- `[NAME]` string required

  Name of the workflow

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `workflows trigger`

Trigger a workflow, creating a new instance. Can optionally take a JSON string to pass a parameter into the workflow instance

* npm

  ```sh
  npx wrangler workflows trigger [NAME] [PARAMS]
  ```

* pnpm

  ```sh
  pnpm wrangler workflows trigger [NAME] [PARAMS]
  ```

* yarn

  ```sh
  yarn wrangler workflows trigger [NAME] [PARAMS]
  ```

- `[NAME]` string required

  Name of the workflow

- `[PARAMS]` string default:

  Params for the workflow instance, encoded as a JSON string

- `--id` string

  Custom instance ID, if not provided it will default to a random UUIDv4

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `workflows instances list`

Instance related commands (list, describe, terminate, pause, resume)

* npm

  ```sh
  npx wrangler workflows instances list [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler workflows instances list [NAME]
  ```

* yarn

  ```sh
  yarn wrangler workflows instances list [NAME]
  ```

- `[NAME]` string required

  Name of the workflow

- `--reverse` boolean default: false

  Reverse order of the instances table

- `--status` string

  Filters list by instance status (can be one of: queued, running, paused, errored, terminated, complete)

- `--page` number default: 1

  Show a sepecific page from the listing, can configure page size using "per-page"

- `--per-page` number

  Configure the maximum number of instances to show per page

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `workflows instances describe`

Describe a workflow instance - see its logs, retries and errors

* npm

  ```sh
  npx wrangler workflows instances describe [NAME] [ID]
  ```

* pnpm

  ```sh
  pnpm wrangler workflows instances describe [NAME] [ID]
  ```

* yarn

  ```sh
  yarn wrangler workflows instances describe [NAME] [ID]
  ```

- `[NAME]` string required

  Name of the workflow

- `[ID]` string default: latest

  ID of the instance - instead of an UUID you can type 'latest' to get the latest instance and describe it

- `--step-output` boolean default: true

  Don't output the step output since it might clutter the terminal

- `--truncate-output-limit` number default: 5000

  Truncate step output after x characters

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `workflows instances terminate`

Terminate a workflow instance

* npm

  ```sh
  npx wrangler workflows instances terminate [NAME] [ID]
  ```

* pnpm

  ```sh
  pnpm wrangler workflows instances terminate [NAME] [ID]
  ```

* yarn

  ```sh
  yarn wrangler workflows instances terminate [NAME] [ID]
  ```

- `[NAME]` string required

  Name of the workflow

- `[ID]` string required

  ID of the instance - instead of an UUID you can type 'latest' to get the latest instance and describe it

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `workflows instances restart`

Restart a workflow instance

* npm

  ```sh
  npx wrangler workflows instances restart [NAME] [ID]
  ```

* pnpm

  ```sh
  pnpm wrangler workflows instances restart [NAME] [ID]
  ```

* yarn

  ```sh
  yarn wrangler workflows instances restart [NAME] [ID]
  ```

- `[NAME]` string required

  Name of the workflow

- `[ID]` string required

  ID of the instance - instead of an UUID you can type 'latest' to get the latest instance and describe it

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `workflows instances pause`

Pause a workflow instance

* npm

  ```sh
  npx wrangler workflows instances pause [NAME] [ID]
  ```

* pnpm

  ```sh
  pnpm wrangler workflows instances pause [NAME] [ID]
  ```

* yarn

  ```sh
  yarn wrangler workflows instances pause [NAME] [ID]
  ```

- `[NAME]` string required

  Name of the workflow

- `[ID]` string required

  ID of the instance - instead of an UUID you can type 'latest' to get the latest instance and pause it

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `workflows instances resume`

Resume a workflow instance

* npm

  ```sh
  npx wrangler workflows instances resume [NAME] [ID]
  ```

* pnpm

  ```sh
  pnpm wrangler workflows instances resume [NAME] [ID]
  ```

* yarn

  ```sh
  yarn wrangler workflows instances resume [NAME] [ID]
  ```

- `[NAME]` string required

  Name of the workflow

- `[ID]` string required

  ID of the instance - instead of an UUID you can type 'latest' to get the latest instance and resume it

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

## `tail`

🦚 Start a log tailing session for a Worker

* npm

  ```sh
  npx wrangler tail [WORKER]
  ```

* pnpm

  ```sh
  pnpm wrangler tail [WORKER]
  ```

* yarn

  ```sh
  yarn wrangler tail [WORKER]
  ```

- `[WORKER]` string

  Name or route of the worker to tail

- `--format` "json" | "pretty"

  The format of log entries

- `--status` "ok" | "error" | "canceled"

  Filter by invocation status

- `--header` string

  Filter by HTTP header

- `--method` string

  Filter by HTTP method

- `--sampling-rate` number

  Adds a percentage of requests to log sampling rate

- `--search` string

  Filter by a text match in console.log messages

- `--ip` string

  Filter by the IP address the request originates from. Use "self" to filter for your own IP

- `--version-id` string

  Filter by Worker version

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

After starting `wrangler tail`, you will receive a live feed of console and exception logs for each request your Worker receives.

If your Worker has a high volume of traffic, the tail might enter sampling mode. This will cause some of your messages to be dropped and a warning to appear in your tail logs. To prevent messages from being dropped, add the options listed above to filter the volume of tail messages.

Note

It may take up to 1 minute (60 seconds) for a tail to exit sampling mode after adding an option to filter tail messages.

If sampling persists after using options to filter messages, consider using [instant logs](https://developers.cloudflare.com/logs/instant-logs/).

***

## `pages`

Configure Cloudflare Pages.

### `pages dev`

Develop your full-stack Pages application locally

* npm

  ```sh
  npx wrangler pages dev [DIRECTORY] [COMMAND]
  ```

* pnpm

  ```sh
  pnpm wrangler pages dev [DIRECTORY] [COMMAND]
  ```

* yarn

  ```sh
  yarn wrangler pages dev [DIRECTORY] [COMMAND]
  ```

- `[DIRECTORY]` string

  The directory of static assets to serve

- `[COMMAND]` string

  The proxy command to run \[deprecated]

- `--compatibility-date` string

  Date to use for compatibility checks

- `--compatibility-flags` string alias: --compatibility-flag

  Flags to use for compatibility checks

- `--ip` string

  The IP address to listen on

- `--port` number

  The port to listen on (serve from)

- `--inspector-port` number

  Port for devtools to connect to

- `--proxy` number

  The port to proxy (where the static assets are served)

- `--script-path` string

  The location of the single Worker script if not using functions \[default: \_worker.js]

- `--no-bundle` boolean

  Whether to run bundling on `_worker.js`

- `--binding` array alias: --b

  Bind variable/secret (KEY=VALUE)

- `--kv` array alias: --k

  KV namespace to bind (--kv KV\_BINDING)

- `--d1` array

  D1 database to bind (--d1 D1\_BINDING)

- `--do` array alias: --o

  Durable Object to bind (--do DO\_BINDING=CLASS\_NAME\@SCRIPT\_NAME)

- `--r2` array

  R2 bucket to bind (--r2 R2\_BINDING)

- `--ai` string

  AI to bind (--ai AI\_BINDING)

- `--version-metadata` string

  Worker Version metadata (--version-metadata VERSION\_METADATA\_BINDING)

- `--service` array

  Service to bind (--service SERVICE=SCRIPT\_NAME)

- `--live-reload` boolean default: false

  Auto reload HTML pages when change is detected

- `--local-protocol` "http" | "https"

  Protocol to listen to requests on, defaults to http.

- `--https-key-path` string

  Path to a custom certificate key

- `--https-cert-path` string

  Path to a custom certificate

- `--persist-to` string

  Specify directory to use for local persistence (defaults to .wrangler/state)

- `--log-level` "debug" | "info" | "log" | "warn" | "error" | "none"

  Specify logging level

- `--show-interactive-dev-session` boolean

  Show interactive dev session (defaults to true if the terminal supports interactivity)

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `pages functions build`

Compile a folder of Pages Functions into a single Worker

* npm

  ```sh
  npx wrangler pages functions build [DIRECTORY]
  ```

* pnpm

  ```sh
  pnpm wrangler pages functions build [DIRECTORY]
  ```

* yarn

  ```sh
  yarn wrangler pages functions build [DIRECTORY]
  ```

- `[DIRECTORY]` string default: functions

  The directory of Pages Functions

- `--outfile` string

  The location of the output Worker script

- `--outdir` string

  Output directory for the bundled Worker

- `--output-config-path` string

  The location for the output config file

- `--build-metadata-path` string

  The location for the build metadata file

- `--project-directory` string

  The location of the Pages project

- `--output-routes-path` string

  The location for the output \_routes.json file

- `--minify` boolean default: false

  Minify the output Worker script

- `--sourcemap` boolean default: false

  Generate a sourcemap for the output Worker script

- `--fallback-service` string default: ASSETS

  The service to fallback to at the end of the `next` chain. Setting to '' will fallback to the global `fetch`.

- `--watch` boolean default: false

  Watch for changes to the functions and automatically rebuild the Worker script

- `--plugin` boolean default: false

  Build a plugin rather than a Worker script

- `--build-output-directory` string

  The directory to output static assets to

- `--compatibility-date` string

  Date to use for compatibility checks

- `--compatibility-flags` string alias: --compatibility-flag

  Flags to use for compatibility checks

- `--external` string

  A list of module imports to exclude from bundling

- `--metafile` string

  Path to output build metadata from esbuild. If flag is used without a path, defaults to 'bundle-meta.json' inside the directory specified by --outdir.

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `pages project list`

List your Cloudflare Pages projects

* npm

  ```sh
  npx wrangler pages project list
  ```

* pnpm

  ```sh
  pnpm wrangler pages project list
  ```

* yarn

  ```sh
  yarn wrangler pages project list
  ```

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `pages project create`

Create a new Cloudflare Pages project

* npm

  ```sh
  npx wrangler pages project create [PROJECT-NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler pages project create [PROJECT-NAME]
  ```

* yarn

  ```sh
  yarn wrangler pages project create [PROJECT-NAME]
  ```

- `[PROJECT-NAME]` string required

  The name of your Pages project

- `--production-branch` string

  The name of the production branch of your project

- `--compatibility-flags` string alias: --compatibility-flag

  Flags to use for compatibility checks

- `--compatibility-date` string

  Date to use for compatibility checks

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `pages project delete`

Delete a Cloudflare Pages project

* npm

  ```sh
  npx wrangler pages project delete [PROJECT-NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler pages project delete [PROJECT-NAME]
  ```

* yarn

  ```sh
  yarn wrangler pages project delete [PROJECT-NAME]
  ```

- `[PROJECT-NAME]` string required

  The name of your Pages project

- `--yes` boolean alias: --y

  Answer "yes" to confirm project deletion

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `pages deployment list`

List deployments in your Cloudflare Pages project

* npm

  ```sh
  npx wrangler pages deployment list
  ```

* pnpm

  ```sh
  pnpm wrangler pages deployment list
  ```

* yarn

  ```sh
  yarn wrangler pages deployment list
  ```

- `--project-name` string

  The name of the project you would like to list deployments for

- `--environment` string

  Environment type to list deployments for

- `--json` boolean default: false

  Return output as clean JSON

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `pages deployment tail`

Start a tailing session for a project's deployment and livestream logs from your Functions

* npm

  ```sh
  npx wrangler pages deployment tail [DEPLOYMENT]
  ```

* pnpm

  ```sh
  pnpm wrangler pages deployment tail [DEPLOYMENT]
  ```

* yarn

  ```sh
  yarn wrangler pages deployment tail [DEPLOYMENT]
  ```

- `[DEPLOYMENT]` string

  (Optional) ID or URL of the deployment to tail. Specify by environment if deployment ID is unknown.

- `--project-name` string

  The name of the project you would like to tail

- `--environment` string default: production

  When not providing a specific deployment ID, specifying environment will grab the latest production or preview deployment

- `--format` string

  The format of log entries

- `--status` "ok" | "error" | "canceled"

  Filter by invocation status

- `--header` string

  Filter by HTTP header

- `--method` string

  Filter by HTTP method

- `--search` string

  Filter by a text match in console.log messages

- `--sampling-rate` number

  Adds a percentage of requests to log sampling rate

- `--ip` string

  Filter by the IP address the request originates from. Use "self" to filter for your own IP

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `pages deploy`

Deploy a directory of static assets as a Pages deployment

* npm

  ```sh
  npx wrangler pages deploy [DIRECTORY]
  ```

* pnpm

  ```sh
  pnpm wrangler pages deploy [DIRECTORY]
  ```

* yarn

  ```sh
  yarn wrangler pages deploy [DIRECTORY]
  ```

- `[DIRECTORY]` string

  The directory of static files to upload

- `--project-name` string

  The name of the project you want to deploy to

- `--branch` string

  The name of the branch you want to deploy to

- `--commit-hash` string

  The SHA to attach to this deployment

- `--commit-message` string

  The commit message to attach to this deployment

- `--commit-dirty` boolean

  Whether or not the workspace should be considered dirty for this deployment

- `--skip-caching` boolean

  Skip asset caching which speeds up builds

- `--no-bundle` boolean

  Whether to run bundling on `_worker.js` before deploying

- `--upload-source-maps` boolean default: false

  Whether to upload any server-side sourcemaps with this deployment

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `pages secret put`

Create or update a secret variable for a Pages project

* npm

  ```sh
  npx wrangler pages secret put [KEY]
  ```

* pnpm

  ```sh
  pnpm wrangler pages secret put [KEY]
  ```

* yarn

  ```sh
  yarn wrangler pages secret put [KEY]
  ```

- `[KEY]` string required

  The variable name to be accessible in the Pages project

- `--project-name` string aliases: --project

  The name of your Pages project

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `pages secret bulk`

Bulk upload secrets for a Pages project

* npm

  ```sh
  npx wrangler pages secret bulk [FILE]
  ```

* pnpm

  ```sh
  pnpm wrangler pages secret bulk [FILE]
  ```

* yarn

  ```sh
  yarn wrangler pages secret bulk [FILE]
  ```

- `[FILE]` string

  The file of key-value pairs to upload, as JSON in form {"key": value, ...} or .dev.vars file in the form KEY=VALUE

- `--project-name` string aliases: --project

  The name of your Pages project

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `pages secret delete`

Delete a secret variable from a Pages project

* npm

  ```sh
  npx wrangler pages secret delete [KEY]
  ```

* pnpm

  ```sh
  pnpm wrangler pages secret delete [KEY]
  ```

* yarn

  ```sh
  yarn wrangler pages secret delete [KEY]
  ```

- `[KEY]` string required

  The variable name to be accessible in the Pages project

- `--project-name` string aliases: --project

  The name of your Pages project

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `pages secret list`

List all secrets for a Pages project

* npm

  ```sh
  npx wrangler pages secret list
  ```

* pnpm

  ```sh
  pnpm wrangler pages secret list
  ```

* yarn

  ```sh
  yarn wrangler pages secret list
  ```

- `--project-name` string aliases: --project

  The name of your Pages project

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `pages download config`

Experimental

Download your Pages project config as a Wrangler configuration file

* npm

  ```sh
  npx wrangler pages download config [PROJECTNAME]
  ```

* pnpm

  ```sh
  pnpm wrangler pages download config [PROJECTNAME]
  ```

* yarn

  ```sh
  yarn wrangler pages download config [PROJECTNAME]
  ```

- `[PROJECTNAME]` string

  The Pages project to download

- `--force` boolean

  Overwrite an existing Wrangler configuration file without prompting

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

***

## `pipelines`

Manage your [Pipelines](https://developers.cloudflare.com/pipelines/).

### `pipelines setup`

Interactive setup for a complete pipeline

* npm

  ```sh
  npx wrangler pipelines setup
  ```

* pnpm

  ```sh
  pnpm wrangler pipelines setup
  ```

* yarn

  ```sh
  yarn wrangler pipelines setup
  ```

- `--name` string

  Pipeline name

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `pipelines create`

Create a new pipeline

* npm

  ```sh
  npx wrangler pipelines create [PIPELINE]
  ```

* pnpm

  ```sh
  pnpm wrangler pipelines create [PIPELINE]
  ```

* yarn

  ```sh
  yarn wrangler pipelines create [PIPELINE]
  ```

- `[PIPELINE]` string required

  The name of the pipeline to create

- `--sql` string

  Inline SQL query for the pipeline

- `--sql-file` string

  Path to file containing SQL query for the pipeline

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `pipelines list`

List all pipelines

* npm

  ```sh
  npx wrangler pipelines list
  ```

* pnpm

  ```sh
  pnpm wrangler pipelines list
  ```

* yarn

  ```sh
  yarn wrangler pipelines list
  ```

- `--page` number default: 1

  Page number for pagination

- `--per-page` number default: 20

  Number of pipelines per page

- `--json` boolean default: false

  Output in JSON format

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `pipelines get`

Get details about a specific pipeline

* npm

  ```sh
  npx wrangler pipelines get [PIPELINE]
  ```

* pnpm

  ```sh
  pnpm wrangler pipelines get [PIPELINE]
  ```

* yarn

  ```sh
  yarn wrangler pipelines get [PIPELINE]
  ```

- `[PIPELINE]` string required

  The ID of the pipeline to retrieve

- `--json` boolean default: false

  Output in JSON format

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `pipelines update`

Update a pipeline configuration (legacy pipelines only)

* npm

  ```sh
  npx wrangler pipelines update [PIPELINE]
  ```

* pnpm

  ```sh
  pnpm wrangler pipelines update [PIPELINE]
  ```

* yarn

  ```sh
  yarn wrangler pipelines update [PIPELINE]
  ```

- `[PIPELINE]` string required

  The name of the legacy pipeline to update

- `--source` array

  Space separated list of allowed sources. Options are 'http' or 'worker'

- `--require-http-auth` boolean

  Require Cloudflare API Token for HTTPS endpoint authentication

- `--cors-origins` array

  CORS origin allowlist for HTTP endpoint (use \* for any origin). Defaults to an empty array

- `--batch-max-mb` number

  Maximum batch size in megabytes before flushing. Defaults to 100 MB if unset. Minimum: 1, Maximum: 100

- `--batch-max-rows` number

  Maximum number of rows per batch before flushing. Defaults to 10,000,000 if unset. Minimum: 100, Maximum: 10,000,000

- `--batch-max-seconds` number

  Maximum age of batch in seconds before flushing. Defaults to 300 if unset. Minimum: 1, Maximum: 300

- `--r2-bucket` string

  Destination R2 bucket name

- `--r2-access-key-id` string

  R2 service Access Key ID for authentication. Leave empty for OAuth confirmation.

- `--r2-secret-access-key` string

  R2 service Secret Access Key for authentication. Leave empty for OAuth confirmation.

- `--r2-prefix` string

  Prefix for storing files in the destination bucket. Default is no prefix

- `--compression` string

  Compression format for output files

- `--shard-count` number

  Number of shards for the pipeline. More shards handle higher request volume; fewer shards produce larger output files. Defaults to 2 if unset. Minimum: 1, Maximum: 15

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `pipelines delete`

Delete a pipeline

* npm

  ```sh
  npx wrangler pipelines delete [PIPELINE]
  ```

* pnpm

  ```sh
  pnpm wrangler pipelines delete [PIPELINE]
  ```

* yarn

  ```sh
  yarn wrangler pipelines delete [PIPELINE]
  ```

- `[PIPELINE]` string required

  The ID or name of the pipeline to delete

- `--force` boolean alias: --y default: false

  Skip confirmation

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `pipelines streams create`

Create a new stream

* npm

  ```sh
  npx wrangler pipelines streams create [STREAM]
  ```

* pnpm

  ```sh
  pnpm wrangler pipelines streams create [STREAM]
  ```

* yarn

  ```sh
  yarn wrangler pipelines streams create [STREAM]
  ```

- `[STREAM]` string required

  The name of the stream to create

- `--schema-file` string

  Path to JSON file containing stream schema

- `--http-enabled` boolean default: true

  Enable HTTP endpoint

- `--http-auth` boolean default: true

  Require authentication for HTTP endpoint

- `--cors-origin` string

  CORS origin

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `pipelines streams list`

List all streams

* npm

  ```sh
  npx wrangler pipelines streams list
  ```

* pnpm

  ```sh
  pnpm wrangler pipelines streams list
  ```

* yarn

  ```sh
  yarn wrangler pipelines streams list
  ```

- `--page` number default: 1

  Page number for pagination

- `--per-page` number default: 20

  Number of streams per page

- `--pipeline-id` string

  Filter streams by pipeline ID

- `--json` boolean default: false

  Output in JSON format

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `pipelines streams get`

Get details about a specific stream

* npm

  ```sh
  npx wrangler pipelines streams get [STREAM]
  ```

* pnpm

  ```sh
  pnpm wrangler pipelines streams get [STREAM]
  ```

* yarn

  ```sh
  yarn wrangler pipelines streams get [STREAM]
  ```

- `[STREAM]` string required

  The ID of the stream to retrieve

- `--json` boolean default: false

  Output in JSON format

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `pipelines streams delete`

Delete a stream

* npm

  ```sh
  npx wrangler pipelines streams delete [STREAM]
  ```

* pnpm

  ```sh
  pnpm wrangler pipelines streams delete [STREAM]
  ```

* yarn

  ```sh
  yarn wrangler pipelines streams delete [STREAM]
  ```

- `[STREAM]` string required

  The ID of the stream to delete

- `--force` boolean alias: --y default: false

  Skip confirmation

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `pipelines sinks create`

Create a new sink

* npm

  ```sh
  npx wrangler pipelines sinks create [SINK]
  ```

* pnpm

  ```sh
  pnpm wrangler pipelines sinks create [SINK]
  ```

* yarn

  ```sh
  yarn wrangler pipelines sinks create [SINK]
  ```

- `[SINK]` string required

  The name of the sink to create

- `--type` string required

  The type of sink to create

- `--bucket` string required

  R2 bucket name

- `--format` string default: parquet

  Output format

- `--compression` string default: zstd

  Compression method (parquet only)

- `--target-row-group-size` string

  Target row group size for parquet format

- `--path` string

  The base prefix in your bucket where data will be written

- `--partitioning` string

  Time partition pattern (r2 sinks only)

- `--roll-size` number

  Roll file size in MB

- `--roll-interval` number default: 300

  Roll file interval in seconds

- `--access-key-id` string

  R2 access key ID (leave empty for R2 credentials to be automatically created)

- `--secret-access-key` string

  R2 secret access key (leave empty for R2 credentials to be automatically created)

- `--namespace` string

  Data catalog namespace (required for r2-data-catalog)

- `--table` string

  Table name within namespace (required for r2-data-catalog)

- `--catalog-token` string

  Authentication token for data catalog (required for r2-data-catalog)

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `pipelines sinks list`

List all sinks

* npm

  ```sh
  npx wrangler pipelines sinks list
  ```

* pnpm

  ```sh
  pnpm wrangler pipelines sinks list
  ```

* yarn

  ```sh
  yarn wrangler pipelines sinks list
  ```

- `--page` number default: 1

  Page number for pagination

- `--per-page` number default: 20

  Number of sinks per page

- `--pipeline-id` string

  Filter sinks by pipeline ID

- `--json` boolean default: false

  Output in JSON format

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `pipelines sinks get`

Get details about a specific sink

* npm

  ```sh
  npx wrangler pipelines sinks get [SINK]
  ```

* pnpm

  ```sh
  pnpm wrangler pipelines sinks get [SINK]
  ```

* yarn

  ```sh
  yarn wrangler pipelines sinks get [SINK]
  ```

- `[SINK]` string required

  The ID of the sink to retrieve

- `--json` boolean default: false

  Output in JSON format

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `pipelines sinks delete`

Delete a sink

* npm

  ```sh
  npx wrangler pipelines sinks delete [SINK]
  ```

* pnpm

  ```sh
  pnpm wrangler pipelines sinks delete [SINK]
  ```

* yarn

  ```sh
  yarn wrangler pipelines sinks delete [SINK]
  ```

- `[SINK]` string required

  The ID of the sink to delete

- `--force` boolean alias: --y default: false

  Skip confirmation

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

***

## `queues`

Manage your Workers [Queues](https://developers.cloudflare.com/queues/) configurations.

### `queues list`

List queues

* npm

  ```sh
  npx wrangler queues list
  ```

* pnpm

  ```sh
  pnpm wrangler queues list
  ```

* yarn

  ```sh
  yarn wrangler queues list
  ```

- `--page` number

  Page number for pagination

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `queues create`

Create a queue

* npm

  ```sh
  npx wrangler queues create [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler queues create [NAME]
  ```

* yarn

  ```sh
  yarn wrangler queues create [NAME]
  ```

- `[NAME]` string required

  The name of the queue

- `--delivery-delay-secs` number default: 0

  How long a published message should be delayed for, in seconds. Must be between 0 and 42300

- `--message-retention-period-secs` number default: 345600

  How long to retain a message in the queue, in seconds. Must be between 60 and 1209600

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `queues update`

Update a queue

* npm

  ```sh
  npx wrangler queues update [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler queues update [NAME]
  ```

* yarn

  ```sh
  yarn wrangler queues update [NAME]
  ```

- `[NAME]` string required

  The name of the queue

- `--delivery-delay-secs` number

  How long a published message should be delayed for, in seconds. Must be between 0 and 42300

- `--message-retention-period-secs` number

  How long to retain a message in the queue, in seconds. Must be between 60 and 1209600

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `queues delete`

Delete a queue

* npm

  ```sh
  npx wrangler queues delete [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler queues delete [NAME]
  ```

* yarn

  ```sh
  yarn wrangler queues delete [NAME]
  ```

- `[NAME]` string required

  The name of the queue

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `queues info`

Get queue information

* npm

  ```sh
  npx wrangler queues info [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler queues info [NAME]
  ```

* yarn

  ```sh
  yarn wrangler queues info [NAME]
  ```

- `[NAME]` string required

  The name of the queue

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `queues consumer add`

Add a Queue Worker Consumer

* npm

  ```sh
  npx wrangler queues consumer add [QUEUE-NAME] [SCRIPT-NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler queues consumer add [QUEUE-NAME] [SCRIPT-NAME]
  ```

* yarn

  ```sh
  yarn wrangler queues consumer add [QUEUE-NAME] [SCRIPT-NAME]
  ```

- `[QUEUE-NAME]` string required

  Name of the queue to configure

- `[SCRIPT-NAME]` string required

  Name of the consumer script

- `--batch-size` number

  Maximum number of messages per batch

- `--batch-timeout` number

  Maximum number of seconds to wait to fill a batch with messages

- `--message-retries` number

  Maximum number of retries for each message

- `--dead-letter-queue` string

  Queue to send messages that failed to be consumed

- `--max-concurrency` number

  The maximum number of concurrent consumer Worker invocations. Must be a positive integer

- `--retry-delay-secs` number

  The number of seconds to wait before retrying a message

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `queues consumer remove`

Remove a Queue Worker Consumer

* npm

  ```sh
  npx wrangler queues consumer remove [QUEUE-NAME] [SCRIPT-NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler queues consumer remove [QUEUE-NAME] [SCRIPT-NAME]
  ```

* yarn

  ```sh
  yarn wrangler queues consumer remove [QUEUE-NAME] [SCRIPT-NAME]
  ```

- `[QUEUE-NAME]` string required

  Name of the queue to configure

- `[SCRIPT-NAME]` string required

  Name of the consumer script

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `queues consumer http add`

Add a Queue HTTP Pull Consumer

* npm

  ```sh
  npx wrangler queues consumer http add [QUEUE-NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler queues consumer http add [QUEUE-NAME]
  ```

* yarn

  ```sh
  yarn wrangler queues consumer http add [QUEUE-NAME]
  ```

- `[QUEUE-NAME]` string required

  Name of the queue for the consumer

- `--batch-size` number

  Maximum number of messages per batch

- `--message-retries` number

  Maximum number of retries for each message

- `--dead-letter-queue` string

  Queue to send messages that failed to be consumed

- `--visibility-timeout-secs` number

  The number of seconds a message will wait for an acknowledgement before being returned to the queue.

- `--retry-delay-secs` number

  The number of seconds to wait before retrying a message

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `queues consumer http remove`

Remove a Queue HTTP Pull Consumer

* npm

  ```sh
  npx wrangler queues consumer http remove [QUEUE-NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler queues consumer http remove [QUEUE-NAME]
  ```

* yarn

  ```sh
  yarn wrangler queues consumer http remove [QUEUE-NAME]
  ```

- `[QUEUE-NAME]` string required

  Name of the queue for the consumer

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `queues consumer worker add`

Add a Queue Worker Consumer

* npm

  ```sh
  npx wrangler queues consumer worker add [QUEUE-NAME] [SCRIPT-NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler queues consumer worker add [QUEUE-NAME] [SCRIPT-NAME]
  ```

* yarn

  ```sh
  yarn wrangler queues consumer worker add [QUEUE-NAME] [SCRIPT-NAME]
  ```

- `[QUEUE-NAME]` string required

  Name of the queue to configure

- `[SCRIPT-NAME]` string required

  Name of the consumer script

- `--batch-size` number

  Maximum number of messages per batch

- `--batch-timeout` number

  Maximum number of seconds to wait to fill a batch with messages

- `--message-retries` number

  Maximum number of retries for each message

- `--dead-letter-queue` string

  Queue to send messages that failed to be consumed

- `--max-concurrency` number

  The maximum number of concurrent consumer Worker invocations. Must be a positive integer

- `--retry-delay-secs` number

  The number of seconds to wait before retrying a message

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `queues consumer worker remove`

Remove a Queue Worker Consumer

* npm

  ```sh
  npx wrangler queues consumer worker remove [QUEUE-NAME] [SCRIPT-NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler queues consumer worker remove [QUEUE-NAME] [SCRIPT-NAME]
  ```

* yarn

  ```sh
  yarn wrangler queues consumer worker remove [QUEUE-NAME] [SCRIPT-NAME]
  ```

- `[QUEUE-NAME]` string required

  Name of the queue to configure

- `[SCRIPT-NAME]` string required

  Name of the consumer script

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `queues pause-delivery`

Pause message delivery for a queue

* npm

  ```sh
  npx wrangler queues pause-delivery [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler queues pause-delivery [NAME]
  ```

* yarn

  ```sh
  yarn wrangler queues pause-delivery [NAME]
  ```

- `[NAME]` string required

  The name of the queue

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `queues resume-delivery`

Resume message delivery for a queue

* npm

  ```sh
  npx wrangler queues resume-delivery [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler queues resume-delivery [NAME]
  ```

* yarn

  ```sh
  yarn wrangler queues resume-delivery [NAME]
  ```

- `[NAME]` string required

  The name of the queue

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `queues purge`

Purge messages from a queue

* npm

  ```sh
  npx wrangler queues purge [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler queues purge [NAME]
  ```

* yarn

  ```sh
  yarn wrangler queues purge [NAME]
  ```

- `[NAME]` string required

  The name of the queue

- `--force` boolean

  Skip the confirmation dialog and forcefully purge the Queue

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `queues subscription create`

Create a new event subscription for a queue

* npm

  ```sh
  npx wrangler queues subscription create [QUEUE]
  ```

* pnpm

  ```sh
  pnpm wrangler queues subscription create [QUEUE]
  ```

* yarn

  ```sh
  yarn wrangler queues subscription create [QUEUE]
  ```

- `[QUEUE]` string required

  The name of the queue to create the subscription for

- `--source` string required

  The event source type

- `--events` string required

  Comma-separated list of event types to subscribe to

- `--name` string

  Name for the subscription (auto-generated if not provided)

- `--enabled` boolean default: true

  Whether the subscription should be active

- `--model-name` string

  Workers AI model name (required for workersAi.model source)

- `--worker-name` string

  Worker name (required for workersBuilds.worker source)

- `--workflow-name` string

  Workflow name (required for workflows.workflow source)

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `queues subscription list`

List event subscriptions for a queue

* npm

  ```sh
  npx wrangler queues subscription list [QUEUE]
  ```

* pnpm

  ```sh
  pnpm wrangler queues subscription list [QUEUE]
  ```

* yarn

  ```sh
  yarn wrangler queues subscription list [QUEUE]
  ```

- `[QUEUE]` string required

  The name of the queue to list subscriptions for

- `--page` number default: 1

  Page number for pagination

- `--per-page` number default: 20

  Number of subscriptions per page

- `--json` boolean default: false

  Output in JSON format

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `queues subscription get`

Get details about a specific event subscription

* npm

  ```sh
  npx wrangler queues subscription get [QUEUE]
  ```

* pnpm

  ```sh
  pnpm wrangler queues subscription get [QUEUE]
  ```

* yarn

  ```sh
  yarn wrangler queues subscription get [QUEUE]
  ```

- `[QUEUE]` string required

  The name of the queue

- `--id` string required

  The ID of the subscription to retrieve

- `--json` boolean default: false

  Output in JSON format

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `queues subscription delete`

Delete an event subscription from a queue

* npm

  ```sh
  npx wrangler queues subscription delete [QUEUE]
  ```

* pnpm

  ```sh
  pnpm wrangler queues subscription delete [QUEUE]
  ```

* yarn

  ```sh
  yarn wrangler queues subscription delete [QUEUE]
  ```

- `[QUEUE]` string required

  The name of the queue

- `--id` string required

  The ID of the subscription to delete

- `--force` boolean alias: --y default: false

  Skip confirmation

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `queues subscription update`

Update an existing event subscription

* npm

  ```sh
  npx wrangler queues subscription update [QUEUE]
  ```

* pnpm

  ```sh
  pnpm wrangler queues subscription update [QUEUE]
  ```

* yarn

  ```sh
  yarn wrangler queues subscription update [QUEUE]
  ```

- `[QUEUE]` string required

  The name of the queue

- `--id` string required

  The ID of the subscription to update

- `--name` string

  New name for the subscription

- `--events` string

  Comma-separated list of event types to subscribe to

- `--enabled` boolean

  Whether the subscription should be active

- `--json` boolean default: false

  Output in JSON format

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

***

## `login`

Authorize Wrangler with your Cloudflare account using OAuth. Wrangler will attempt to automatically open your web browser to login with your Cloudflare account.

If you prefer to use API tokens for authentication, such as in headless or continuous integration environments, refer to [Running Wrangler in CI/CD](https://developers.cloudflare.com/workers/ci-cd/).

```txt
wrangler login [OPTIONS]
```

* `--scopes-list` string optional
  * List all the available OAuth scopes with descriptions.
* `--scopes` string optional
  * Allows to choose your set of OAuth scopes. The set of scopes must be entered in a whitespace-separated list, for example, `npx wrangler login --scopes account:read user:read`.
* `--callback-host` string optional
  * Defaults to `localhost`. Sets the IP or hostname where Wrangler should listen for the OAuth callback.
* `--callback-port` string optional
  * Defaults to `8976`. Sets the port where Wrangler should listen for the OAuth callback.

Note

`wrangler login` uses all the available scopes by default if no flags are provided.

The following global flags work on every command:

* `--help` boolean
  * Show help.
* `--config` string (not supported by Pages)
  * Path to your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/).
* `--cwd` string
  * Run as if Wrangler was started in the specified directory instead of the current working directory.

If Wrangler fails to open a browser, you can copy and paste the URL generated by `wrangler login` in your terminal into a browser and log in.

### Use `wrangler login` on a remote machine

If you are using Wrangler from a remote machine, but run the login flow from your local browser, you will receive the following error message after logging in:`This site can't be reached`.

To finish the login flow, run `wrangler login` and go through the login flow in the browser:

```sh
npx wrangler login
```

```sh
 ⛅️ wrangler 2.1.6
-------------------
Attempting to login via OAuth...
Opening a link in your default browser: https://dash.cloudflare.com/oauth2/auth?xyz...
```

The browser login flow will redirect you to a `localhost` URL on your machine.

Leave the login flow active. Open a second terminal session. In that second terminal session, use `curl` or an equivalent request library on the remote machine to fetch this `localhost` URL. Copy and paste the `localhost` URL that was generated during the `wrangler login` flow and run:

```sh
curl <LOCALHOST_URL>
```

***

## `logout`

Remove Wrangler's authorization for accessing your account. This command will invalidate your current OAuth token.

```txt
wrangler logout
```

The following global flags work on every command:

* `--help` boolean
  * Show help.
* `--config` string (not supported by Pages)
  * Path to your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/).
* `--cwd` string
  * Run as if Wrangler was started in the specified directory instead of the current working directory.

If you are using `CLOUDFLARE_API_TOKEN` instead of OAuth, and you can logout by deleting your API token in the Cloudflare dashboard:

1. In the Cloudflare dashboard, go to the **Account API tokens** page.

   [Go to **Account API tokens**](https://dash.cloudflare.com/?to=/:account/api-tokens)

2. Select the three-dot menu on your Wrangler token.

3. Select **Delete**.

***

## `whoami`

🕵️ Retrieve your user information

* npm

  ```sh
  npx wrangler whoami
  ```

* pnpm

  ```sh
  pnpm wrangler whoami
  ```

* yarn

  ```sh
  yarn wrangler whoami
  ```

- `--account` string

  Show membership information for the given account (id or name).

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

***

## `versions`

Note

The minimum required wrangler version to use these commands is 3.40.0. For versions before 3.73.0, you will need to add the `--x-versions` flag.

### `versions upload`

Upload a new [version](https://developers.cloudflare.com/workers/configuration/versions-and-deployments/#versions) of your Worker that is not deployed immediately.

* npm

  ```sh
  npx wrangler versions upload [SCRIPT]
  ```

* pnpm

  ```sh
  pnpm wrangler versions upload [SCRIPT]
  ```

* yarn

  ```sh
  yarn wrangler versions upload [SCRIPT]
  ```

- `[SCRIPT]` string

  The path to an entry point for your Worker

- `--name` string

  Name of the Worker

- `--tag` string

  A tag for this Worker Gradual Rollouts Version

- `--message` string

  A descriptive message for this Worker Gradual Rollouts Version

- `--preview-alias` string

  Name of an alias for this Worker version

- `--no-bundle` boolean default: false

  Skip internal build steps and directly upload Worker

- `--outdir` string

  Output directory for the bundled Worker

- `--outfile` string

  Output file for the bundled worker

- `--compatibility-date` string

  Date to use for compatibility checks

- `--compatibility-flags` string alias: --compatibility-flag

  Flags to use for compatibility checks

- `--latest` boolean default: false

  Use the latest version of the Worker runtime

- `--assets` string

  Static assets to be served. Replaces Workers Sites.

- `--var` string

  A key-value pair to be injected into the script as a variable

- `--define` string

  A key-value pair to be substituted in the script

- `--alias` string

  A module pair to be substituted in the script

- `--jsx-factory` string

  The function that is called for each JSX element

- `--jsx-fragment` string

  The function that is called for each JSX fragment

- `--tsconfig` string

  Path to a custom tsconfig.json file

- `--minify` boolean

  Minify the Worker

- `--upload-source-maps` boolean

  Include source maps when uploading this Worker Gradual Rollouts Version.

- `--dry-run` boolean

  Compile a project without actually uploading the version.

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `versions deploy`

Deploy a previously created [version](https://developers.cloudflare.com/workers/configuration/versions-and-deployments/#versions) of your Worker all at once or create a [gradual deployment](https://developers.cloudflare.com/workers/configuration/versions-and-deployments/gradual-deployments/) to incrementally shift traffic to a new version by following an interactive prompt.

* npm

  ```sh
  npx wrangler versions deploy [VERSION-SPECS]
  ```

* pnpm

  ```sh
  pnpm wrangler versions deploy [VERSION-SPECS]
  ```

* yarn

  ```sh
  yarn wrangler versions deploy [VERSION-SPECS]
  ```

- `--name` string

  Name of the worker

- `--version-id` string

  Worker Version ID(s) to deploy

- `--percentage` number

  Percentage of traffic to split between Worker Version(s) (0-100)

- `[VERSION-SPECS]` string

  Shorthand notation to deploy Worker Version(s) \[\<version-id>@\<percentage>..]

- `--message` string

  Description of this deployment (optional)

- `--yes` boolean alias: --y default: false

  Automatically accept defaults to prompts

- `--dry-run` boolean default: false

  Don't actually deploy

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

Note

The non-interactive version of this prompt is: `wrangler versions deploy version-id-1@percentage-1% version-id-2@percentage-2 -y`

For example: `wrangler versions deploy 095f00a7-23a7-43b7-a227-e4c97cab5f22@10% 1a88955c-2fbd-4a72-9d9b-3ba1e59842f2@90% -y`

### `versions list`

Retrieve details for the 10 most recent versions. Details include `Version ID`, `Created on`, `Author`, `Source`, and optionally, `Tag` or `Message`.

* npm

  ```sh
  npx wrangler versions list
  ```

* pnpm

  ```sh
  pnpm wrangler versions list
  ```

* yarn

  ```sh
  yarn wrangler versions list
  ```

- `--name` string

  Name of the Worker

- `--json` boolean default: false

  Display output as clean JSON

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `versions view`

View the details of a specific version of your Worker

* npm

  ```sh
  npx wrangler versions view [VERSION-ID]
  ```

* pnpm

  ```sh
  pnpm wrangler versions view [VERSION-ID]
  ```

* yarn

  ```sh
  yarn wrangler versions view [VERSION-ID]
  ```

- `[VERSION-ID]` string required

  The Worker Version ID to view

- `--name` string

  Name of the worker

- `--json` boolean default: false

  Display output as clean JSON

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `versions secret put`

Create or update a secret variable for a Worker

* npm

  ```sh
  npx wrangler versions secret put [KEY]
  ```

* pnpm

  ```sh
  pnpm wrangler versions secret put [KEY]
  ```

* yarn

  ```sh
  yarn wrangler versions secret put [KEY]
  ```

- `[KEY]` string

  The variable name to be accessible in the Worker

- `--name` string

  Name of the Worker

- `--message` string

  Description of this deployment

- `--tag` string

  A tag for this version

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `versions secret delete`

Delete a secret variable from a Worker

* npm

  ```sh
  npx wrangler versions secret delete [KEY]
  ```

* pnpm

  ```sh
  pnpm wrangler versions secret delete [KEY]
  ```

* yarn

  ```sh
  yarn wrangler versions secret delete [KEY]
  ```

- `[KEY]` string

  The variable name to be accessible in the Worker

- `--name` string

  Name of the Worker

- `--message` string

  Description of this deployment

- `--tag` string

  A tag for this version

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `versions secret bulk`

Create or update a secret variable for a Worker

* npm

  ```sh
  npx wrangler versions secret bulk [FILE]
  ```

* pnpm

  ```sh
  pnpm wrangler versions secret bulk [FILE]
  ```

* yarn

  ```sh
  yarn wrangler versions secret bulk [FILE]
  ```

- `[FILE]` string

  The file of key-value pairs to upload, as JSON in form {"key": value, ...} or .dev.vars file in the form KEY=VALUE

- `--name` string

  Name of the Worker

- `--message` string

  Description of this deployment

- `--tag` string

  A tag for this version

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

***

## `triggers`

Note

The minimum required wrangler version to use these commands is 3.40.0. For versions before 3.73.0, you will need to add the `--x-versions` flag.

### `triggers deploy`

Experimental

Updates the triggers of your current deployment

* npm

  ```sh
  npx wrangler triggers deploy
  ```

* pnpm

  ```sh
  pnpm wrangler triggers deploy
  ```

* yarn

  ```sh
  yarn wrangler triggers deploy
  ```

- `--name` string

  Name of the worker

- `--triggers` string aliases: --schedule, --schedules

  cron schedules to attach

- `--routes` string alias: --route

  Routes to upload

- `--dry-run` boolean

  Don't actually deploy

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

***

## `deployments`

[Deployments](https://developers.cloudflare.com/workers/configuration/versions-and-deployments/#deployments) track the version(s) of your Worker that are actively serving traffic.

Note

The minimum required wrangler version to use these commands is 3.40.0. For versions before 3.73.0, you will need to add the `--x-versions` flag.

### `deployments list`

Displays the 10 most recent deployments of your Worker

* npm

  ```sh
  npx wrangler deployments list
  ```

* pnpm

  ```sh
  pnpm wrangler deployments list
  ```

* yarn

  ```sh
  yarn wrangler deployments list
  ```

- `--name` string

  Name of the Worker

- `--json` boolean default: false

  Display output as clean JSON

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `deployments status`

View the current state of your production

* npm

  ```sh
  npx wrangler deployments status
  ```

* pnpm

  ```sh
  pnpm wrangler deployments status
  ```

* yarn

  ```sh
  yarn wrangler deployments status
  ```

- `--name` string

  Name of the Worker

- `--json` boolean default: false

  Display output as clean JSON

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

## `rollback`

Warning

A rollback will immediately create a new deployment with the specified version of your Worker and become the active deployment across all your deployed routes and domains. This change will not affect work in your local development environment.

```txt
wrangler rollback [<VERSION_ID>] [OPTIONS]
```

* `VERSION_ID` string optional
  * The ID of the version you wish to roll back to. If not supplied, the `rollback` command defaults to the version uploaded before the latest version.
* `--name` string optional
  * Perform on a specific Worker rather than inheriting from the [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/).
* `--message` string optional
  * Add message for rollback. Accepts empty string. When specified, interactive prompts for rollback confirmation and message are skipped.

The following global flags work on every command:

* `--help` boolean
  * Show help.
* `--config` string (not supported by Pages)
  * Path to your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/).
* `--cwd` string
  * Run as if Wrangler was started in the specified directory instead of the current working directory.

***

## dispatch namespace

### `dispatch-namespace list`

List all dispatch namespaces

* npm

  ```sh
  npx wrangler dispatch-namespace list
  ```

* pnpm

  ```sh
  pnpm wrangler dispatch-namespace list
  ```

* yarn

  ```sh
  yarn wrangler dispatch-namespace list
  ```

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `dispatch-namespace get`

Get information about a dispatch namespace

* npm

  ```sh
  npx wrangler dispatch-namespace get [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler dispatch-namespace get [NAME]
  ```

* yarn

  ```sh
  yarn wrangler dispatch-namespace get [NAME]
  ```

- `[NAME]` string required

  Name of the dispatch namespace

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `dispatch-namespace create`

Create a dispatch namespace

* npm

  ```sh
  npx wrangler dispatch-namespace create [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler dispatch-namespace create [NAME]
  ```

* yarn

  ```sh
  yarn wrangler dispatch-namespace create [NAME]
  ```

- `[NAME]` string required

  Name of the dispatch namespace

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

### `dispatch-namespace delete`

Delete a dispatch namespace

* npm

  ```sh
  npx wrangler dispatch-namespace delete [NAME]
  ```

* pnpm

  ```sh
  pnpm wrangler dispatch-namespace delete [NAME]
  ```

* yarn

  ```sh
  yarn wrangler dispatch-namespace delete [NAME]
  ```

- `[NAME]` string required

  Name of the dispatch namespace

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

Note

You must delete all user Workers in the dispatch namespace before it can be deleted.

### `dispatch-namespace rename`

Rename a dispatch namespace

* npm

  ```sh
  npx wrangler dispatch-namespace rename [OLDNAME] [NEWNAME]
  ```

* pnpm

  ```sh
  pnpm wrangler dispatch-namespace rename [OLDNAME] [NEWNAME]
  ```

* yarn

  ```sh
  yarn wrangler dispatch-namespace rename [OLDNAME] [NEWNAME]
  ```

- `[OLDNAME]` string required

  Name of the dispatch namespace

- `[NEWNAME]` string required

  New name of the dispatch namespace

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

***

## `mtls-certificate`

Manage client certificates used for mTLS connections in subrequests.

These certificates can be used in [`mtls_certificate` bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/mtls), which allow a Worker to present the certificate when establishing a connection with an origin that requires client authentication (mTLS).

### `mtls-certificate upload`

Upload an mTLS certificate

* npm

  ```sh
  npx wrangler mtls-certificate upload
  ```

* pnpm

  ```sh
  pnpm wrangler mtls-certificate upload
  ```

* yarn

  ```sh
  yarn wrangler mtls-certificate upload
  ```

- `--cert` string required

  The path to a certificate file (.pem) containing a chain of certificates to upload

- `--key` string required

  The path to a file containing the private key for your leaf certificate

- `--name` string

  The name for the certificate

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

The following is an example of using the `upload` command to upload an mTLS certificate.

```sh
npx wrangler mtls-certificate upload --cert cert.pem --key key.pem --name my-origin-cert
```

```sh
Uploading mTLS Certificate my-origin-cert...
Success! Uploaded mTLS Certificate my-origin-cert
ID: 99f5fef1-6cc1-46b8-bd79-44a0d5082b8d
Issuer: CN=my-secured-origin.com,OU=my-team,O=my-org,L=San Francisco,ST=California,C=US
Expires: 1/01/2025
```

You can then add this certificate as a [binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/) in your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/):

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "mtls_certificates": [
      {
        "binding": "MY_CERT",
        "certificate_id": "99f5fef1-6cc1-46b8-bd79-44a0d5082b8d"
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  mtls_certificates = [
    { binding = "MY_CERT", certificate_id = "99f5fef1-6cc1-46b8-bd79-44a0d5082b8d" }
  ]
  ```

Note that the certificate and private keys must be in separate (typically `.pem`) files when uploading.

### `mtls-certificate list`

List uploaded mTLS certificates

* npm

  ```sh
  npx wrangler mtls-certificate list
  ```

* pnpm

  ```sh
  pnpm wrangler mtls-certificate list
  ```

* yarn

  ```sh
  yarn wrangler mtls-certificate list
  ```

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

The following is an example of using the `list` command to upload an mTLS certificate.

```sh
npx wrangler mtls-certificate list
```

```sh
ID: 99f5fef1-6cc1-46b8-bd79-44a0d5082b8d
Name: my-origin-cert
Issuer: CN=my-secured-origin.com,OU=my-team,O=my-org,L=San Francisco,ST=California,C=US
Created on: 1/01/2023
Expires: 1/01/2025


ID: c5d004d1-8312-402c-b8ed-6194328d5cbe
Issuer: CN=another-origin.com,OU=my-team,O=my-org,L=San Francisco,ST=California,C=US
Created on: 1/01/2023
Expires: 1/01/2025
```

### `mtls-certificate delete`

Delete an mTLS certificate

* npm

  ```sh
  npx wrangler mtls-certificate delete
  ```

* pnpm

  ```sh
  pnpm wrangler mtls-certificate delete
  ```

* yarn

  ```sh
  yarn wrangler mtls-certificate delete
  ```

- `--id` string

  The id of the mTLS certificate to delete

- `--name` string

  The name of the mTLS certificate record to delete

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

The following is an example of using the `delete` command to delete an mTLS certificate.

```sh
npx wrangler mtls-certificate delete --id 99f5fef1-6cc1-46b8-bd79-44a0d5082b8d
```

```sh
Are you sure you want to delete certificate 99f5fef1-6cc1-46b8-bd79-44a0d5082b8d (my-origin-cert)? [y/n]
yes
Deleting certificate 99f5fef1-6cc1-46b8-bd79-44a0d5082b8d...
Deleted certificate 99f5fef1-6cc1-46b8-bd79-44a0d5082b8d successfully
```

***

## `cert`

Manage mTLS client certificates and Certificate Authority (CA) chain certificates used for secured connections.

These certificates can be used in Hyperdrive configurations, enabling them to present the certificate when connecting to an origin database that requires client authentication (mTLS) or a custom Certificate Authority (CA).

### `cert upload mtls-certificate`

Upload an mTLS certificate

* npm

  ```sh
  npx wrangler cert upload mtls-certificate
  ```

* pnpm

  ```sh
  pnpm wrangler cert upload mtls-certificate
  ```

* yarn

  ```sh
  yarn wrangler cert upload mtls-certificate
  ```

- `--cert` string required

  The path to a certificate file (.pem) containing a chain of certificates to upload

- `--key` string required

  The path to a file containing the private key for your leaf certificate

- `--name` string

  The name for the certificate

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

The following is an example of using the `upload` command to upload an mTLS certificate.

```sh
npx wrangler cert upload --cert cert.pem --key key.pem --name my-origin-cert
```

```sh
Uploading mTLS Certificate my-origin-cert...
Success! Uploaded mTLS Certificate my-origin-cert
ID: 99f5fef1-6cc1-46b8-bd79-44a0d5082b8d
Issuer: CN=my-secured-origin.com,OU=my-team,O=my-org,L=San Francisco,ST=California,C=US
Expires: 1/01/2025
```

Note that the certificate and private keys must be in separate (typically `.pem`) files when uploading.

### `cert upload certificate-authority`

Upload a CA certificate chain

* npm

  ```sh
  npx wrangler cert upload certificate-authority
  ```

* pnpm

  ```sh
  pnpm wrangler cert upload certificate-authority
  ```

* yarn

  ```sh
  yarn wrangler cert upload certificate-authority
  ```

- `--name` string

  The name for the certificate

- `--ca-cert` string required

  The path to a certificate file (.pem) containing a chain of CA certificates to upload

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

The following is an example of using the `upload` command to upload an CA certificate.

```sh
npx wrangler cert upload certificate-authority --ca-cert server-ca-chain.pem --name SERVER_CA_CHAIN
```

```sh
Uploading CA Certificate SERVER_CA_CHAIN...
Success! Uploaded CA Certificate SERVER_CA_CHAIN
ID: 99f5fef1-6cc1-46b8-bd79-44a0d5082b8d
Issuer: CN=my-secured-origin.com,OU=my-team,O=my-org,L=San Francisco,ST=California,C=US
Expires: 1/01/2025
```

### `cert list`

List uploaded mTLS certificates

* npm

  ```sh
  npx wrangler cert list
  ```

* pnpm

  ```sh
  pnpm wrangler cert list
  ```

* yarn

  ```sh
  yarn wrangler cert list
  ```

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

The following is an example of using the `list` command to upload an mTLS or CA certificate.

```sh
npx wrangler cert list
```

```sh
ID: 99f5fef1-6cc1-46b8-bd79-44a0d5082b8d
Name: my-origin-cert
Issuer: CN=my-secured-origin.com,OU=my-team,O=my-org,L=San Francisco,ST=California,C=US
Created on: 1/01/2023
Expires: 1/01/2025


ID: c5d004d1-8312-402c-b8ed-6194328d5cbe
Issuer: CN=another-origin.com,OU=my-team,O=my-org,L=San Francisco,ST=California,C=US
Created on: 1/01/2023
Expires: 1/01/2025
```

### `cert delete`

Delete an mTLS certificate

* npm

  ```sh
  npx wrangler cert delete
  ```

* pnpm

  ```sh
  pnpm wrangler cert delete
  ```

* yarn

  ```sh
  yarn wrangler cert delete
  ```

- `--id` string

  The id of the mTLS certificate to delete

- `--name` string

  The name of the mTLS certificate record to delete

Global flags

* `--v` boolean alias: --version

  Show version number

* `--cwd` string

  Run as if Wrangler was started in the specified directory instead of the current working directory

* `--config` string alias: --c

  Path to Wrangler configuration file

* `--env` string alias: --e

  Environment to use for operations, and for selecting .env and .dev.vars files

* `--env-file` string

  Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files

* `--experimental-provision` boolean aliases: --x-provision default: true

  Experimental: Enable automatic resource provisioning

* `--experimental-auto-create` boolean alias: --x-auto-create default: true

  Automatically provision draft bindings with new resources

The following is an example of using the `delete` command to delete an mTLS or CA certificate.

```sh
npx wrangler cert delete --id 99f5fef1-6cc1-46b8-bd79-44a0d5082b8d
```

```sh
Are you sure you want to delete certificate 99f5fef1-6cc1-46b8-bd79-44a0d5082b8d (my-origin-cert)? [y/n]
yes
Deleting certificate 99f5fef1-6cc1-46b8-bd79-44a0d5082b8d...
Deleted certificate 99f5fef1-6cc1-46b8-bd79-44a0d5082b8d successfully
```

***

## `types`

Generate types based on your Worker configuration, including `Env` types based on your bindings, module rules, and [runtime types](https://developers.cloudflare.com/workers/languages/typescript/) based on the`compatibility_date` and `compatibility_flags` in your [config file](https://developers.cloudflare.com/workers/wrangler/configuration/).

```txt
wrangler types [<PATH>] [OPTIONS]
```

Note

If you are running a version of Wrangler that is greater than `3.66.0` but below `4.0.0`, you will need to include the `--experimental-include-runtime` flag. During its experimental release, runtime types were output to a separate file (`.wrangler/types/runtime.d.ts` by default). If you have an older version of Wrangler, you can access runtime types through the `@cloudflare/workers-types` package.

* `PATH` string (default: \`./worker-configuration.d.ts\`)

  * The path to where types for your Worker will be written.
  * The path must have a `d.ts` extension.

* `--env-interface` string (default: \`Env\`)

  * The name of the interface to generate for the environment object.
  * Not valid if the Worker uses the Service Worker syntax.

* `--include-runtime` boolean (default: true)
  * Whether to generate runtime types based on the`compatibility_date` and `compatibility_flags` in your [config file](https://developers.cloudflare.com/workers/wrangler/configuration/).

* `--include-env` boolean (default: true)
  * Whether to generate `Env` types based on your Worker bindings.

* `--strict-vars` boolean optional (default: true)

  * Control the types that Wrangler generates for `vars` bindings.
  * If `true`, (the default) Wrangler generates literal and union types for bindings (e.g. `myVar: 'my dev variable' | 'my prod variable'`).
  * If `false`, Wrangler generates generic types (e.g. `myVar: string`). This is useful when variables change frequently, especially when working across multiple environments.

* `--config`, `-c` string\[] optional

  * Path(s) to [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/). If the Worker you are generating types for has service bindings or bindings to Durable Objects, you can also provide the paths to those configuration files so that the generated `Env` type will include RPC types. For example, given a Worker with a service binding, `wrangler types -c wrangler.toml -c ../bound-worker/wrangler.toml` will generate an `Env` type like this:

  ```ts
  interface Env {
    SERVICE_BINDING: Service<import("../bound-worker/src/index").Entrypoint>;
  }
  ```

***

## `telemetry`

Cloudflare collects anonymous usage data to improve Wrangler. You can learn more about this in our [data policy](https://github.com/cloudflare/workers-sdk/tree/main/packages/wrangler/telemetry.md).

You can manage sharing of usage data at any time using these commands.

### `disable`

Disable telemetry collection for Wrangler.

```txt
wrangler telemetry disable
```

### `enable`

Enable telemetry collection for Wrangler.

```txt
wrangler telemetry enable
```

### `status`

Check whether telemetry collection is currently enabled. The return result is specific to the directory where you have run the command.

This will resolve the global status set by `wrangler telemetry disable / enable`, the environment variable [`WRANGLER_SEND_METRICS`](https://developers.cloudflare.com/workers/wrangler/system-environment-variables/#supported-environment-variables), and the [`send_metrics`](https://developers.cloudflare.com/workers/wrangler/configuration/#top-level-only-keys) key in the [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/).

```txt
wrangler telemetry status
```

The following global flags work on every command:

* `--help` boolean
  * Show help.
* `--config` string (not supported by Pages)
  * Path to your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/).
* `--cwd` string
  * Run as if Wrangler was started in the specified directory instead of the current working directory.

***

## `check`

### `startup`

Generate a CPU profile of your Worker's startup phase.

After you run `wrangler check startup`, you can import the profile into Chrome DevTools or open it directly in VSCode to view a flamegraph of your Worker's startup phase. Additionally, when a Worker deployment fails with a startup time error Wrangler will automatically generate a CPU profile for easy investigation.

Note

This command measures performance of your Worker locally, on your own machine — which has a different CPU than when your Worker runs on Cloudflare. This means results can vary widely.

You should use the CPU profile that `wrangler check startup` generates in order to understand where time is spent at startup, but you should not expect the overall startup time in the profile to match exactly what your Worker's startup time will be when deploying to Cloudflare.

```sh
wrangler check startup
```

* `--args` string optional
  * To customise the way `wrangler check startup` builds your Worker for analysis, provide the exact arguments you use when deploying your Worker with `wrangler deploy`, or your Pages project with `wrangler pages functions build`. For instance, if you deploy your Worker with `wrangler deploy --no-bundle`, you should use `wrangler check startup --args="--no-bundle"` to profile the startup phase.
* `--worker` string optional
  * If you don't use Wrangler to deploy your Worker, you can use this argument to provide a Worker bundle to analyse. This should be a file path to a serialized multipart upload, with the exact same format as [the API expects](https://developers.cloudflare.com/api/resources/workers/subresources/scripts/methods/update/).
* `--pages` boolean optional
  * If you don't use a Wrangler config file with your Pages project (i.e. a Wrangler config file containing `pages_build_output_dir`), use this flag to force `wrangler check startup` to treat your project as a Pages project.

The following global flags work on every command:

* `--help` boolean
  * Show help.
* `--config` string (not supported by Pages)
  * Path to your [Wrangler configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/).
* `--cwd` string
  * Run as if Wrangler was started in the specified directory instead of the current working directory.

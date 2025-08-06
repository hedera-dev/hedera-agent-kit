# Available Hedera Plugins

The Hedera Agent Kit provides a comprehensive set of tools organized into **plugins**, which can be installed alongside the Hedera Agent Kit and used to extend the core funcitonality of the Hederak Agent Kit SDK. 
These tools can be used both by the conversational agent and when you are building with the SDK.

The Hedera services built into this agent toolkit are also implemented as plugins, you can see a description of each plugin in the [HEDERAPLUGINS.md](HEDERAPLUGINS.md) file, as well as list of the individual tools for each Hedera service that are included in each plugin.

## Available Third Party Plugins
_Coming Soon_

## Plugin Architecture

The tools are now organized into plugins, each containing a set functionality related to the Hedera service or project they are created for.

# Creating a Plugin
To create a plugin to be use with the Hedera Agent Kit, you will need to create a plugin in your own repository, publish an npm package, and provide a description of the functionality included in that plugin, as well as the required and optional parameters. 

Once you have a repository, published npm package, and a README with a description of the functionality included in that plugin in the README of your plugin's repo, as well as the required and optional parameters, you can add it to the Hedera Agent Kit by forking and opening a Pull Request to:

1.) Include the plugin as a bullet point under the "Available Third Party Plugins" section on this page. Include the name, a beirf description, and a link to the repository with the README, as well the URL linked to the published npm package.

2.) Include the same information in the README.md of this repository under the **Third Party Plugins* section.

Feel free to also reach out to the Hedera Agent Kit maintainers on Discord or another channel so we can test out your plugin, include it in our docs, and let our community know thorough marketing and community channels.

## Plugin Description Template

```markdown
## Plugin Name
This plugin was built by <?> for the <project, platform, etc>. It was built to enable <who?> to <do what?>

_Feel free to include a description of your project and how it can be used with the Hedera Agent Kit. 

### Installation

```bash
npm install <plugin-name>
```

### Usage

```javascript
import { <plugin-name> } from 'hedera-agent-kit';
```

```javascript
 const hederaAgentToolkit = new HederaLangchainToolkit({
    client,
    configuration: {
      context: {
        mode: AgentMode.AUTONOMOUS,
      },
      plugins: [coreHTSPlugin, coreAccountPlugin, coreConsensusPlugin, coreQueriesPlugin, <plugin-name>],
    },
  });
```

### Functionality
Describe the different tools or individual pieces of functionality included in this plugin, and how to use them.

| Tool Name                                       | Description                                        |Usage                                             |
| ----------------------------------------------- | -------------------------------------------------- |--------------------------------------------------------- |
| `YOUR_PLUGIN_TOOL_NAME`| What it does | How to use. Include a list of parameters and their descriptions|
| `YOUR_PLUGIN_TOOL_NAME`| What it does | How to use. Include a list of parameters and their descriptions|
```
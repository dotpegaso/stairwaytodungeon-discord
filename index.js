require("dotenv").config();
const { BOT_TOKEN } = process.env;

const fs = require("fs");
const { Client, Collection, Intents } = require("discord.js");
const api = require("./utils/api");

const myIntents = new Intents();
myIntents.add(
  Intents.FLAGS.GUILD_PRESENCES,
  Intents.FLAGS.GUILD_MEMBERS,
  Intents.FLAGS.GUILD_MESSAGES
);

const client = new Client({ intents: myIntents });

client.commands = new Collection();
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.once("ready", () => {
  console.log("Ready!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

client.on("guildMemberAdd", async (member) => {
  const { id, bot, username, discriminator, avatar } = member.user;
  const data = {
    discord_id: id,
    username,
    discriminator,
    avatar_hash: avatar,
  };

  if (bot) return;

  api({ method: "POST", url: `/players`, data }).then((res) => {
    console.log("New member: ", res);
  });
});

client.on("guildMemberRemove", async (member) => {
  const { id } = member;

  api({ method: "GET", url: `/players?discord_id=${id}` }).then((res) => {
    const api_id = res[0].id;

    api({ method: "DELETE", url: `/players/${api_id}` }).then((res) => {
      console.log("Member deleted from database", res);
    });
  });
});

client.on("message", (message) => {
  if (message.content.includes("atualizar_apelido")) {
    if (!message.guild.me.hasPermission("MANAGE_NICKNAMES"))
      return message.channel.send(
        "I don't have permission to change your nickname!"
      );
    message.member.setNickname(
      message.content.replace("atualizar_apelido ", "")
    );
  }
});

client.login(BOT_TOKEN);

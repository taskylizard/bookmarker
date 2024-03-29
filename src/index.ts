import { Client, MessageEmbed } from "discord.js";
import { config } from "dotenv";
import { intents } from "./utils";

config();

const client = new Client({
  intents: intents,
});

client.login(process.env.TOKEN);

client.once("ready", () => {
  console.log("hi we are rolling now");
});

client.on("messageReactionAdd", async (reaction, user) => {
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();
  if (user.bot) return;
  if (!reaction.message.guild) return;
  if (reaction.emoji.name === "🔖") {
    const embed = new MessageEmbed();
    const message = reaction.message;
    embed.fields.push(
      {
        name: "From",
        value: `${message.author}`,
        inline: true,
      },
      {
        name: "Link to Message",
        value: `[Jump to Message](${message.url})`,

        inline: true,
      },
      {
        name: "Channel",
        value: `<#${message.channel.id}>`,
        inline: false,
      },
    );

    // split long messages
    const chunks = message?.content?.match(/[\s\S]{1,1024}/g);

    for (const chunk of chunks!) {
      embed.fields.push({ name: "Full Message", value: chunk, inline: false });
    }

    // Add link to attachment
    if (message.attachments.size > 0) {
      const attachment = message.attachments.at(0)!.url;
      embed.fields.push({ name: "Attachment", value: attachment, inline: false });
      embed.setImage(attachment);
    }

    user.send({ embeds: [embed] });
  }
});

client.on("messageReactionRemove", async (reaction, user) => {
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();
  if (user.bot) return;
  if (!reaction.message.guild) return;
  if (reaction.emoji.name === "🔖") {
    await user.dmChannel?.messages.fetch().then(async (msg) => {
      const filtered = msg.filter((m) =>
        m.embeds.forEach((em) => em.fields.find((field) => field.name === "Full Message")?.value === reaction.message.content),
      );
      console.log(filtered);
      if (!filtered) return;
      filtered.forEach(async (m) => await m.delete());
    });
  }
});

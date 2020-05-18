module.exports = {
	name: "tagadd",
	async execute(param, message, args) {
		const config = param.config;
		const TagDB = param.TagDB;
		const getEmbed = param.getEmbed;

		const tagName = args.join(' ').toLowerCase();

		const duplicatedEmbed = getEmbed.execute(param, config.error_color, "Duplicated", `There's a tag named (\`${tagName}\`) already.`);
		const successEmbed = getEmbed.execute(param, config.info_color, "Success", `Succesfully add (\`${tagName}\`) tag.`);
		const waitingEmbed = getEmbed.execute(param, config.info_color, "Response", `Please write the response for this tag.\nType \`cancel\` to cancel the command.\n\n\`Timeout: 30 seconds.\``);
		const cancelEmbed = getEmbed.execute(param, config.error_color, "Canceled", `Command are canceled.`);
		const timeoutEmbed = getEmbed.execute(param, config.error_color, "Timeout", `Timeout, command are canceled.`);

		const isDuplicated = await TagDB.findOne({ where: { name: tagName } });
		if(isDuplicated) {
			return message.channel.send(duplicatedEmbed);
		} else {
			const filter = msg => msg.author.id == message.author.id;

			message.channel.send(waitingEmbed).then(() => {

				message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
					.then(async collected => {
						if (collected.first().content.toLowerCase() == "cancel") {
							return message.channel.send(cancelEmbed);
						} else {
							const content = collected.first().content;
							const addThis = await TagDB.create({
								name: tagName,
								content: content
							});
							if(addThis) {
								console.log(`Added [${tagName}] tag`);
								return message.channel.send(successEmbed);
							}
						}
					})
					.catch(collected => {
						return message.channel.send(timeoutEmbed);
					});

			});
		}
	}
};

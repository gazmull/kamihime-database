import { TextChannel } from 'discord.js';
import { Response } from 'express';
import Route from '../../struct/Route';

export default class DonateRoute extends Route {
  constructor () {
    super({
      id: 'donate',
      method: 'get',
      route: [ '/donate' ]
    });
  }

  public async exec (_, res: Response) {
    const channel = await this.client.discord.channels.fetch(this.client.auth.discord.channel) as TextChannel;
    const guild = channel ? channel.guild : null;
    const knownDonors = guild
      ? guild.members.cache
          .filter(e => e.roles.cache.has(this.client.auth.discord.donorID) && e.roles.cache.size >= 3)
          .map(e => e.user.username)
      : [];
    const anonDonors = guild
      ? guild.members.cache
          .filter(e => e.roles.cache.has(this.client.auth.discord.donorID) && e.roles.cache.size === 2)
          .size
      : 0;

    res.render('donate/donate', { knownDonors, anonDonors });
  }
}

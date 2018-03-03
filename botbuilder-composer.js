"use strict";
const EventEmitter = require('events');
const botbuilder = require('botbuilder');
module.exports = {
  compose: function (config) {
    let bot = config.bot || new botbuilder.UniversalBot();
    let plugins = config.plugins || [];
    let theme = config.theme || null;
    let buildEventManager = new EventEmitter();
    if ("function" == typeof theme) {
      theme = {
        init: theme,
        build: () => {
        }
      }

    }
    theme.init(bot, buildEventManager);
    let promises = [Promise.resolve(true)];
    plugins.forEach((item) => {
      promises.push(item.call(null, bot, buildEventManager,theme));
    });
    let pluginsResolved = Promise.all(promises)
    return pluginsResolved.then(() => {
        buildEventManager.emit('init', bot);
        return theme.build(bot);
      })
      .then(() => {
        buildEventManager.emit('complete', bot);
        return bot;
      })

  }
}

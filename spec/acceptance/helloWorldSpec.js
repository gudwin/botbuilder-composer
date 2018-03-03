'use strict';

const FIXTURE = 'Hello World!';
const SCRIPT = [
  {user: 'hi!'},
  {bot: FIXTURE},
  {endConversation: true}
];

const composer = require('../../');

const unit = require('botbuilder-unit');
const botbuilder = require('botbuilder');

describe('Test that composer able to build simpliest bot', function () {
  it('Test that theme could be a function', (done) => {
    composer.compose({
      theme: (bot, buildEventManager) => {
        bot.connector('console', new botbuilder.ConsoleConnector());
        bot.dialog('/', (session) => session.endConversation('Hello World!'));
        return Promise.resolve();
      }
    }).then((bot) => {
      return unit(bot, SCRIPT)
    }).then(done)
      .catch((err) => {
        fail(err);
        done();
      })

  })
  it('Test that library will leverage given bot instance', (done) => {
    let bot = new botbuilder.UniversalBot(new botbuilder.ConsoleConnector());
    bot.dialog('/', (session) => session.beginDialog('/test'))
    composer.compose({
        bot: bot,
        theme: (bot, buildEventManager) => {
          bot.dialog('/test', (session) => session.endConversation(FIXTURE))
          return Promise.resolve();
        },
        plugins: []
      })
      .then((bot) => {
        unit(bot, SCRIPT)
      })
      .then(done, () => {
        fail('Impossible case');
        done();
      })

  });
  it('Test that plugin will be called during build process', (done) => {
    composer.compose({
        theme: (bot, buildEventManager) => {
          bot.connector('console', new botbuilder.ConsoleConnector());
          bot.dialog('/', (session) => session.beginDialog('/test'))
          return Promise.resolve();
        },
        plugins: [
          (bot, buildEventManager) => {
            bot.dialog('/test', (session) => {
              session.endConversation(FIXTURE);
            })
          }
        ]
      })
      .then((bot) => {
        unit(bot, SCRIPT)
      })
      .then(done, () => {
        fail('Impossible case');
        done();
      })

  });
  it('Test method could be an object with two methods init and build', (done) => {
    composer.compose({
      theme: {
        init: (bot, buildEventManager) => {
          bot.connector('console', new botbuilder.ConsoleConnector());
          bot.dialog('/', (session) => session.beginDialog('/test'))
        },
        build: (bot, buildEventManager) => {
          bot.dialog('/test', (session) => session.endConversation(FIXTURE))
          return Promise.resolve();
        }
      }
    }).then((bot) => {
        unit(bot, SCRIPT)
      })
      .then(done, () => {
        fail('Impossible case');
        done();
      })

  })
})
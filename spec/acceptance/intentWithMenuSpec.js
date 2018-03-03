'use strict';

const IntentWithMenu = require("../../src/themes/IntentWithMenu");
const composer = require("../../");
const unit = require("botbuilder-unit");
const botbuilder = require("botbuilder");

describe('Test IntentWithMenu Template', function describeCallback() {
  it('test empty template', (done) => {
    let script, theme;
    script = [
      {user: 'hi'},
      {bot: 'Nice to meet you!'},
      {user: 'what\'s your name?'},
      {bot: 'Sorry command "what\'s your name?" not supported yet'},
      {user: 'hi'},
      {bot: 'Sorry command "hi" not supported yet'}
    ]
    theme = new IntentWithMenu();
    composer.compose({theme: theme})
      .then((bot) => {
        return unit(bot, script);
      })
      .then(done, fail);
  });
  it('test default dialog', (done) => {
    let script, plugins;
    script = [
      {user: 'hi'},
      {bot: 'Nice to meet you!'},
      {user: 'hi'},
      {bot: 'Who said that?!'},
      {endConversation: true}
    ]
    plugins = [(bot, eventManager, theme) => {
      theme.setDefaultDialogId('/my_default');
      bot.dialog('/my_default', (session) => {
        session.endConversation('Who said that?!');
      })
    }]
    composer.compose({theme: new IntentWithMenu(), plugins: plugins})
      .then((bot) => {
        return unit(bot, script);
      })
      .then(done, fail);
  })
  it('test suggested actions', (done) => {
    let script, suggestedActions;
    let theme = new IntentWithMenu();
    theme.addMenuItem({label: 'helloLabel', message: 'helloMessage'});
    theme.addMenuItem({label: 'worldLabel', message: 'worldMessage'});
    suggestedActions = [
      botbuilder.CardAction.imBack(null, 'helloMessage', 'helloLabel'),
      botbuilder.CardAction.imBack(null, 'worldMessage', 'worldLabel')
    ];
    script = [
      {user: 'hi'},
      {
        bot: IntentWithMenu.consts.firstRunMessage,
        suggestedActions: suggestedActions
      },
      {user: 'hi'},
      {
        bot: 'Sorry command "hi" not supported yet',
        suggestedActions: suggestedActions
      }
    ];


    composer.compose({
        theme: theme
      })
      .then((bot) => {
        return unit(bot, script);
      })
      .then(done, fail);
  });
  it('test that I\' able to inject custom recognizers and intets', (done) => {
    let bot, script, theme;
    theme = new IntentWithMenu();
    theme.addRecognizer({
      recognize: (context, callback) => {
        if (context.message.text == 'help') {
          callback(null,{
            entities: [],
            intent: 'onHelp',
            intents: [],
            score: 1
          })
        } else {
          callback(null,{
            entities: [],
            intent: null,
            intents: [],
            score: 0
          })
        }
      }
    });
    bot = new botbuilder.UniversalBot();
    theme.addIntent('onHelp', '/help');
    bot.dialog('/help', (session) => {
      session.endConversation('Help will arrive soon');
    });
    script = [
      {user: 'hi!'},
      {bot: IntentWithMenu.consts.firstRunMessage},
      {user: 'help'},
      {bot: 'Help will arrive soon'},
      {endConversation: true}
    ];

    composer.compose({theme, bot})
      .then(bot => unit(bot, script))
      .then(done, fail);
  });
  it('test first run & greeting dialogs', (done) => {
    let FIXTURE_FIRST_RUN = 'Nice to meet you';
    let FIXTURE_GREETING = 'Welcome back!';
    let bot, script, theme;
    script = [
      {user: 'hi'},
      {bot: FIXTURE_FIRST_RUN},
      {endConversation: true},
      {user: 'say what?'},
      {bot: FIXTURE_GREETING},
      {endConversation: true}
    ];
    let plugins = [];
    plugins.push((bot, theme) => {
      bot.dialog('/firstRun', (session)=> {
        session.endConversation(FIXTURE_FIRST_RUN);
      })
      bot.dialog('/greeting', (session)=> {
        session.endConversation(FIXTURE_GREETING);
      })
    })
    theme = new IntentWithMenu();
    theme.setFirstRunDialogId('/firstRun');
    theme.setGreetingDialogId('/greeting');
    composer.compose({theme, plugins})
      .then((bot) => unit(bot, script))
      .then(done, fail);
  });
  it('test greeting dialog', (done) => {
    const FIXTURE = 'Nice to meet you back';
    let script, theme, plugins;
    script = [
      {session:{userData:{firstRun : true}}},
      {user: 'hi'},
      {bot: FIXTURE},
      {endConversation: true},
      {user: 'say it again'},
      {bot: FIXTURE},
      {endConversation: true}
    ]
    plugins = [];
    plugins.push((bot, buildEventManager, theme) => {
      bot.dialog('/my_greeting', (session)=> {
        session.endConversation(FIXTURE);
      })
      theme.setGreetingDialogId('/my_greeting');
    })

    theme = new IntentWithMenu();
    composer.compose({theme, plugins})
      .then((bot) => unit(bot, script))
      .then(done);
  });
})
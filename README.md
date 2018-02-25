> _**WARNING! The Library still in active research & development be warned that interfaces will be changed in minor versions before 1.0 release!**_ 

# Glossary
 
- **theme** - a function or object which will be called to produce/enhance a bot instance. Integrated with event emitter, so able to produce custom events for external subcriber; 
- **plugin** - a callback function that used to extend a bot instance produced from template. Use to be smaller than theme, but to contain generic reusable logic. 
 
# Description

The Library used to compose chatbots from components that leverage [Microsoft Bot Framework](https://dev.botframework.com/). 
 
# Quick Start


# Installation 

`npm install --save-dev botbuilder-composer`

# Documentation

## Build Sequence

![Chatbot build sequence diagram](https://github.com/gudwin/botbuilder-composer/blob/master/doc/compose-sequence.png?raw=true)

## composer.compose(config)

Returns a Universal bot instance. Config fields:
 - **theme** function(Universalbot bot, EventEmitter buildEventManager)|ThemeObject  
 - **plugins** function[], array of callback. Every plugin should return a Promise, once all plugin resolved event __init__ will be executed 
 - (optional) **bot** UniversalBot - if empty, compose will create instance of UniversalBot and will pass it to theme and callbacks. 
 
## ThemeObject 
 - **beforeInit**: function(<Universalbot> bot, <EventEmitter> buildEventManager) 
 - **build**: function(<Universalbot> bot, <EventEmitter> buildEventManager). Value returned by function will be resolved as a promise. 
 
## Standard Events
 - **init** - called when theme and all plugin callbacks executed
 - **complete** -  called after 
  
# Example
  
# Changelog 
- 0.1.0 - initial release
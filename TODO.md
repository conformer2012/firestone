remove use of cardsfacade in the "server" part, as we don't want to go through ipc when not necessary
issue with going though IPC calls for cards / i18n: it becomes async
could simply duplicate the data for each window, though it increases the memory usage

add class that listens to all observables from mainwindow, and that emits the new values through IPC
-> will trigger all firstSubscribe calls...
in facade, instead of getting the reference to the main service, listen to IPC calls and populate the observable with all the new values. How to properly type this?
Also need some code in main to do the glue between both
some kind of generic "pass-through" that simply forward the data to the channel, and then the channel filters it?

to clean / remove
MercenariesHeroSelectedEvent

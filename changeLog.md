okay, a bunch of things got changed prolly
    -uberduck commands now work properly 
    -removed hearlocket because it dosent want to work on my server
    -added random audio when nothing is playing, this can be disabled in the config

HOW TO GET UBERDUCK REFRESH TOKEN:
after createing an uberduck account, open the text to speech thing.
go into the dev tooks and goto network, refresh the page.
do alt-f or search for refresh_token.
under the response in set-cookies copy the refresh_token= up to the semicolon.
paste the refresh_token= in the src/commands/ext/UDconf.json file under refresh_token, you can leave the token feild blank, it will be replaced.
now do NOT open uberduck under that account ever again unless you want to redo the whole process.

sometimes, the voice thing just dosent want to work on first run,
to fix this just delete node_modules and do an npm install.
# AEOrank CLI demo — regenerate with: vhs .github/demo.tape
# Produces .github/demo.gif for the README.

Output .github/demo.gif

Set FontFamily "JetBrainsMono Nerd Font"
Set FontSize 14
Set Width 1280
Set Height 780
Set Padding 28
Set Theme { "name": "aeorank", "black": "#0f0f0f", "red": "#e8590c", "green": "#28a745", "yellow": "#f5a623", "blue": "#5eb1ff", "magenta": "#cc66ff", "cyan": "#00b8a9", "white": "#e8e8e8", "brightBlack": "#555555", "brightRed": "#ff7a2e", "brightGreen": "#4fd670", "brightYellow": "#ffc255", "brightBlue": "#8dcfff", "brightMagenta": "#e79cff", "brightCyan": "#33d4c6", "brightWhite": "#ffffff", "background": "#fafaf7", "foreground": "#111111", "cursor": "#e8590c", "selection": "#e8590c33" }
Set TypingSpeed 45ms
Set PlaybackSpeed 1.0
Set WaitTimeout 90s

# Clean prompt
Hide
Type "clear && export PS1='$ '"
Enter
Sleep 300ms
Show

# The money shot — the exact command from the README
Type "npx aeorank-cli scan https://stripe.com --max-pages 3 --no-files"
Sleep 600ms
Enter

# Hold for the scan + output to fully render
Sleep 32s

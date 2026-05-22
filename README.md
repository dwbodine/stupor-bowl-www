# Stupor Bowl website

This is the main website for the yearly word-of-mouth competition amongst friends/family known as the Stupor Bowl.

Interesting points:

- no money is involved, but users answer a series of "prop bet" style questions to earn points and when the game is over, the "real" answers are posted and the system tallies the results, with the "winner" being the one with most points.
- all data is served by the Stupor Bowl API, which uses GraphQL
- GraphQL access is facilitated by TanStack
- app is a React 19+ app with Typescript running on Vite framework using nginx inside a Docker container
- routing is through static React Page routing
- access to answering questions or viewing "pending"/"results" pages is controlled by the Django admin backend, including an auto-shutoff when the game starts

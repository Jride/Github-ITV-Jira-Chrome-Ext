The following chrome extension will enable you to manage the Jira tickets directly from the Pull Request page. It will allow you to move the ticket into Code Review when opening a new pull request. When you are ready to merge the ticket you can then move the ticket into Dev Complete.

The extension extracts the ticket information from the branch name so be sure to follow the Branch Naming strategy mentioned below.

You can install the chrome extension from the [Chrome Web Store](https://chrome.google.com/webstore/detail/github-itv-jira/ggagmghbcfegjeekpjcplcmokpjhmajh)

![](https://lh3.googleusercontent.com/iFYxH9czXUvEm0f7i9GhwB2U1wMfF-wu3gVpS1uL-1sF9t2gBCbm8EV7_sqiOT_eBOoKo645=w640-h400-e365)

![](https://lh3.googleusercontent.com/SLzJ_tMDHBob1ZpFXrlvz5HERQwsA7wGu-Tiia-9mDvgy0SaZ5-_mlBZZP0o_8honHBoYItMhfU=w640-h400-e365)

![](https://lh3.googleusercontent.com/SWozYH5wO86R6Yy5akJkrgc2A3EBM_9znjRUp0638dI0JLO7p4v-rdJYKNSwrpxuXAjqsGIBxw=w640-h400-e365)


**Branching strategy**

# Feature branches

When creating a new feature you will need to create a new branch from `develop` with the format below. In the examples below `IHIA-1234` refers to the `id` of the ticket that relates to the feature. Using this `id` will allow the branches to link with Jira. Everything after `IHIA-1234` in the examples below describes the feature using `_` as a separator. This style is also used for branches for bug fixes.

```
feature/IHIA-1234_some_iOS_feature
```

# Release branches

To create a release branch you need to take a branch from `develop` using the format in the example below where `1.5` represents the version number. If features are needed to be added to the release you can take a branch from the release branch adding the ticket `id` (`IHIA-1234` in the example below) and description as shown in the examples below. In the example below `release/1.5` is the main release branch and the other examples are features that will be merged back into the release branch.

```
release/1.5
release_1_5/IHIA-1234_some_iOS_feature
```

# Work in progress branches

Work in progress branches are used for long running features that may need to be excluded from `develop` for some reason, for example perhaps ITV want to build the feature but want to delay its release so it cannot be included in the main `develop` branch. In the example below `wip_long_running_feature/wip` is the main work in progress branch and the other examples are features that will be merged back into the work in progress branch.

```
wip_long_running_feature/wip
wip_long_running_feature/IHIA-1234_some_iOS_feature
```

# Standalone MDF Model Viewer

This package is a refactored, standalone version of the Bento
framework "Data Model Navigator" React component.

It is meant to be pointed at any arbitrary graph model specified by a
set of [MDF](https://github.com/CBIIT/bento-mdf) files, to create an
annotated data dictionary with an interactive graphical rendering of
the model.

To start it out of the box:

     git clone https://github.com/majensen/data-model-navigator
     cd data-model-navigator
     npm --legacy-peer-deps install
     npm start

which should open the model viewer onto the
[Integrated Canine Data Commons](https://caninecommons.cancer.gov)
graph data model.

## Config and setup

The example app in [index.jsx](/src/index.jsx) show the key steps.

* Import the Redux `store`
* Import the `ModelNavigator` component.
* Read the MDF with `loadMDF` to obtain the `model` object.
* Create the `config` object by using `createConfig` on the config JS file.
* Use Redux `Provider`, and providers for `ModelContext` and `ConfigContext` to wrap the `DataDictionary` component.

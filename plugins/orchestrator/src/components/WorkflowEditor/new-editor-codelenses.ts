import {
  SwfLanguageServiceCommandArgs,
  SwfLanguageServiceCommandIds,
  SwfLanguageServiceCommandTypes,
} from '@kie-tools/serverless-workflow-language-service/dist/api';
import {
  SwfJsonLanguageService,
  SwfYamlLanguageService,
} from '@kie-tools/serverless-workflow-language-service/dist/channel';
import { openWidget } from '@kie-tools/serverless-workflow-text-editor/dist/editor/textEditor/augmentation/widgets';
import * as monaco from 'monaco-editor';

export function initAugmentationCommands(
  editorInstance: monaco.editor.IStandaloneCodeEditor,
): SwfLanguageServiceCommandIds {
  return {
    'swf.ls.commands.RefreshServiceRegistries': editorInstance.addCommand(
      0,
      async (
        ctx,
        args: SwfLanguageServiceCommandArgs['swf.ls.commands.RefreshServiceRegistries'],
      ) => {},
    )!,
    'swf.ls.commands.LogInServiceRegistries': editorInstance.addCommand(
      0,
      async (
        ctx,
        args: SwfLanguageServiceCommandArgs['swf.ls.commands.LogInServiceRegistries'],
      ) => {},
    )!,
    'swf.ls.commands.OpenServiceRegistriesConfig': editorInstance.addCommand(
      0,
      async (
        ctx,
        args: SwfLanguageServiceCommandArgs['swf.ls.commands.OpenServiceRegistriesConfig'],
      ) => {},
    )!,
    'swf.ls.commands.ImportFunctionFromCompletionItem':
      editorInstance.addCommand(
        0,
        async (
          ctx,
          args: SwfLanguageServiceCommandArgs['swf.ls.commands.ImportFunctionFromCompletionItem'],
        ) => {},
      )!,
    'swf.ls.commands.ImportEventFromCompletionItem': editorInstance.addCommand(
      0,
      async (
        ctx,
        args: SwfLanguageServiceCommandArgs['swf.ls.commands.ImportEventFromCompletionItem'],
      ) => {},
    )!,
    'editor.ls.commands.OpenCompletionItems': editorInstance.addCommand(
      0,
      async (
        ctx,
        args: SwfLanguageServiceCommandArgs['editor.ls.commands.OpenCompletionItems'],
      ) => {
        editorInstance.setPosition({
          lineNumber: args.newCursorPosition.line + 1,
          column: args.newCursorPosition.character + 1,
        });
        editorInstance.trigger(
          'OpenCompletionItemsAtTheBottom',
          'editor.action.triggerSuggest',
          {},
        );
      },
    )!,
    'swf.ls.commands.OpenFunctionsWidget': editorInstance.addCommand(
      0,
      async (
        ctx,
        args: SwfLanguageServiceCommandArgs['swf.ls.commands.OpenFunctionsWidget'],
      ) => {
        openWidget(editorInstance, {
          position: new monaco.Position(
            args.position.line,
            args.position.character,
          ),
          widgetId: 'swf.functions.widget',
          backgroundColor: 'lightgreen',
          domNodeHolder: {},
          onReady: ({ container }) => {
            console.info('Opening functions widget..');
            // Part of an example
            //
            // ReactDOM.render(
            //   <EmbeddedDivPingPong
            //     apiImpl={pingPongChannelApiImpl}
            //     name={"React " + Math.random()}
            //     targetOrigin={window.location.origin}
            //     renderView={renderPingPongReact}
            //   />,
            //   container
            // );
          },
          onClose: ({ container }) => {
            // Part of an example
            //
            // return ReactDOM.unmountComponentAtNode(container);
          },
        });
      },
    )!,
    'swf.ls.commands.OpenStatesWidget': editorInstance.addCommand(
      0,
      async (
        ctx,
        args: SwfLanguageServiceCommandArgs['swf.ls.commands.OpenStatesWidget'],
      ) => {
        openWidget(editorInstance, {
          position: new monaco.Position(
            args.position.line,
            args.position.character,
          ),
          widgetId: 'swf.states.widget',
          backgroundColor: 'lightblue',
          domNodeHolder: {},
          onReady: ({ container }) => {
            console.info('Opening states widget..');
            // Part of an example
            //
            // ReactDOM.render(
            //   <EmbeddedDivPingPong
            //     apiImpl={pingPongChannelApiImpl}
            //     name={"React " + Math.random()}
            //     targetOrigin={window.location.origin}
            //     renderView={renderPingPongReact}
            //   />,
            //   container
            // );
          },
          onClose: ({ container }) => {
            // Part of an example
            //
            // return ReactDOM.unmountComponentAtNode(container);
          },
        });
      },
    )!,
  };
}

export function initJsonCodeLenses(
  isReadOnly: boolean,
  commandIds: SwfLanguageServiceCommandIds,
  languageServer: SwfJsonLanguageService | SwfYamlLanguageService,
): monaco.IDisposable {
  if (isReadOnly) {
    return {
      dispose: () => {},
    };
  }

  return monaco.languages.registerCodeLensProvider(['json', 'yaml'], {
    provideCodeLenses: async (model, cancellationToken) => {
      const lsCodeLenses = await languageServer.getCodeLenses({
        uri: model.uri.toString(),
        content: model.getValue(),
      });

      if (cancellationToken.isCancellationRequested) {
        return;
      }

      const monacoCodeLenses: monaco.languages.CodeLens[] = lsCodeLenses.map(
        c => ({
          command: c.command
            ? {
                id: commandIds[
                  c.command.command as SwfLanguageServiceCommandTypes
                ],
                arguments: c.command.arguments,
                title: c.command.title,
              }
            : undefined,
          range: {
            startLineNumber: c.range.start.line + 1,
            endLineNumber: c.range.end.line + 1,
            startColumn: c.range.start.character + 1,
            endColumn: c.range.end.character + 1,
          },
        }),
      );

      return {
        lenses: monacoCodeLenses,
        dispose: () => {},
      };
    },
  });
}
